const express = require('express');

const authController = require('../../controllers/user.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { updateProfileRules, updatePasswordRules, adminUpdateUserRules } = require('../../validators/userValidator');

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile (no password).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - { $ref: '#/components/schemas/ApiResponseBase' }
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserSchema'
 */
router.get('/me', authController.getMe);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: Update current user profile
 *     description: Updates name and/or email for the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Paridhi" }
 *               email: { type: string, example: "paridhi@test.com" }
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Email already exists
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.put('/me', updateProfileRules, authController.updateMe);

/**
 * @swagger
 * /api/v1/users/me/password:
 *   put:
 *     summary: Change password
 *     description: Verifies current password then updates it.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, example: "User@1234" }
 *               newPassword: { type: string, example: "User@2345" }
 *     responses:
 *       200:
 *         description: Password updated
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.put('/me/password', updatePasswordRules, authController.updatePassword);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Admin list users
 *     description: Returns a paginated list of users for admins.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, admin] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Users fetched
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', requireRole('admin'), authController.adminList);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Admin get user by id
 *     description: Returns a single user profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User fetched
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get('/:id', requireRole('admin'), authController.adminGetById);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Admin update user
 *     description: Updates a user's role and/or activation status.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation failed
 */
router.put('/:id', requireRole('admin'), adminUpdateUserRules, authController.adminUpdateById);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Admin deactivate user
 *     description: Soft-deletes by setting isActive: false.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deactivated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete('/:id', requireRole('admin'), authController.adminSoftDeleteById);

module.exports = router;
