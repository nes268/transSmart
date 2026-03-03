const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema(
  {
    truckNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    fuelType: {
      type: String,
      enum: ["diesel", "petrol", "electric"],
      required: true,
    },
    availability: {
      type: String,
      enum: ["available", "busy"],
      default: "available",
    },
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Truck", truckSchema);
