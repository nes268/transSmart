const Job = require("../models/Job");
const Payment = require("../models/Payment");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * SHIPPER DASHBOARD
 */
exports.getShipperDashboard = asyncHandler(async (req, res, next) => {
  const shipperId = req.user._id;

  const jobs = await Job.find({ shipper: shipperId })
    .populate("transporter", "name email phone")
    .sort({ createdAt: -1 });

  const totalJobs = jobs.length;
  const openJobs = jobs.filter(job => job.status === "open").length;
  const acceptedJobs = jobs.filter(job => job.status === "accepted").length;
  const completedJobs = jobs.filter(job => job.status === "completed").length;

  const spendingAgg = await Payment.aggregate([
    { $match: { shipper: shipperId, status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalSpending = spendingAgg[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalJobs,
        openJobs,
        acceptedJobs,
        completedJobs,
        totalSpending,
      },
      jobs,
    },
  });
});

const Review = require("../models/Review");
const GreenScore = require("../models/GreenScore");

/**
 * TRANSPORTER DASHBOARD
 */
exports.getTransporterDashboard = asyncHandler(async (req, res, next) => {
  const transporterId = req.user._id;

  const jobs = await Job.find({ transporter: transporterId })
    .populate("shipper", "name email")
    .sort({ updatedAt: -1 });

  const totalAccepted = jobs.length;
  const completedJobs = jobs.filter(job => job.status === "completed").length;
  const activeJobs = jobs.filter(job => job.status === "accepted").length;

  const [earningsAgg, ratingAgg, greenScoreDoc] = await Promise.all([
    Payment.aggregate([
      { $match: { transporter: transporterId, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Review.aggregate([
      { $match: { reviewee: transporterId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
    GreenScore.findOne({ transporter: transporterId }).sort({ updatedAt: -1 }),
  ]);

  const totalEarnings = earningsAgg[0]?.total || 0;
  const averageRating = ratingAgg[0] ? Number((ratingAgg[0].avg || 0).toFixed(2)) : 0;
  const greenScore = greenScoreDoc?.score ?? null;

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalAccepted,
        activeJobs,
        completedJobs,
        totalEarnings,
        averageRating,
        greenScore,
      },
      jobs,
    },
  });
});
