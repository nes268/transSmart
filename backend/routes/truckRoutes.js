const express = require("express");
const router = express.Router();

const {
  addTruck,
  getMyTrucks,
  getAllTrucks,
  updateTruck,
  changeAvailability,
} = require("../controllers/truckController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addTruck);
router.get("/browse", protect, getAllTrucks);
router.get("/", protect, getMyTrucks);
router.put("/:id", protect, updateTruck);
router.patch("/:id/availability", protect, changeAvailability);

module.exports = router;
