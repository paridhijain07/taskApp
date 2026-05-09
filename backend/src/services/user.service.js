const bcrypt = require('bcrypt');
const User = require('../models/User.model');
const { ApiError } = require('../utils/apiError');

async function getMe(user) {
  return { profile: user };
}

async function updateMe(userId, { name, email }) {
  const update = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;

  if (Object.keys(update).length === 0) {
    throw new ApiError(422, 'No fields to update');
  }

  if (email) {
    const exists = await User.findOne({ email, _id: { $ne: userId } });
    if (exists) {
      throw new ApiError(409, 'Email already exists');
    }
  }

  const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select(
    '_id name email role isActive'
  );

  if (!updated) throw new ApiError(404, 'User not found');

  return { profile: updated };
}

async function updatePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ApiError(401, 'Current password incorrect');

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully' };
}

async function adminListUsers({ page = 1, limit = 10, role, search }) {
  const query = {};
  if (role) query.role = role;
  if (search) query.name = { $regex: search, $options: 'i' };

  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (safePage - 1) * safeLimit;

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .select('_id name email role isActive'),
  ]);

  const totalPages = Math.ceil(total / safeLimit) || 1;

  return { users, meta: { page: safePage, limit: safeLimit, total, totalPages } };
}

async function adminGetUserById(userId) {
  const user = await User.findById(userId).select('_id name email role isActive');
  if (!user) throw new ApiError(404, 'User not found');
  return { profile: user };
}

async function adminUpdateUser(userId, { role, isActive }) {
  const update = {};
  if (role !== undefined) update.role = role;
  if (isActive !== undefined) update.isActive = isActive;

  if (Object.keys(update).length === 0) {
    throw new ApiError(422, 'No fields to update');
  }

  const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select(
    '_id name email role isActive'
  );
  if (!updated) throw new ApiError(404, 'User not found');
  return { profile: updated };
}

async function adminSoftDeleteUser(userId) {
  const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true }).select(
    '_id name email role isActive'
  );
  if (!user) throw new ApiError(404, 'User not found');
  return { message: 'User deactivated' };
}

module.exports = {
  getMe,
  updateMe,
  updatePassword,
  adminListUsers,
  adminGetUserById,
  adminUpdateUser,
  adminSoftDeleteUser,
};
