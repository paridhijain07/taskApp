const dotenv = require('dotenv');

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requireSecret(name) {
  const value = requireEnv(name);
  if (value.length < 32) {
    throw new Error(`${name} must be at least 32 characters`);
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(requireEnv('PORT')),
  MONGODB_URI: requireEnv('MONGODB_URI'),
  JWT_SECRET: requireSecret('JWT_SECRET'),
  JWT_REFRESH_SECRET: requireSecret('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES: requireEnv('JWT_ACCESS_EXPIRES') || '15m',
  JWT_REFRESH_EXPIRES: requireEnv('JWT_REFRESH_EXPIRES') || '7d',
  FRONTEND_URL: requireEnv('FRONTEND_URL'),
  REDIS_URL: process.env.REDIS_URL || '',
};

module.exports = { env };
