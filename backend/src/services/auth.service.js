const bcrypt = require('bcrypt');
const User = require('../models/User.model');
const RefreshToken = require('../models/RefreshToken.model');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/tokenUtils');
const { ApiError } = require('../utils/apiError');

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Email already exists');
  }

  const user = await User.create({ name, email, password });

  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  const tokenHash = hashToken(refreshToken);

  const decoded = verifyRefreshToken(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);

  await RefreshToken.create({
    tokenHash,
    user: user._id,
    expiresAt,
  });

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (user.isActive === false) {
    throw new ApiError(403, 'Account deactivated');
  }

  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  const decoded = verifyRefreshToken(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);
  const tokenHash = hashToken(refreshToken);

  // Refresh token rotation / cleanup: keep last 5 tokens per user
  const existingTokens = await RefreshToken.find({ user: user._id }).sort({ createdAt: -1 });
  if (existingTokens.length >= 5) {
    const tokensToDelete = existingTokens.slice(5);
    await RefreshToken.deleteMany({ _id: { $in: tokensToDelete.map((t) => t._id) } });
  }

  await RefreshToken.create({ tokenHash, user: user._id, expiresAt });

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

async function refresh({ refreshToken }) {
  const decoded = verifyRefreshToken(refreshToken);
  const userId = decoded.userId;
  const expiresAt = new Date(decoded.exp * 1000);
  const tokenHash = hashToken(refreshToken);

  const tokenDoc = await RefreshToken.findOne({
    tokenHash,
    user: userId,
  });

  if (!tokenDoc) {
    throw new ApiError(401, 'Refresh token invalid or reused');
  }

  // If TTL hasn't deleted it yet, still guard against already-expired JWT.
  if (tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() <= Date.now()) {
    await RefreshToken.deleteOne({ _id: tokenDoc._id }).catch(() => {});
    throw new ApiError(401, 'Refresh token invalid or reused');
  }

  // Rotation: delete old token document
  await RefreshToken.deleteOne({ _id: tokenDoc._id });

  const user = await User.findById(userId).select('_id role');
  if (!user) throw new ApiError(401, 'Refresh token invalid or reused');

  const accessToken = signAccessToken(user._id, user.role);
  const newRefreshToken = signRefreshToken(user._id);

  const newDecoded = verifyRefreshToken(newRefreshToken);
  const newExpiresAt = new Date(newDecoded.exp * 1000);
  const newTokenHash = hashToken(newRefreshToken);

  await RefreshToken.create({
    tokenHash: newTokenHash,
    user: user._id,
    expiresAt: newExpiresAt,
  });

  return { accessToken, refreshToken: newRefreshToken };
}

async function logout({ userId, refreshToken }) {
  const tokenHash = hashToken(refreshToken);
  await RefreshToken.deleteOne({ tokenHash, user: userId });
  return { message: 'Logged out' };
}

module.exports = { register, login, refresh, logout };
