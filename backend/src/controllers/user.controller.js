const { asyncHandler } = require('../utils/asyncHandler');
const { apiResponse } = require('../utils/apiResponse');
const {
  getMe,
  updateMe,
  updatePassword,
  adminListUsers,
  adminGetUserById,
  adminUpdateUser,
  adminSoftDeleteUser,
} = require('../services/user.service');

const userController = {
  getMe: asyncHandler(async (req, res) => {
    const result = await getMe(req.user);
    return apiResponse({ res, message: 'Profile fetched', data: result.profile });
  }),

  updateMe: asyncHandler(async (req, res) => {
    const result = await updateMe(req.user._id, req.body);
    return apiResponse({ res, message: 'Profile updated', data: result.profile });
  }),

  updatePassword: asyncHandler(async (req, res) => {
    const result = await updatePassword(req.user._id, req.body);
    return apiResponse({ res, message: result.message, data: null });
  }),

  adminList: asyncHandler(async (req, res) => {
    const { page, limit, role, search } = req.query;
    const result = await adminListUsers({ page, limit, role, search });
    return apiResponse({ res, message: 'Users fetched', data: result.users, meta: result.meta });
  }),

  adminGetById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await adminGetUserById(id);
    return apiResponse({ res, message: 'User fetched', data: result.profile });
  }),

  adminUpdateById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await adminUpdateUser(id, req.body);
    return apiResponse({ res, message: 'User updated', data: result.profile });
  }),

  adminSoftDeleteById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await adminSoftDeleteUser(id);
    return apiResponse({ res, message: result.message, data: null });
  }),
};

module.exports = userController;
