const Notification = require("../models/Notification");

const sendNotification = async ({ userId, type, message, relatedId }) => {
  const notification = await Notification.create({
    user: userId,
    type,
    message,
    relatedId,
  });

  // Real-time emit
  if (global.io) {
    global.io.to(userId.toString()).emit("notification", notification);
  }

  return notification;
};

module.exports = sendNotification;
