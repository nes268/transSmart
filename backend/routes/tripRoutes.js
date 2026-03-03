const express = require("express");
const router = express.Router();

const {
  createTrip,
  updateTripStatus,
  updateLiveLocation,
  getMyTrips,
} = require("../controllers/tripController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createTrip);
router.put("/:id/status", protect, updateTripStatus);
router.patch("/:id/location", protect, updateLiveLocation);
router.get("/", protect, getMyTrips);

module.exports = router;
