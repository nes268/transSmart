const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["shipper", "transporter", "admin"],
      default: "shipper"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);