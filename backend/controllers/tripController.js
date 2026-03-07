const Trip = require("../models/Trip");
const Job = require("../models/Job");
const Truck = require("../models/Truck");
const Payment = require("../models/Payment");
const GreenScore = require("../models/GreenScore");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");
const sendNotification = require("../utils/sendNotification");

/**
 * Accept Job & Create Trip
 */
exports.createTrip = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "transporter") {
    return next(new AppError("Only transporters can accept jobs", 403));
  }

  const { jobId, truckId } = req.body;

  const job = await Job.findById(jobId);
  if (!job) return next(new AppError("Job not found", 404));

  const truck = await Truck.findById(truckId);
  if (!truck) return next(new AppError("Truck not found", 404));

  if (truck.transporter.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to use this truck", 403));
  }

  if (truck.availability !== "available") {
    return next(new AppError("Truck is not available", 400));
  }

  const requiredCapacity = Number(job.requiredCapacity) || 0;
  if (requiredCapacity > 0 && truck.capacity < requiredCapacity) {
    return next(new AppError("Truck capacity is insufficient for this job", 400));
  }

  const activeTrip = await Trip.findOne({
    transporter: req.user._id,
    status: { $in: ["accepted", "in_transit", "delivered"] },
  });
  if (activeTrip) {
    return next(new AppError("You have a job in progress. Complete it before accepting another job.", 400));
  }

  const trip = await Trip.create({
    job: jobId,
    transporter: req.user._id,
    truck: truckId,
    status: "accepted",
    startedAt: new Date(),
  });

  // Mark truck busy
  truck.availability = "busy";
  await truck.save();

  // Notify shipper
  await sendNotification({
    userId: job.shipper,
    type: "job_accepted",
    message: "Your job has been accepted by a transporter.",
    relatedId: trip._id,
  });

  // Emit trip:created for real-time dashboard update
  const populatedTrip = await Trip.findById(trip._id)
    .populate("job", "title pickupLocation deliveryLocation price")
    .populate("transporter", "name phone")
    .populate("truck", "truckNumber");
  if (global.io) {
    global.io.to(job.shipper.toString()).emit("trip:created", { trip: populatedTrip });
  }

  res.status(201).json({
    success: true,
    data: trip,
  });
});

/**
 * Update Trip Status
 */
exports.updateTripStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const trip = await Trip.findById(req.params.id).populate("job");
  if (!trip) return next(new AppError("Trip not found", 404));

  if (trip.transporter.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  trip.status = status;

  if (status === "completed") {
    trip.completedAt = new Date();

    const truck = await Truck.findById(trip.truck);
    truck.availability = "available";
    await truck.save();

    const jobDoc = trip.job;
    const jobId = jobDoc?._id || trip.job;
    if (jobId) {
      await Job.findByIdAndUpdate(jobId, { status: "completed" });
    }

    const routeGreenScore = jobDoc?.optimizedRoute?.greenScore;
    const ecoScore = routeGreenScore != null
      ? routeGreenScore
      : truck.fuelType === "electric"
        ? 85
        : truck.fuelType === "petrol"
          ? 60
          : 50;
    await GreenScore.create({
      transporter: trip.transporter,
      score: Math.round(ecoScore),
      trip: trip._id,
      job: jobId,
    });

    await sendNotification({
      userId: trip.job.shipper,
      type: "job_completed",
      message: "Your delivery has been completed.",
      relatedId: trip._id,
    });
  }

  await trip.save();

  res.status(200).json({
    success: true,
    data: trip,
  });
});

/**
 * Update Live Location
 */
exports.updateLiveLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: "Trip not found" });

  trip.currentLocation = { lat, lng };
  await trip.save();

  // Emit via socket
  global.io.to(req.params.id).emit("liveLocation", {
    lat,
    lng,
  });

  res.status(200).json({ success: true });
});

/**
 * Get My Trips (Transporter)
 */
exports.getMyTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ transporter: req.user._id })
    .populate("job")
    .populate("truck");

  const jobIds = trips.map((t) => t.job?._id || t.job).filter(Boolean);
  const paidPayments = await Payment.find({
    job: { $in: jobIds },
    transporter: req.user._id,
    status: "paid",
  }).select("job");
  const paidJobIds = new Set(paidPayments.map((p) => p.job?.toString()).filter(Boolean));

  const tripsWithPayment = trips.map((t) => {
    const jobId = t.job?._id?.toString?.() || t.job?.toString?.();
    const paid = jobId ? paidJobIds.has(jobId) : false;
    return { ...t.toObject(), paymentStatus: paid ? "paid" : "yet_to_pay" };
  });

  res.status(200).json({
    success: true,
    count: tripsWithPayment.length,
    data: tripsWithPayment,
  });
});

/**
 * Get Shipper Trips (trips for jobs created by shipper)
 */
exports.getShipperTrips = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "shipper") {
    return next(new AppError("Only shippers can access this", 403));
  }

  const trips = await Trip.find({})
    .populate("job")
    .populate("truck")
    .populate("transporter", "name email phone");

  const shipperTrips = trips.filter((t) => t.job && t.job.shipper && t.job.shipper.toString() === req.user._id.toString());

  res.status(200).json({
    success: true,
    count: shipperTrips.length,
    data: shipperTrips,
  });
});

/**
 * Get Single Trip (Transporter or Shipper with access)
 */
exports.getTripById = asyncHandler(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id)
    .populate("job")
    .populate("truck")
    .populate("transporter", "name email phone");

  if (!trip) return next(new AppError("Trip not found", 404));

  const transporterId = trip.transporter._id?.toString?.() || trip.transporter.toString();
  const shipperId = trip.job?.shipper?._id?.toString?.() || trip.job?.shipper?.toString?.();
  const isTransporter = transporterId === req.user._id.toString();
  const isShipper = shipperId === req.user._id.toString();

  if (!isTransporter && !isShipper) {
    return next(new AppError("Not authorized to view this trip", 403));
  }

  res.status(200).json({
    success: true,
    data: trip,
  });
});
