const express = require("express");
const router = express.Router();
const { createRequest, getMyRequests } = require("../controllers/truckRequestController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createRequest);
router.get("/", protect, getMyRequests);

module.exports = router;
