const express = require("express");
const router = express.Router();

const { smartMatch, optimizeRoute } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/suggest", protect, smartMatch);
router.post("/optimize-route", protect, optimizeRoute);

module.exports = router;
