const User = require('../Users/user.model');
const ApiError = require('../../Utils/ApiError');
const { signToken } = require('../../Utils/token');

/**
 * Login with email + password. Returns user (safe) + JWT.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact admin.');
  }

  const token = signToken({ id: user._id.toString(), role: user.role });

  return { user: user.toSafeJSON(), token };
};

/**
 * Change password for the currently-authenticated user.
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(400, 'Current password is incorrect');

  user.password = newPassword;
  await user.save();

  return true;
};

/**
 * Return the currently-authenticated user's safe profile.
 */
const me = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user.toSafeJSON();
};

module.exports = { login, changePassword, me };