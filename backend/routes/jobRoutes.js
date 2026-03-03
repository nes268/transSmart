const express = require("express");
const router = express.Router();
const { createJob, getAllJobs, acceptJob, completeJob } = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createJob);
router.get("/", getAllJobs);
router.put("/accept/:id", protect, acceptJob);
router.put("/complete/:id", protect, completeJob);

module.exports = router;