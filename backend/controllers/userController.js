const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

/**
 * Get current user profile
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * Update current user profile (name, phone)
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const allowed = ["name", "phone"];
  const updates = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password");

  res.status(200).json({
    success: true,
    data: user,
  });
});
