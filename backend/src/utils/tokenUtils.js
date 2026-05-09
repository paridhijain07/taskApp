const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { env } = require('../config/env');

function signAccessToken(userId, role) {
  return jwt.sign(
    { userId, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES || '15m' }
  );
}

function signRefreshToken(userId) {
  return jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES || '7d' }
  );
}

function verifyAccessToken(token) {
  // Let jwt throw JsonWebTokenError / TokenExpiredError so error.middleware can map them.
  return jwt.verify(token, env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  // Let jwt throw JsonWebTokenError / TokenExpiredError so error.middleware can map them.
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
