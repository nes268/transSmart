const express = require("express");
const router = express.Router();
const {
  getShipperDashboard,
  getTransporterDashboard,
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");

// Shipper dashboard
router.get("/shipper", protect, getShipperDashboard);

// Transporter dashboard
router.get("/transporter", protect, getTransporterDashboard);

module.exports = router;
