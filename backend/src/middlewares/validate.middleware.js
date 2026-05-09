const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiError');

function validateMiddleware(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, 'Validation failed', errors.array());
  }
}

module.exports = {
  validateMiddleware: (req, res, next) => {
    try {
      validateMiddleware(req);
      next();
    } catch (err) {
      next(err);
    }
  },
};
