const { asyncHandler } = require('../utils/asyncHandler');
const { apiResponse } = require('../utils/apiResponse');
const { register, login, refresh, logout } = require('../services/auth.service');

const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await register(req.body);
    res.status(201);
    return apiResponse({ res, message: 'Registered successfully', data: result });
  }),

  login: asyncHandler(async (req, res) => {
    const result = await login(req.body);
    res.status(200);
    return apiResponse({ res, message: 'Logged in successfully', data: result });
  }),

  refresh: asyncHandler(async (req, res) => {
    const result = await refresh(req.body);
    res.status(200);
    return apiResponse({ res, message: 'Token refreshed', data: result });
  }),

  logout: asyncHandler(async (req, res) => {
    const result = await logout({ userId: req.user._id, refreshToken: req.body.refreshToken });
    res.status(200);
    return apiResponse({ res, message: result.message, data: null });
  }),
};

module.exports = authController;
