const Job = require("../models/Job");

// Create Job (Shipper Only)
exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== "shipper") {
      return res.status(403).json({ message: "Only shippers can post jobs" });
    }

    const { title, description, pickupLocation, deliveryLocation, price } = req.body;

    const job = await Job.create({
      title,
      description,
      pickupLocation,
      deliveryLocation,
      price,
      shipper: req.user._id
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("shipper", "name email");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept Job
exports.acceptJob = async (req, res) => {
  try {
    if (req.user.role !== "transporter") {
      return res.status(403).json({ message: "Only transporters can accept jobs" });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "open") {
      return res.status(400).json({ message: "Job already accepted or completed" });
    }

    job.status = "accepted";
    job.transporter = req.user._id;

    await job.save();

    res.json({ message: "Job accepted successfully", job });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete Job
exports.completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.transporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only assigned transporter can complete this job" });
    }

    job.status = "completed";
    await job.save();

    res.json({ message: "Job marked as completed", job });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};