const Job = require("../models/Job");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

// Create Job (Shipper Only)
exports.createJob = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "shipper") {
    return next(new AppError("Only shippers can post jobs", 403));
  }

  const { title, description, pickupLocation, deliveryLocation, price, requiredCapacity, preferredDeliveryDate } = req.body;

  const job = await Job.create({
    title,
    description,
    pickupLocation,
    deliveryLocation,
    price,
    requiredCapacity: requiredCapacity ? Number(requiredCapacity) : 0,
    preferredDeliveryDate: preferredDeliveryDate ? new Date(preferredDeliveryDate) : null,
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
    mine,
  } = req.query;

  let filter = {};

  if (mine === "true" && req.user?.role === "shipper") {
    filter.shipper = req.user._id;
  }

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
    .populate("transporter", "name email phone");

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

/**
 * Get Return Load Suggestions
 * After completion: drop/delivery location → search for open jobs whose pickup is in that city or state.
 * E.g. Delivered to "Bangalore, Karnataka" → find jobs from Bangalore, Mysore, Hubli, etc. (same city/state).
 * Driver earns on return trip instead of empty backhaul.
 */
exports.getReturnLoads = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.jobId)
    .populate("shipper", "name")
    .lean();

  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  // Drop location after completion
  const deliveryLocation = (job.deliveryLocation || "").trim();
  if (!deliveryLocation) {
    return res.status(200).json({
      success: true,
      message: "No delivery location to match return loads",
      data: [],
      count: 0,
    });
  }

  // Extract city and state from END of address - e.g. "... Electronic City, Bengaluru, Karnataka" → city: Bengaluru, state: Karnataka
  const parts = deliveryLocation.split(",").map((p) => p.trim()).filter(Boolean);
  const state = parts.length >= 1 ? parts[parts.length - 1] : "";
  const city = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || deliveryLocation;

  const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const conditions = [];
  if (city && city.length >= 2) {
    conditions.push({ pickupLocation: new RegExp(escapeRegex(city), "i") });
  }
  if (state && state.length >= 2) {
    conditions.push({ pickupLocation: new RegExp(escapeRegex(state), "i") });
  }
  if (conditions.length === 0) {
    conditions.push({ pickupLocation: new RegExp(escapeRegex(deliveryLocation), "i") });
  }

  // Find open jobs where pickup is in same city OR same state as drop location
  const returnLoads = await Job.find({
    _id: { $ne: job._id },
    status: "open",
    $or: conditions,
  })
    .populate("shipper", "name email")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.status(200).json({
    success: true,
    count: returnLoads.length,
    deliveryLocation,
    data: returnLoads,
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
