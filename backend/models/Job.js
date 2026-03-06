const mongoose = require("mongoose");

const jobSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    pickupLocation: {
      type: String,
      required: true
    },
    deliveryLocation: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    requiredCapacity: {
      type: Number,
      default: 0
    },
    preferredDeliveryDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["open", "accepted", "completed"],
      default: "open"
    },
    shipper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    optimizedRoute: {
      distance: { type: Number },
      duration: { type: Number },
      fuelUsed: { type: Number },
      fuelCost: { type: Number },
      greenScore: { type: Number },
      steps: [{ instruction: String, distance: Number, duration: Number }],
      geometry: { type: mongoose.Schema.Types.Mixed }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);