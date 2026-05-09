const { body } = require('express-validator');
const { validateMiddleware } = require('../middlewares/validate.middleware');

const registerRules = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
    .withMessage('Password must contain 1 uppercase letter, 1 number, and 1 special character'),
  validateMiddleware,
];

const loginRules = [
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('password').isString().trim().notEmpty().withMessage('Password is required'),
  validateMiddleware,
];

const refreshRules = [
  body('refreshToken').isString().trim().notEmpty().withMessage('refreshToken is required'),
  validateMiddleware,
];

const logoutRules = [
  body('refreshToken').isString().trim().notEmpty().withMessage('refreshToken is required'),
  validateMiddleware,
];

module.exports = {
  registerRules,
  loginRules,
  refreshRules,
  logoutRules,
};
