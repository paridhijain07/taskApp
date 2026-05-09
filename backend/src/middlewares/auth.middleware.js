const { ApiError } = require('../utils/apiError');
const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User.model');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');
    if (!token || scheme !== 'Bearer') {
      throw new ApiError(401, 'Missing authorization token');
    }

    // jwt errors are mapped in error.middleware.js
    const decoded = verifyAccessToken(token);
    const userId = decoded?.userId;

    const user = await User.findById(userId).select('_id name email role isActive');
    if (!user || user.isActive === false) {
      throw new ApiError(401, 'Unauthorized');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authMiddleware };
