const express = require("express");
const router = express.Router();

const {
  createReview,
  getUserReviews,
  getMyReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createReview);
router.get("/my", protect, getMyReviews);
router.get("/user/:userId", protect, getUserReviews);

module.exports = router;
