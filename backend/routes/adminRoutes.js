const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  getAllJobs,
  deleteJob,
  getPlatformStats,
  getAdvancedAnalytics,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/users", getAllUsers);
router.patch("/users/:id/block", toggleBlockUser);
router.delete("/users/:id", deleteUser);

router.get("/jobs", getAllJobs);
router.delete("/jobs/:id", deleteJob);

router.get("/stats", getPlatformStats);
router.get("/analytics", getAdvancedAnalytics);

module.exports = router;
