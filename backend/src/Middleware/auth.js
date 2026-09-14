const { verifyToken } = require('../Utils/token');
const ApiError = require('../Utils/ApiError');
const User = require('../Modules/Users/user.model');

/**
 * Protect routes - require a valid Bearer token.
 * Attaches `req.user = { id, role, email }` (without password).
 */
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired token. Please log in again.');
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists.');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated. Contact admin.');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = protect;