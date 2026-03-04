const TruckRequest = require("../models/TruckRequest");
const Truck = require("../models/Truck");
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

  const { truckId, message } = req.body;
  const truck = await Truck.findById(truckId).populate("transporter");
  if (!truck) return next(new AppError("Truck not found", 404));

  const existing = await TruckRequest.findOne({
    shipper: req.user._id,
    truck: truckId,
    status: "pending",
  });
  if (existing) {
    return next(new AppError("You already have a pending request for this truck", 400));
  }

  const request = await TruckRequest.create({
    shipper: req.user._id,
    truck: truckId,
    message: message || "",
  });

  await sendNotification({
    userId: truck.transporter._id,
    type: "truck_request",
    message: `${req.user.name} sent a request for truck ${truck.truckNumber}`,
    relatedId: request._id,
  });

  const populated = await TruckRequest.findById(request._id)
    .populate("shipper", "name email phone")
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
