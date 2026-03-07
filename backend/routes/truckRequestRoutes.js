const express = require("express");
const router = express.Router();
const { createRequest, getMyRequests, getRequestById, acceptRequest, rejectRequest } = require("../controllers/truckRequestController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createRequest);
router.get("/", protect, getMyRequests);
router.get("/:id", protect, getRequestById);
router.put("/:id/accept", protect, acceptRequest);
router.put("/:id/reject", protect, rejectRequest);

module.exports = router;
