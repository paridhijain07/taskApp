const { body } = require('express-validator');
const { validateMiddleware } = require('../middlewares/validate.middleware');

const createRules = [
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('title is required')
    .isLength({ max: 100 })
    .withMessage('title must be at most 100 characters'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('description must be at most 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'done'])
    .withMessage('status must be one of pending, in_progress, done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('priority must be one of low, medium, high'),
  validateMiddleware,
];

const updateRules = [
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('description must be at most 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'done'])
    .withMessage('status must be one of pending, in_progress, done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('priority must be one of low, medium, high'),
  body()
    .custom((_, { req }) => {
      const { title, description, status, priority } = req.body || {};
      const hasAny =
        title !== undefined || description !== undefined || status !== undefined || priority !== undefined;
      if (!hasAny) {
        throw new Error('At least one field (title, description, status, priority) is required');
      }
      return true;
    })
    .withMessage('At least one field must be present'),
  validateMiddleware,
];

module.exports = { createRules, updateRules };
