const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * Get My Notifications
 */
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

/**
 * Mark As Read
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
  });
});
