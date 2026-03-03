const express = require("express");
const router = express.Router();

const {
  createTrip,
  updateTripStatus,
  updateLiveLocation,
  getMyTrips,
  getShipperTrips,
  getTripById,
} = require("../controllers/tripController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createTrip);
router.get("/shipper", protect, getShipperTrips);
router.get("/", protect, getMyTrips);
router.get("/:id", protect, getTripById);
router.put("/:id/status", protect, updateTripStatus);
router.patch("/:id/location", protect, updateLiveLocation);

module.exports = router;
