const express = require("express");
const router = express.Router();
const { getMyInvoices, getInvoiceById } = require("../controllers/invoiceController");
const { protect } = require("../middleware/authMiddleware");

router.get("/my", protect, getMyInvoices);
router.get("/:id", protect, getInvoiceById);

module.exports = router;
