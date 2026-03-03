const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validators/authValidator");
const validateRequest = require("../middleware/validateRequest");

router.post(
  "/register",
  registerValidation,
  validateRequest,
  registerUser
);

router.post(
  "/login",
  loginValidation,
  validateRequest,
  loginUser
);

module.exports = router;