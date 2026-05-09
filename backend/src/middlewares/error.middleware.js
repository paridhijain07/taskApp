const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

function globalErrorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const isProd = process.env.NODE_ENV === 'production';

  // Operational errors
  if (err instanceof ApiError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      errors: err.errors,
    });
  }

  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError || err?.name === 'ValidationError') {
    const fieldErrors = {};
    for (const [path, e] of Object.entries(err.errors || {})) {
      fieldErrors[path] = e.message;
    }
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      data: null,
      errors: fieldErrors,
    });
  }

  // Mongoose cast errors (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError || err?.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      data: null,
    });
  }

  // Duplicate key
  if (err && err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Already exists',
      data: null,
    });
  }

  // JWT errors
  if (err instanceof jwt.JsonWebTokenError || err?.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      data: null,
    });
  }
  if (err instanceof jwt.TokenExpiredError || err?.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      data: null,
    });
  }

  // Unknown errors
  if (isProd) {
    logger.error('Unhandled server error', { err: err?.message || String(err) });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }

  logger.error('Unhandled server error', { err });
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    data: null,
    ...(err?.message ? { debug: err.message } : undefined),
  });
}

module.exports = { globalErrorHandler };
