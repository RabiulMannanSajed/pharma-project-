const User = require('./user.model');
const ApiError = require('../../Utils/ApiError');

/**
 * Create a new user. Admin-only route, but service accepts role for flexibility.
 */
const createUser = async (payload) => {
  const existing = await User.findOne({
    $or: [{ email: payload.email.toLowerCase() }, { phone: payload.phone }],
  });
  if (existing) {
    const field = existing.email === payload.email.toLowerCase() ? 'email' : 'phone';
    throw new ApiError(409, `A user with this ${field} already exists`);
  }

  const user = await User.create({
    ...payload,
    email: payload.email.toLowerCase(),
    role: payload.role || 'salesman',
  });
  return user.toSafeJSON();
};

/**
 * List users with optional filters and pagination.
 */
const listUsers = async ({ role, isActive, search, page = 1, limit = 20 }) => {
  const query = {};
  if (role) query.role = role;
  if (typeof isActive === 'boolean') query.isActive = isActive;

  if (search) {
    const re = new RegExp(search, 'i');
    query.$or = [{ name: re }, { email: re }, { phone: re }];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return {
    items: items.map((u) => u.toSafeJSON()),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

/**
 * Get one user by id.
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user.toSafeJSON();
};

/**
 * Update a user's basic profile fields (admin).
 */
const updateUser = async (id, updates) => {
  // Prevent duplicate email/phone collisions
  if (updates.email || updates.phone) {
    const conflictQuery = { _id: { $ne: id } };
    if (updates.email) conflictQuery.email = updates.email.toLowerCase();
    if (updates.phone) conflictQuery.phone = updates.phone;
    const conflict = await User.findOne(conflictQuery);
    if (conflict) {
      const field = updates.email && conflict.email === updates.email.toLowerCase() ? 'email' : 'phone';
      throw new ApiError(409, `Another user already uses this ${field}`);
    }
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user.toSafeJSON();
};

/**
 * Activate or deactivate a user (admin only).
 */
const setUserActive = async (id, isActive) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  );
  if (!user) throw new ApiError(404, 'User not found');
  return user.toSafeJSON();
};

/**
 * Hard-delete a user (admin only). Cascade sales/attendance are not removed -
 * they remain attributed; switch to setUserActive if you want soft deletion.
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, 'User not found');
  return user.toSafeJSON();
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  setUserActive,
  deleteUser,
};