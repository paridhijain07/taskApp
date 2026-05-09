const { asyncHandler } = require('../utils/asyncHandler');
const { apiResponse } = require('../utils/apiResponse');
const {
  listTasks,
  listTasksForOwnerAsAdmin,
  getTaskById,
  createTask,
  updateTaskById,
  deleteTaskById,
  adminStats,
} = require('../services/task.service');

const taskController = {
  create: asyncHandler(async (req, res) => {
    const result = await createTask({ user: req.user, payload: req.body });
    res.status(201);
    return apiResponse({ res, message: 'Task created', data: result.task });
  }),

  list: asyncHandler(async (req, res) => {
    const result = await listTasks({ user: req.user, query: req.query });
    return apiResponse({ res, message: 'Tasks fetched', data: result.tasks, meta: result.meta });
  }),

  getById: asyncHandler(async (req, res) => {
    const result = await getTaskById({ user: req.user, taskId: req.params.id });
    return apiResponse({ res, message: 'Task fetched', data: result.task });
  }),

  updateById: asyncHandler(async (req, res) => {
    const result = await updateTaskById({
      user: req.user,
      taskId: req.params.id,
      payload: req.body,
    });
    return apiResponse({ res, message: 'Task updated', data: result.task });
  }),

  deleteById: asyncHandler(async (req, res) => {
    const result = await deleteTaskById({ user: req.user, taskId: req.params.id });
    return apiResponse({ res, message: result.message, data: null });
  }),

  adminStats: asyncHandler(async (req, res) => {
    const result = await adminStats();
    return apiResponse({ res, message: 'Stats fetched', data: result });
  }),

  adminListByOwner: asyncHandler(async (req, res) => {
    const result = await listTasksForOwnerAsAdmin({
      ownerId: req.params.ownerId,
      query: req.query,
    });
    return apiResponse({
      res,
      message: 'Tasks fetched',
      data: result.tasks,
      meta: result.meta,
    });
  }),
};

module.exports = taskController;
