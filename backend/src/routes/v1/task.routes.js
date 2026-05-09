const express = require('express');
const { requireRole } = require('../../middlewares/role.middleware');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const {
  createRules,
  updateRules,
} = require('../../validators/taskValidator');
const taskController = require('../../controllers/task.controller');

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/tasks/admin/stats:
 *   get:
 *     summary: Get task stats (admin)
 *     description: Aggregates totals by status and priority plus user counts.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats
 *       403:
 *         description: Insufficient permissions
 */
router.get('/admin/stats', requireRole('admin'), taskController.adminStats);

/**
 * @swagger
 * /api/v1/tasks/admin/by-owner/{ownerId}:
 *   get:
 *     summary: Get tasks for a specific owner (admin)
 *     description: Returns tasks for a given owner with filtering and pagination.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, in_progress, done] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tasks fetched
 *       400:
 *         description: Invalid ID format
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  '/admin/by-owner/:ownerId',
  requireRole('admin'),
  taskController.adminListByOwner
);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a task
 *     description: Creates a new task owned by the authenticated user.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskSchema'
 *           examples:
 *             example:
 *               value:
 *                 title: "Fix login bug"
 *                 description: "Investigate token refresh failure"
 *                 status: "pending"
 *                 priority: "high"
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/', createRules, taskController.create);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: List tasks
 *     description: Returns paginated tasks. Users see only their tasks; admins see all tasks.
 *     tags: [Tasks]
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
 *         name: status
 *         schema: { type: string, enum: [pending, in_progress, done] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tasks fetched
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', taskController.list);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get task by id
 *     description: Users can fetch only their own tasks; admins can fetch any task.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task fetched
 *       400:
 *         description: Invalid ID format
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', taskController.getById);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update task by id
 *     description: Updates title, description, status, and/or priority. Ownership rules apply.
 *     tags: [Tasks]
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
 *               title: { type: string, example: "Fix login bug" }
 *               description: { type: string, example: "Investigate token refresh failure" }
 *               status: { type: string, enum: [pending, in_progress, done] }
 *               priority: { type: string, enum: [low, medium, high] }
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Invalid ID format
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateRules, taskController.updateById);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete task by id
 *     description: Hard deletes a task. Ownership rules apply.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task deleted
 *       400:
 *         description: Invalid ID format
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', taskController.deleteById);

module.exports = router;
