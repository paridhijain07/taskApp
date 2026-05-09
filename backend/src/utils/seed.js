const mongoose = require('mongoose');

const { env } = require('../config/env');
const logger = require('./logger');
const User = require('../models/User.model');
const Task = require('../models/Task.model');
const RefreshToken = require('../models/RefreshToken.model');

async function seed() {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

  // Clear collections in correct order (tokens -> tasks -> users)
  await RefreshToken.deleteMany({});
  await Task.deleteMany({});
  await User.deleteMany({});

  const [admin, user1, user2] = await Promise.all([
    User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'Admin@1234',
      role: 'admin',
    }),
    User.create({
      name: 'User One',
      email: 'user1@test.com',
      password: 'User@1234',
      role: 'user',
    }),
    User.create({
      name: 'User Two',
      email: 'user2@test.com',
      password: 'User@1234',
      role: 'user',
    }),
  ]);

  const user1Tasks = [
    { title: 'Set up project', description: 'Initialize repo and CI', status: 'done', priority: 'high' },
    {
      title: 'Implement JWT refresh',
      description: 'Add refresh-token rotation',
      status: 'in_progress',
      priority: 'medium',
    },
    { title: 'Design RBAC middleware', description: 'Role-based access checks', status: 'pending', priority: 'low' },
    { title: 'Write Swagger docs', description: 'Document all endpoints', status: 'pending', priority: 'medium' },
    { title: 'MongoDB indexing', description: 'Add indexes for filtering/search', status: 'done', priority: 'high' },
  ];

  const user2Tasks = [
    { title: 'Frontend auth flow', description: 'Axios interceptor refresh flow', status: 'in_progress', priority: 'high' },
    { title: 'Task CRUD UI', description: 'Create/edit/delete tasks', status: 'pending', priority: 'medium' },
    { title: 'UI polish', description: 'Responsive layout and toasts', status: 'done', priority: 'low' },
  ];

  await Task.insertMany([
    ...user1Tasks.map((t) => ({ ...t, owner: user1._id })),
    ...user2Tasks.map((t) => ({ ...t, owner: user2._id })),
  ]);

  logger.info('Seed completed', {
    usersCreated: 3,
    tasksCreated: 8,
  });

  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch(async (err) => {
    logger.error('Seed failed', { err: err?.message || String(err) });
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });

