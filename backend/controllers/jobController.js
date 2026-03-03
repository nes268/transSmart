const Job = require("../models/Job");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

// Create Job (Shipper Only)
exports.createJob = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "shipper") {
    return next(new AppError("Only shippers can post jobs", 403));
  }

  const { title, description, pickupLocation, deliveryLocation, price } = req.body;

  const job = await Job.create({
    title,
    description,
    pickupLocation,
    deliveryLocation,
    price,
    shipper: req.user._id,
  });

  if (!job) {
    return next(new AppError("Job creation failed", 400));
  }

  res.status(201).json({
    success: true,
    data: job,
  });
});

// Get All Jobs
exports.getAllJobs = asyncHandler(async (req, res, next) => {
  const {
    status,
    minPrice,
    maxPrice,
    pickup,
    delivery,
    sort,
  } = req.query;

  let filter = {};

  if (status) {
    filter.status = status;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (pickup) {
    filter.pickupLocation = { $regex: pickup, $options: "i" };
  }

  if (delivery) {
    filter.deliveryLocation = { $regex: delivery, $options: "i" };
  }

  let query = Job.find(filter)
    .populate("shipper", "name email")
    .populate("transporter", "name email");

  if (sort === "price") {
    query = query.sort({ price: 1 });
  } else if (sort === "latest") {
    query = query.sort({ createdAt: -1 });
  }

  const jobs = await query;

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
  });
});

// Accept Job
exports.acceptJob = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "transporter") {
    return next(new AppError("Only transporters can accept jobs", 403));
  }

  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  if (job.status !== "open") {
    return next(new AppError("Job already accepted or completed", 400));
  }

  job.status = "accepted";
  job.transporter = req.user._id;

  await job.save();

  res.json({
    success: true,
    message: "Job accepted successfully",
    data: job,
  });
});

// Complete Job
exports.completeJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  if (job.transporter.toString() !== req.user._id.toString()) {
    return next(new AppError("Only assigned transporter can complete this job", 403));
  }

  job.status = "completed";
  await job.save();

  res.json({
    success: true,
    message: "Job marked as completed",
    data: job,
  });
});
