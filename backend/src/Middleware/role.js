const ApiError = require('../Utils/ApiError');

/**
 * Role-based authorization. Pass one or more allowed roles, e.g. authorize('admin').
 * Must be used AFTER `protect` middleware.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, 'Forbidden: you do not have permission to perform this action.')
      );
    }
    next();
  };
};

module.exports = authorize;