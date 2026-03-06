const AppError = require("../utils/AppError");

/**
 * Reusable role-based access middleware.
 * @param {string[]} allowedRoles - Array of roles that can access the route (e.g. ["shipper"], ["transporter"], ["admin"])
 */
const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authorized", 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Access denied for this role", 403));
    }
    next();
  };
};

module.exports = { allowRoles };
