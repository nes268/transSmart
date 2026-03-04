const { spawn } = require("child_process");
const Truck = require("../models/Truck");
const User = require("../models/User");
const Job = require("../models/Job");

exports.smartMatch = async (req, res, next) => {
  try {
    const job = await Job.findById(req.body.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Get available trucks
    const trucks = await Truck.find({ availability: "available" })
      .populate("transporter");

    const transportersData = trucks.map(truck => ({
      transporterId: truck.transporter._id.toString(),
      capacity: truck.capacity,
      fuelType: truck.fuelType,
      lat: truck.transporter.location?.lat || 0,
      lng: truck.transporter.location?.lng || 0
    }));

    const input = {
      job: {
        requiredCapacity: job.requiredCapacity,
        pickupLat: job.pickupLocation?.lat || 0,
        pickupLng: job.pickupLocation?.lng || 0
      },
      transporters: transportersData
    };

    const pythonProcess = spawn("python", [
      "ai-engine/smart_match.py"
    ]);

    let result = "";

    pythonProcess.stdin.write(JSON.stringify(input));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", data => {
      result += data.toString();
    });

    pythonProcess.stdout.on("end", () => {
      const suggestion = JSON.parse(result);

      res.status(200).json({
        success: true,
        suggestion
      });
    });

  } catch (err) {
    next(err);
  }
};

const { optimizeRoute: optimizeRouteUtil } = require("../utils/routeOptimizer");

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

    const optimization = await optimizeRouteUtil(
      pickup,
      drop,
      fuelType,
      parseFloat(fuelEfficiency) || 5
    );

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
