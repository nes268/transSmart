const express = require("express");
const router = express.Router();
const { createJob, getAllJobs, acceptJob, completeJob, getReturnLoads } = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");
const {
  createJobValidation,
} = require("../middleware/validators/jobValidator");
const validateRequest = require("../middleware/validateRequest");

router.post(
  "/",
  protect,
  createJobValidation,
  validateRequest,
  createJob
);
router.get("/", protect, getAllJobs);
router.get("/return-loads/:jobId", protect, getReturnLoads);
router.put("/accept/:id", protect, acceptJob);
router.put("/complete/:id", protect, completeJob);

module.exports = router;