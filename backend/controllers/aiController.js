const Truck = require("../models/Truck");
const Job = require("../models/Job");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

/**
 * Smart Match: Scan all truck profiles and suggest best trucks for a job.
 * Rule-based scoring - no external API key required.
 * Scores by: capacity fit, availability, fuel type preference.
 */
exports.smartMatch = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "shipper") {
    return next(new AppError("Only shippers can use Smart Match", 403));
  }

  const { jobId } = req.body;
  const job = await Job.findById(jobId)
    .populate("shipper", "name")
    .populate("transporter", "name");

  if (!job) return next(new AppError("Job not found", 404));
  if (job.shipper._id.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only match your own jobs", 403));
  }
  if (job.status !== "open") {
    return next(new AppError("Job is not open for matching", 400));
  }

  const requiredCapacity = Number(job.requiredCapacity) || 0;

  const trucks = await Truck.find()
    .populate("transporter", "name email phone")
    .lean();

  const scored = trucks.map((truck) => {
    let score = 0;
    const reasons = [];

    // Capacity: must have capacity >= required; prefer closer match
    if (truck.capacity < requiredCapacity) {
      score -= 1000;
      reasons.push("Insufficient capacity");
    } else {
      const excess = truck.capacity - requiredCapacity;
      const capScore = Math.max(0, 100 - excess * 5);
      score += capScore;
      reasons.push(
        requiredCapacity
          ? `Capacity ${truck.capacity} tons ${truck.capacity >= requiredCapacity ? `matches job (${requiredCapacity} tons)` : ""}`
          : `Capacity ${truck.capacity} tons`
      );
    }

    // Availability: available trucks get strong boost
    if (truck.availability === "available") {
      score += 80;
      reasons.push("Available now");
    } else {
      reasons.push("Currently busy");
    }

    // Fuel type: electric gets eco bonus
    if (truck.fuelType === "electric") {
      score += 20;
      reasons.push("Eco-friendly (electric)");
    }

    return {
      truck: {
        _id: truck._id,
        truckNumber: truck.truckNumber,
        capacity: truck.capacity,
        fuelType: truck.fuelType,
        availability: truck.availability,
        transporter: truck.transporter,
      },
      score: Math.round(score),
      reasons,
    };
  });

  // Filter out trucks with negative score (insufficient capacity)
  const valid = scored.filter((s) => s.score > -500);
  const sorted = valid.sort((a, b) => b.score - a.score);
  const topMatches = sorted.slice(0, 10);

  res.status(200).json({
    success: true,
    job: {
      _id: job._id,
      title: job.title,
      pickupLocation: job.pickupLocation,
      deliveryLocation: job.deliveryLocation,
      requiredCapacity,
    },
    suggestions: topMatches,
    totalTrucksScanned: trucks.length,
    message: topMatches.length
      ? `Found ${topMatches.length} best truck(s) for your job`
      : "No suitable trucks found. Try lowering required capacity.",
  });
});

exports.optimizeRoute = async (req, res, next) => {
  try {
    const input = {
      pickup: req.body.pickup,
      drop: req.body.drop,
      fuelType: req.body.fuelType,
      fuelEfficiency: req.body.fuelEfficiency,
    };

    // Placeholder - would need geocoding + distance API or Python script
    const optimization = {
      distance_km: 0,
      fuel_used_liters: 0,
      co2_emission_kg: 0,
      greenScore: 0,
      message: "Route optimization requires location coordinates. Configure ai-engine/route_optimizer.py for full support.",
    };

    res.status(200).json({
      success: true,
      optimization,
    });
  } catch (err) {
    next(err);
  }
};
