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

/**
 * Update the currently-authenticated user's own profile (name/phone/email).
 * Role and isActive cannot be changed here.
 */
const updateMe = async (userId, updates) => {
  const allowed = {};
  if (updates.name !== undefined) allowed.name = String(updates.name).trim();
  if (updates.phone !== undefined) allowed.phone = String(updates.phone).trim();
  if (updates.email !== undefined) allowed.email = String(updates.email).trim().toLowerCase();

  if (Object.keys(allowed).length === 0) {
    throw new ApiError(400, 'No editable fields provided');
  }

  if (allowed.email || allowed.phone) {
    const conflictQuery = { _id: { $ne: userId } };
    if (allowed.email) conflictQuery.email = allowed.email;
    if (allowed.phone) conflictQuery.phone = allowed.phone;
    const conflict = await User.findOne(conflictQuery);
    if (conflict) {
      const field = allowed.email && conflict.email === allowed.email ? 'email' : 'phone';
      throw new ApiError(409, `Another user already uses this ${field}`);
    }
  }

  const user = await User.findByIdAndUpdate(userId, allowed, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user.toSafeJSON();
};

module.exports = { login, changePassword, me, updateMe };
