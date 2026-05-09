const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('../../controllers/auth.controller');
const {
  registerRules,
  loginRules,
  refreshRules,
  logoutRules,
} = require('../../validators/authValidator');
const { authMiddleware } = require('../../middlewares/auth.middleware');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// eslint-disable-next-line no-unused-vars
router.use(authLimiter);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and issues access and refresh tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Paridhi" }
 *               email: { type: string, example: "paridhi@test.com" }
 *               password: { type: string, example: "Admin@1234" }
 *           examples:
 *             example:
 *               value: { name: "Paridhi", email: "paridhi@test.com", password: "Admin@1234" }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponseSchema' }
 *       400:
 *         description: Bad Request
 *       409:
 *         description: Email already exists
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/register', registerRules, authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Verifies credentials and issues access and refresh tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "user1@test.com" }
 *               password: { type: string, example: "User@1234" }
 *           examples:
 *             example:
 *               value: { email: "user1@test.com", password: "User@1234" }
 *     responses:
 *       200:
 *         description: Logged in
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponseSchema' }
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account deactivated
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginRules, authController.login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Rotates refresh token and returns a new access token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Refreshed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponseSchema' }
 *       401:
 *         description: Refresh token invalid or reused
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/refresh', refreshRules, authController.refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Deletes the provided refresh token.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logged out
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/logout', authMiddleware, logoutRules, authController.logout);

module.exports = router;
