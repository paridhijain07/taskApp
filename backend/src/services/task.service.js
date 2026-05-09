const mongoose = require('mongoose');

const Task = require('../models/Task.model');
const User = require('../models/User.model');

const { ApiError } = require('../utils/apiError');

function normalizePagination(page, limit) {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);

  const safeLimit = Math.max(
    parseInt(limit, 10) || 10,
    1
  );

  const skip = (safePage - 1) * safeLimit;

  return {
    safePage,
    safeLimit,
    skip,
  };
}

function buildTaskFilter({
  role,
  userId,
  status,
  priority,
  search,
}) {
  const and = [];

  if (role === 'user') {
    and.push({
      owner: new mongoose.Types.ObjectId(userId),
    });
  }

  if (status) {
    and.push({ status });
  }

  if (priority) {
    and.push({ priority });
  }

  if (search) {
    and.push({
      $text: { $search: search },
    });
  }

  if (!and.length) {
    return {};
  }

  return { $and: and };
}

async function listTasks({ user, query }) {
  const {
    page,
    limit,
    status,
    priority,
    search,
  } = query || {};

  const {
    safePage,
    safeLimit,
    skip,
  } = normalizePagination(page, limit);

  const filter = buildTaskFilter({
    role: user.role,
    userId: user._id,
    status,
    priority,
    search,
  });

  const total = await Task.countDocuments(filter);

  const totalPages =
    Math.ceil(total / safeLimit) || 1;

  const findQuery = Task.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit);

  if (user.role === 'admin') {
    findQuery.populate('owner', 'name email');
  }

  if (search) {
    findQuery.sort({
      score: { $meta: 'textScore' },
      createdAt: -1,
    });
  }

  const tasks = await findQuery.exec();

  return {
    tasks,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
}

async function listTasksForOwnerAsAdmin({
  ownerId,
  query,
}) {
  if (
    !mongoose.Types.ObjectId.isValid(ownerId)
  ) {
    throw new ApiError(
      400,
      'Invalid ID format'
    );
  }

  const {
    page,
    limit,
    status,
    priority,
    search,
  } = query || {};

  const {
    safePage,
    safeLimit,
    skip,
  } = normalizePagination(page, limit);

  const and = [
    {
      owner: new mongoose.Types.ObjectId(
        ownerId
      ),
    },
  ];

  if (status) {
    and.push({ status });
  }

  if (priority) {
    and.push({ priority });
  }

  if (search) {
    and.push({
      $text: { $search: search },
    });
  }

  const filter = and.length
    ? { $and: and }
    : {};

  const total = await Task.countDocuments(
    filter
  );

  const totalPages =
    Math.ceil(total / safeLimit) || 1;

  const findQuery = Task.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit);

  findQuery.populate('owner', 'name email');

  if (search) {
    findQuery.sort({
      score: { $meta: 'textScore' },
      createdAt: -1,
    });
  }

  const tasks = await findQuery.exec();

  return {
    tasks,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
}

async function getTaskById({
  user,
  taskId,
}) {
  if (
    !mongoose.Types.ObjectId.isValid(taskId)
  ) {
    throw new ApiError(
      400,
      'Invalid ID format'
    );
  }

  const task = await Task.findById(taskId)
    .populate('owner', 'name email');

  if (!task) {
    throw new ApiError(
      404,
      'Task not found'
    );
  }

  if (
    user.role === 'user' &&
    String(task.owner?._id || task.owner) !==
      String(user._id)
  ) {
    throw new ApiError(403, 'Forbidden');
  }

  return { task };
}

async function createTask({
  user,
  payload,
}) {
  const task = await Task.create({
    title: payload.title,
    description: payload.description,
    status: payload.status,
    priority: payload.priority,
    owner: user._id,
  });

  const populated = await Task.findById(
    task._id
  ).populate('owner', 'name email');

  return {
    task: populated || task,
  };
}

async function updateTaskById({
  user,
  taskId,
  payload,
}) {
  if (
    !mongoose.Types.ObjectId.isValid(taskId)
  ) {
    throw new ApiError(
      400,
      'Invalid ID format'
    );
  }

  const update = {};

  if (payload.title !== undefined) {
    update.title = payload.title;
  }

  if (payload.description !== undefined) {
    update.description =
      payload.description;
  }

  if (payload.status !== undefined) {
    update.status = payload.status;
  }

  if (payload.priority !== undefined) {
    update.priority = payload.priority;
  }

  const existing = await Task.findById(
    taskId
  );

  if (!existing) {
    throw new ApiError(
      404,
      'Task not found'
    );
  }

  if (
    user.role === 'user' &&
    String(existing.owner) !==
      String(user._id)
  ) {
    throw new ApiError(403, 'Forbidden');
  }

  const updated =
    await Task.findByIdAndUpdate(
      taskId,
      update,
      { new: true }
    ).populate('owner', 'name email');

  return {
    task: updated || existing,
  };
}

async function deleteTaskById({
  user,
  taskId,
}) {
  if (
    !mongoose.Types.ObjectId.isValid(taskId)
  ) {
    throw new ApiError(
      400,
      'Invalid ID format'
    );
  }

  const existing = await Task.findById(
    taskId
  );

  if (!existing) {
    throw new ApiError(
      404,
      'Task not found'
    );
  }

  if (
    user.role === 'user' &&
    String(existing.owner) !==
      String(user._id)
  ) {
    throw new ApiError(403, 'Forbidden');
  }

  await Task.deleteOne({
    _id: existing._id,
  });

  return {
    message: 'Task deleted',
  };
}

async function adminStats() {
  const [
    totalTasks,
    tasksByStatus,
    tasksByPriority,
  ] = await Promise.all([
    Task.countDocuments(),

    Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]),

    Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          priority: '$_id',
          count: 1,
        },
      },
    ]),
  ]);

  const statusMap = {
    pending: 0,
    in_progress: 0,
    done: 0,
  };

  for (const item of tasksByStatus) {
    statusMap[item.status] = item.count;
  }

  const priorityMap = {
    low: 0,
    medium: 0,
    high: 0,
  };

  for (const item of tasksByPriority) {
    priorityMap[item.priority] =
      item.count;
  }

  const [
    totalUsers,
    activeUsers,
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments({
      isActive: true,
    }),
  ]);

  return {
    totalTasks,
    tasksByStatus: statusMap,
    tasksByPriority: priorityMap,
    totalUsers,
    activeUsers,
  };
}

module.exports = {
  listTasks,
  listTasksForOwnerAsAdmin,
  getTaskById,
  createTask,
  updateTaskById,
  deleteTaskById,
  adminStats,
};