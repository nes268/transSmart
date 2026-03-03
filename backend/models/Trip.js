const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "in_transit", "delivered", "completed"],
      default: "pending",
    },
    currentLocation: {
      lat: Number,
      lng: Number,
    },
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
