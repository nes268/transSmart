const Review = require("../models/Review");
const Trip = require("../models/Trip");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

/**
 * Create Review
 */
exports.createReview = asyncHandler(async (req, res, next) => {
  const { tripId, rating, comment } = req.body;

  const trip = await Trip.findById(tripId)
    .populate("job")
    .populate("transporter");

  if (!trip) return next(new AppError("Trip not found", 404));

  if (trip.status !== "completed") {
    return next(new AppError("Trip not completed yet", 400));
  }

  let reviewee;

  // Shipper rating Transporter
  if (trip.job.createdBy.toString() === req.user._id.toString()) {
    reviewee = trip.transporter._id;
  }
  // Transporter rating Shipper
  else if (trip.transporter._id.toString() === req.user._id.toString()) {
    reviewee = trip.job.createdBy;
  } else {
    return next(new AppError("Not authorized to review this trip", 403));
  }

  const review = await Review.create({
    trip: tripId,
    reviewer: req.user._id,
    reviewee,
    rating,
    comment,
  });

  res.status(201).json({
    success: true,
    data: review,
  });
});

/**
 * Get Reviews for a User
 */
exports.getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId })
    .populate("reviewer", "name role");

  const avgRating =
    reviews.reduce((acc, item) => acc + item.rating, 0) /
      reviews.length || 0;

  res.status(200).json({
    success: true,
    averageRating: avgRating.toFixed(2),
    count: reviews.length,
    data: reviews,
  });
});
