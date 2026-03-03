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

exports.optimizeRoute = async (req, res, next) => {
  try {
    const input = {
      pickup: req.body.pickup,
      drop: req.body.drop,
      fuelType: req.body.fuelType,
      fuelEfficiency: req.body.fuelEfficiency
    };

    const pythonProcess = spawn("python", [
      "ai-engine/route_optimizer.py"
    ]);

    let result = "";

    pythonProcess.stdin.write(JSON.stringify(input));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", data => {
      result += data.toString();
    });

    pythonProcess.stdout.on("end", () => {
      const optimization = JSON.parse(result);

      res.status(200).json({
        success: true,
        optimization
      });
    });

  } catch (err) {
    next(err);
  }
};
