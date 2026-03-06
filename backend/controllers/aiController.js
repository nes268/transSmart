const Truck = require("../models/Truck");
const Job = require("../models/Job");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");
const { aiRankTrucksForJob, aiChooseBestRoute } = require("../utils/aiClient");

/**
 * Smart Match: AI-based truck suggestions for a job.
 */
exports.smartMatch = asyncHandler(async (req, res, next) => {
  const { jobId } = req.body;
  const job = await Job.findById(jobId)
    .populate("shipper", "name")
    .populate("transporter", "name");

  if (!job) return next(new AppError("Job not found", 404));

  const requiredCapacity = Number(job.requiredCapacity) || 0;

  const trucks = await Truck.find()
    .populate("transporter", "name email phone")
    .lean();

  const aiSuggestions = await aiRankTrucksForJob({ job, trucks });
  const byId = new Map(trucks.map((t) => [t._id.toString(), t]));

  const topMatches = aiSuggestions
    .map((s) => {
      const truck = byId.get(s.truckId);
      if (!truck) return null;
      return {
        truck: {
          _id: truck._id,
          truckNumber: truck.truckNumber,
          capacity: truck.capacity,
          fuelType: truck.fuelType,
          availability: truck.availability,
          transporter: truck.transporter,
        },
        score: s.score,
        reasons: s.reasons,
      };
    })
    .filter(Boolean);

  const suggestion = {
    job: {
      _id: job._id,
      title: job.title,
      pickupLocation: job.pickupLocation,
      deliveryLocation: job.deliveryLocation,
      requiredCapacity,
    },
    suggestions: topMatches,
    totalScanned: trucks.length,
    message: topMatches.length
      ? `Found ${topMatches.length} best truck(s) for your job`
      : "No suitable trucks found. Try lowering required capacity.",
  };

  res.status(200).json({
    success: true,
    suggestion,
  });
});

const { optimizeRouteCandidates } = require("../utils/routeOptimizer");

exports.optimizeRoute = async (req, res, next) => {
  try {
    const { jobId, fuelType = "diesel", fuelEfficiency = 5 } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const pickup = job.pickupLocation || "";
    const drop = job.deliveryLocation || "";
    if (!pickup || !drop) {
      return res.status(400).json({ message: "Job must have pickup and delivery locations" });
    }

    const parsedEfficiency = parseFloat(fuelEfficiency) || 5;
    const { candidates } = await optimizeRouteCandidates(
      pickup,
      drop,
      fuelType,
      parsedEfficiency
    );
    if (!candidates?.length) {
      return res.status(404).json({ message: "Route not found" });
    }

    const { bestIndex } = await aiChooseBestRoute({
      job,
      candidates,
      objective: "eco",
    });

    const safeIndex = Math.max(0, Math.min(candidates.length - 1, bestIndex));
    const optimization = candidates[safeIndex];

    job.optimizedRoute = {
      distance: optimization.distance,
      duration: optimization.duration,
      fuelUsed: optimization.fuelUsed,
      fuelCost: optimization.fuelCost,
      greenScore: optimization.greenScore,
      steps: optimization.steps,
      geometry: optimization.geometry
    };
    await job.save();

    const payload = {
      jobId: job._id.toString(),
      optimizedRoute: job.optimizedRoute
    };
    if (global.io) {
      global.io.to(`job:${job._id}`).emit("job:optimizedRoute", payload);
      if (job.transporter) {
        global.io.to(job.transporter.toString()).emit("job:optimizedRoute", payload);
      }
      global.io.to(job.shipper.toString()).emit("job:optimizedRoute", payload);
    }

    res.status(200).json({
      success: true,
      optimization: {
        distance_km: optimization.distance,
        duration_minutes: Math.round(optimization.duration / 60),
        fuel_used_liters: optimization.fuelUsed,
        fuel_cost: optimization.fuelCost,
        greenScore: optimization.greenScore,
        steps: optimization.steps,
        geometry: optimization.geometry
      }
    });
  } catch (err) {
    next(err);
  }
};
