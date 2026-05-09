// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');

// const app = express();

// // ==========================
// // Security Middlewares
// // ==========================

// app.use(helmet());

// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'https://taskapp-1-cbic.onrender.com'
//   ],
//   credentials: true
// }));

// // ==========================
// // Body Parsers
// // ==========================

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ==========================
// // Rate Limiting
// // ==========================

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: {
//     success: false,
//     message: 'Too many requests, please try again later.'
//   }
// });

// app.use('/api/v1/auth', authLimiter);

// // ==========================
// // Health Check
// // ==========================

// app.get('/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'Server is healthy'
//   });
// });

// // ==========================
// // Routes
// // ==========================

// const authRoutes = require('./src/routes/v1/auth.routes');
// const userRoutes = require('./src/routes/v1/user.routes');
// const taskRoutes = require('./src/routes/v1/task.routes');

// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/tasks', taskRoutes);

// // ==========================
// // 404 Handler
// // ==========================

// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// // ==========================
// // Global Error Handler
// // ==========================

// app.use((err, req, res, next) => {
//   console.error(err);

//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error'
//   });
// });

// module.exports = app;

const http = require('http');

const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 10000;

const server = http.createServer(app);

async function start() {
  try {
    console.log('Starting server...');

    await connectDB();

    console.log('MongoDB connected');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('SERVER ERROR:', err);
    process.exit(1);
  }
}

start();