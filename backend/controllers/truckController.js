const Truck = require("../models/Truck");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

/**
 * Add Truck (Transporter only)
 */
exports.addTruck = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "transporter") {
    return next(new AppError("Only transporters can add trucks", 403));
  }

  const truck = await Truck.create({
    ...req.body,
    transporter: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: truck,
  });
});

/**
 * Get My Trucks (Transporter only)
 */
exports.getMyTrucks = asyncHandler(async (req, res) => {
  const trucks = await Truck.find({ transporter: req.user._id });

  res.status(200).json({
    success: true,
    count: trucks.length,
    data: trucks,
  });
});

/**
 * Get All Trucks - Browse trucks (Shipper only)
 */
exports.getAllTrucks = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "shipper" && req.user.role !== "admin") {
    return next(new AppError("Only shippers can browse trucks", 403));
  }

  const trucks = await Truck.find()
    .populate("transporter", "name email phone")
    .sort({ availability: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: trucks.length,
    data: trucks,
  });
});

/**
 * Update Truck
 */
exports.updateTruck = asyncHandler(async (req, res, next) => {
  const truck = await Truck.findById(req.params.id);

  if (!truck) {
    return next(new AppError("Truck not found", 404));
  }

  if (truck.transporter.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  Object.assign(truck, req.body);
  await truck.save();

  res.status(200).json({
    success: true,
    data: truck,
  });
});

/**
 * Change Availability
 */
exports.changeAvailability = asyncHandler(async (req, res, next) => {
  const truck = await Truck.findById(req.params.id);

  if (!truck) {
    return next(new AppError("Truck not found", 404));
  }

  if (truck.transporter.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  truck.availability = req.body.availability;
  await truck.save();

  res.status(200).json({
    success: true,
    data: truck,
  });
});
