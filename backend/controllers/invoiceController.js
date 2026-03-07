const Invoice = require("../models/Invoice");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

/**
 * Get next invoice number: INV-YYYY-NNNN
 */
async function getNextInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const last = await Invoice.findOne({ invoiceNumber: new RegExp(`^${prefix}`) })
    .sort({ invoiceNumber: -1 })
    .select("invoiceNumber")
    .lean();
  const nextNum = last
    ? parseInt(last.invoiceNumber.replace(prefix, ""), 10) + 1
    : 1;
  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

/**
 * Create Invoice (called from paymentController when Payment is created)
 */
exports.createInvoice = async function (payment) {
  const invoiceNumber = await getNextInvoiceNumber();
  const amount = payment.amount || 0;
  const gstPercent = 18;
  const gstAmount = Math.round((amount * gstPercent) / 100);
  const totalAmount = amount + gstAmount;

  const invoice = await Invoice.create({
    invoiceNumber,
    payment: payment._id,
    job: payment.job,
    shipper: payment.shipper,
    transporter: payment.transporter,
    amount,
    gstPercent,
    gstAmount,
    totalAmount,
    status: payment.status === "paid" ? "paid" : "issued",
    paidAt: payment.status === "paid" ? payment.paidAt : null,
  });
  return invoice;
};

/**
 * Update Invoice when payment is marked paid
 */
exports.updateInvoiceOnPaid = async function (payment) {
  await Invoice.findOneAndUpdate(
    { payment: payment._id },
    {
      status: "paid",
      paidAt: payment.paidAt || new Date(),
    }
  );
};

/**
 * Get My Invoices (Shipper or Transporter)
 */
exports.getMyInvoices = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === "shipper") {
    filter.shipper = req.user._id;
  } else if (req.user.role === "transporter") {
    filter.transporter = req.user._id;
  } else if (req.user.role === "admin") {
    // Admin sees all
  } else {
    filter = { _id: null }; // no match
  }

  const invoices = await Invoice.find(filter)
    .populate("job", "title pickupLocation deliveryLocation price")
    .populate("shipper", "name email")
    .populate("transporter", "name email")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices,
  });
});

/**
 * Get Single Invoice (authorized user only)
 */
exports.getInvoiceById = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("job", "title description pickupLocation deliveryLocation price requiredCapacity createdAt")
    .populate("shipper", "name email phone")
    .populate("transporter", "name email phone")
    .lean();

  if (!invoice) return next(new AppError("Invoice not found", 404));

  const userId = req.user._id.toString();
  const isShipper = invoice.shipper?._id?.toString() === userId;
  const isTransporter = invoice.transporter?._id?.toString() === userId;
  const isAdmin = req.user.role === "admin";

  if (!isShipper && !isTransporter && !isAdmin) {
    return next(new AppError("Not authorized to view this invoice", 403));
  }

  res.status(200).json({
    success: true,
    data: invoice,
  });
});
