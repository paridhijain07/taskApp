const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { env } = require('./env');

async function connectDB(retries = 3, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      mongoose.set('strictQuery', true);
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info('MongoDB connected');
      return;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt} failed`, { err: err?.message || err });
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

module.exports = { connectDB };
