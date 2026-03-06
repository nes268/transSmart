const express = require("express");
const router = express.Router();
const { getAdvancedAnalytics, getPlatformStats } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.get("/", protect, allowRoles("admin"), getAdvancedAnalytics);
router.get("/stats", protect, allowRoles("admin"), getPlatformStats);

module.exports = router;
