const express = require("express");
const router = express.Router();
const { getMe, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, getMe);
router.patch("/me", protect, updateProfile);

module.exports = router;
