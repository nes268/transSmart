const Payment = require("../models/Payment");
const Job = require("../models/Job");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");
const sendNotification = require("../utils/sendNotification");

/**
 * Create Payment (when job created)
 */
exports.createPayment = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.body.jobId);

  if (!job) return next(new AppError("Job not found", 404));

  const payment = await Payment.create({
    job: job._id,
    shipper: job.createdBy,
    transporter: job.assignedTo || null,
    amount: job.budget,
  });

  res.status(201).json({
    success: true,
    data: payment,
  });
});

/**
 * Mark Payment as Paid (Shipper)
 */
exports.markAsPaid = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) return next(new AppError("Payment not found", 404));

  if (payment.shipper.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  payment.status = "paid";
  payment.paymentMethod = req.body.paymentMethod;
  payment.transactionId = `TXN_${Date.now()}`;
  payment.paidAt = new Date();

  await payment.save();

  await sendNotification({
    userId: payment.transporter,
    type: "payment_done",
    message: "Payment has been successfully credited.",
    relatedId: payment._id,
  });

  res.status(200).json({
    success: true,
    data: payment,
  });
});

/**
 * Get My Payments (Shipper or Transporter)
 */
exports.getMyPayments = asyncHandler(async (req, res) => {
  let payments;

  if (req.user.role === "shipper") {
    payments = await Payment.find({ shipper: req.user._id }).populate("job");
  } else if (req.user.role === "transporter") {
    payments = await Payment.find({ transporter: req.user._id }).populate("job");
  } else {
    payments = [];
  }

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  });
});

/**
 * Revenue Summary (Admin Only)
 */
exports.getRevenueSummary = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("Admin only access", 403));
  }

  const totalRevenue = await Payment.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    totalRevenue: totalRevenue[0]?.total || 0,
  });
});
