const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    shipper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "cash"],
    },
    transactionId: {
      type: String,
    },
    paidAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
