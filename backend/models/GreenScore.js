const mongoose = require("mongoose");

const greenScoreSchema = new mongoose.Schema(
  {
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  },
  { timestamps: true }
);

greenScoreSchema.index({ transporter: 1, updatedAt: -1 });

module.exports = mongoose.model("GreenScore", greenScoreSchema);
