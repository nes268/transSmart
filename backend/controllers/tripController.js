const Trip = require("../models/Trip");
const Job = require("../models/Job");
const Truck = require("../models/Truck");
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
    userId: job.createdBy || job.shipper,
    type: "job_accepted",
    message: "Your job has been accepted by a transporter.",
    relatedId: trip._id,
  });

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

    await sendNotification({
      userId: trip.job.createdBy || trip.job.shipper,
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
 * Get My Trips
 */
exports.getMyTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ transporter: req.user._id })
    .populate("job")
    .populate("truck");

  res.status(200).json({
    success: true,
    count: trips.length,
    data: trips,
  });
});
