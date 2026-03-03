const express = require("express");
const router = express.Router();

const {
  createPayment,
  markAsPaid,
  getMyPayments,
  getRevenueSummary,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createPayment);
router.patch("/:id/pay", protect, markAsPaid);
router.get("/my", protect, getMyPayments);
router.get("/admin/revenue", protect, getRevenueSummary);

module.exports = router;
