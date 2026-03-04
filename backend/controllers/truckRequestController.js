const TruckRequest = require("../models/TruckRequest");
const Truck = require("../models/Truck");
const Job = require("../models/Job");
const Trip = require("../models/Trip");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");
const sendNotification = require("../utils/sendNotification");

/**
 * Create Truck Request (Shipper only)
 */
exports.createRequest = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "shipper") {
    return next(new AppError("Only shippers can send truck requests", 403));
  }

  const { truckId, jobId, message } = req.body;
  if (!jobId) return next(new AppError("Job is required", 400));

  const job = await Job.findById(jobId);
  if (!job) return next(new AppError("Job not found", 404));
  if (job.shipper.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only request a truck for your own job", 403));
  }
  if (job.status !== "open") {
    return next(new AppError("Job is no longer open for requests", 400));
  }

  const truck = await Truck.findById(truckId).populate("transporter");
  if (!truck) return next(new AppError("Truck not found", 404));

  const existing = await TruckRequest.findOne({
    shipper: req.user._id,
    truck: truckId,
    job: jobId,
    status: "pending",
  });
  if (existing) {
    return next(new AppError("You already have a pending request for this truck for this job", 400));
  }

  const request = await TruckRequest.create({
    shipper: req.user._id,
    job: jobId,
    truck: truckId,
    message: message || "",
  });

  await sendNotification({
    userId: truck.transporter._id,
    type: "truck_request",
    message: `${req.user.name} requested truck ${truck.truckNumber} for job "${job.title}"`,
    relatedId: request._id,
  });

  const populated = await TruckRequest.findById(request._id)
    .populate("shipper", "name email phone")
    .populate("job", "title pickupLocation deliveryLocation requiredCapacity status")
    .populate({ path: "truck", populate: { path: "transporter", select: "name email phone" } });

  res.status(201).json({
    success: true,
    data: populated,
  });
});

/**
 * Get My Requests (Transporter - requests for their trucks)
 */
exports.getMyRequests = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "transporter") {
    return next(new AppError("Only transporters can view truck requests", 403));
  }

  const requests = await TruckRequest.find({})
    .populate("shipper", "name email phone")
    .populate("job", "title pickupLocation deliveryLocation requiredCapacity status")
    .populate({
      path: "truck",
      populate: { path: "transporter", select: "name" },
    })
    .sort({ createdAt: -1 });

  const myRequests = requests.filter(
    (r) => r.truck?.transporter?._id?.toString() === req.user._id.toString()
  );

  res.status(200).json({
    success: true,
    count: myRequests.length,
    data: myRequests,
  });
});

/**
 * Accept Truck Request (Transporter) - accepts job, creates trip, updates all modules
 */
exports.acceptRequest = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "transporter") {
    return next(new AppError("Only transporters can accept requests", 403));
  }

  const request = await TruckRequest.findById(req.params.id)
    .populate("job")
    .populate("truck")
    .populate("shipper");

  if (!request) return next(new AppError("Request not found", 404));
  if (request.truck?.transporter?.toString() !== req.user._id.toString()) {
    return next(new AppError("This request is for another transporter's truck", 403));
  }
  if (request.status !== "pending") {
    return next(new AppError("Request is no longer pending", 400));
  }

  const job = await Job.findById(request.job._id);
  if (!job) return next(new AppError("Job not found", 404));
  if (job.status !== "open") {
    return next(new AppError("Job is no longer open", 400));
  }

  const truck = await Truck.findById(request.truck._id);
  if (!truck) return next(new AppError("Truck not found", 404));
  if (truck.availability !== "available") {
    return next(new AppError("Truck is not available", 400));
  }

  // 1. Update job: accepted, assign transporter
  job.status = "accepted";
  job.transporter = req.user._id;
  await job.save();

  // 2. Create trip (so it appears in My Trips, Shipper Trips, etc.)
  const trip = await Trip.create({
    job: job._id,
    transporter: req.user._id,
    truck: truck._id,
    status: "accepted",
    startedAt: new Date(),
  });

  // 3. Mark truck busy
  truck.availability = "busy";
  await truck.save();

  // 4. Update this request to accepted
  request.status = "accepted";
  await request.save();

  // 5. Decline other pending requests for the same job
  await TruckRequest.updateMany(
    { job: job._id, _id: { $ne: request._id }, status: "pending" },
    { $set: { status: "declined" } }
  );

  // 6. Notify shipper
  await sendNotification({
    userId: job.shipper,
    type: "job_accepted",
    message: "Your job has been accepted by a transporter.",
    relatedId: trip._id,
  });

  res.status(200).json({
    success: true,
    message: "Request accepted. Job and trip created.",
    data: { request, job, trip },
  });
});

/**
 * Reject Truck Request (Transporter)
 */
exports.rejectRequest = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "transporter") {
    return next(new AppError("Only transporters can reject requests", 403));
  }

  const request = await TruckRequest.findById(req.params.id).populate("truck");

  if (!request) return next(new AppError("Request not found", 404));
  if (request.truck?.transporter?.toString() !== req.user._id.toString()) {
    return next(new AppError("This request is for another transporter's truck", 403));
  }
  if (request.status !== "pending") {
    return next(new AppError("Request is no longer pending", 400));
  }

  request.status = "declined";
  await request.save();

  res.status(200).json({
    success: true,
    message: "Request declined",
    data: request,
  });
});
