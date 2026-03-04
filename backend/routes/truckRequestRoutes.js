const express = require("express");
const router = express.Router();
const { createRequest, getMyRequests, acceptRequest, rejectRequest } = require("../controllers/truckRequestController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createRequest);
router.get("/", protect, getMyRequests);
router.put("/:id/accept", protect, acceptRequest);
router.put("/:id/reject", protect, rejectRequest);

module.exports = router;
