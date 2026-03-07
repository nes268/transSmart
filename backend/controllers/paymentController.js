const Payment = require("../models/Payment");
const Job = require("../models/Job");
const { createInvoice, updateInvoiceOnPaid } = require("./invoiceController");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");
const sendNotification = require("../utils/sendNotification");

/**
 * Create Payment (shipper creates payment for completed job)
 */
exports.createPayment = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "shipper") {
    return next(new AppError("Only shippers can create payments", 403));
  }

  const job = await Job.findById(req.body.jobId);

  if (!job) return next(new AppError("Job not found", 404));
  if (job.status !== "completed") {
    return next(new AppError("Payment can only be created for completed jobs", 400));
  }
  if (job.shipper.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to create payment for this job", 403));
  }
  if (!job.transporter) {
    return next(new AppError("Job has no assigned transporter", 400));
  }

  const existingPayment = await Payment.findOne({ job: job._id });
  if (existingPayment) {
    return next(new AppError("Payment already exists for this job", 400));
  }

  const payment = await Payment.create({
    job: job._id,
    shipper: job.shipper,
    transporter: job.transporter,
    amount: job.price,
  });

  await createInvoice(payment);

  const populated = await Payment.findById(payment._id).populate("job");

  // Real-time: notify both shipper and transporter instantly
  if (global.io) {
    global.io.to(payment.shipper.toString()).emit("payment:created", populated);
    global.io.to(payment.transporter.toString()).emit("payment:created", populated);
  }

  res.status(201).json({
    success: true,
    data: populated,
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

  await updateInvoiceOnPaid(payment);

  const populated = await Payment.findById(payment._id).populate("job");

  // Real-time: notify both shipper and transporter instantly
  if (global.io) {
    global.io.to(payment.shipper.toString()).emit("payment:paid", populated);
    global.io.to(payment.transporter.toString()).emit("payment:paid", populated);
  }

  await sendNotification({
    userId: payment.transporter,
    type: "payment_done",
    message: "Payment has been successfully credited.",
    relatedId: payment._id,
  });

  res.status(200).json({
    success: true,
    data: populated,
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
