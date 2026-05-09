const { body } = require('express-validator');
const { validateMiddleware } = require('../middlewares/validate.middleware');

const updateProfileRules = [
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be between 3 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  body()
    .custom((_, { req }) => {
      const { name, email } = req.body || {};
      const hasAny = name !== undefined || email !== undefined;
      if (!hasAny) throw new Error('At least one field is required');
      return true;
    })
    .withMessage('At least one of name or email must be present'),
  validateMiddleware,
];

const passwordStrengthRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const updatePasswordRules = [
  body('currentPassword').isString().trim().notEmpty().withMessage('currentPassword is required'),
  body('newPassword')
    .isString()
    .trim()
    .isLength({ min: 8 })
    .withMessage('newPassword must be at least 8 characters')
    .matches(passwordStrengthRegex)
    .withMessage('newPassword must contain 1 uppercase letter, 1 number, and 1 special character'),
  validateMiddleware,
];

const adminUpdateUserRules = [
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('role must be either user or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean'),
  body()
    .custom((_, { req }) => {
      const { role, isActive } = req.body || {};
      const hasAny = role !== undefined || isActive !== undefined;
      if (!hasAny) throw new Error('At least one field is required');
      return true;
    })
    .withMessage('At least one of role or isActive must be present'),
  validateMiddleware,
];

module.exports = {
  updateProfileRules,
  updatePasswordRules,
  adminUpdateUserRules,
};
