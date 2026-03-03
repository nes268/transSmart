const User = require("../models/User");
const Job = require("../models/Job");
const Trip = require("../models/Trip");
const Payment = require("../models/Payment");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

// Middleware to check admin
const checkAdmin = (req) => {
  if (req.user.role !== "admin") {
    throw new AppError("Admin access only", 403);
  }
};

/**
 * 1️⃣ Get All Users
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  checkAdmin(req);

  const users = await User.find().select("-password");

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

/**
 * 2️⃣ Block / Unblock User
 */
exports.toggleBlockUser = asyncHandler(async (req, res) => {
  checkAdmin(req);

  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
  });
});

/**
 * 3️⃣ Delete User
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  checkAdmin(req);

  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

/**
 * 4️⃣ Get All Jobs
 */
exports.getAllJobs = asyncHandler(async (req, res) => {
  checkAdmin(req);

  const jobs = await Job.find().populate("createdBy", "name role");

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
  });
});

/**
 * 5️⃣ Delete Job
 */
exports.deleteJob = asyncHandler(async (req, res) => {
  checkAdmin(req);

  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError("Job not found", 404);

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});

/**
 * 6️⃣ Platform Statistics
 */
exports.getPlatformStats = asyncHandler(async (req, res) => {
  checkAdmin(req);

  const totalUsers = await User.countDocuments();
  const totalJobs = await Job.countDocuments();
  const totalTrips = await Trip.countDocuments();
  const totalRevenueData = await Payment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalRevenue = totalRevenueData[0]?.total || 0;

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalJobs,
      totalTrips,
      totalRevenue,
    },
  });
});

/**
 * Advanced Analytics
 */
exports.getAdvancedAnalytics = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new AppError("Admin access only", 403);
  }

  const totalJobs = await Job.countDocuments();

  const completedJobs = await Trip.countDocuments({
    status: "completed",
  });

  const revenueData = await Payment.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  const activeTransporters = await Trip.distinct("transporter", {
    status: { $in: ["accepted", "in_transit"] },
  });

  const mostActiveShipperData = await Job.aggregate([
    {
      $group: {
        _id: "$createdBy",
        totalJobs: { $sum: 1 },
      },
    },
    { $sort: { totalJobs: -1 } },
    { $limit: 1 },
  ]);

  res.status(200).json({
    success: true,
    analytics: {
      totalJobs,
      completedJobs,
      totalRevenue,
      activeTransporters: activeTransporters.length,
      mostActiveShipper: mostActiveShipperData[0] || null,
    },
  });
});
