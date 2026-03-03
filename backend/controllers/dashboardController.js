const Job = require("../models/Job");

/**
 * SHIPPER DASHBOARD
 */
exports.getShipperDashboard = async (req, res) => {
  try {
    const shipperId = req.user._id;

    const jobs = await Job.find({ shipper: shipperId })
      .populate("transporter", "name email")
      .sort({ createdAt: -1 });

    const totalJobs = jobs.length;
    const openJobs = jobs.filter(job => job.status === "open").length;
    const acceptedJobs = jobs.filter(job => job.status === "accepted").length;
    const completedJobs = jobs.filter(job => job.status === "completed").length;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalJobs,
          openJobs,
          acceptedJobs,
          completedJobs,
        },
        jobs,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * TRANSPORTER DASHBOARD
 */
exports.getTransporterDashboard = async (req, res) => {
  try {
    const transporterId = req.user._id;

    const jobs = await Job.find({ transporter: transporterId })
      .populate("shipper", "name email")
      .sort({ updatedAt: -1 });

    const totalAccepted = jobs.length;
    const completedJobs = jobs.filter(job => job.status === "completed").length;
    const activeJobs = jobs.filter(job => job.status === "accepted").length;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalAccepted,
          activeJobs,
          completedJobs,
        },
        jobs,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
