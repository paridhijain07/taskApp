const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const { swaggerSpec } = require('./config/swagger');
const v1Router = require('./routes/v1');
const { ApiError } = require('./utils/apiError');
const { globalErrorHandler } = require('./middlewares/error.middleware');
const { env } = require('./config/env');

const app = express();

// 1. helmet()
app.use(helmet());

// 2. cors({ origin: process.env.FRONTEND_URL, credentials: true })
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// 3. express.json({ limit: '10kb' })
app.use(express.json({ limit: '10kb' }));

// 4. express.urlencoded({ extended: true })
app.use(express.urlencoded({ extended: true }));

// 5. morgan('dev') in development
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 6. /api/docs → swaggerUi.serve, swaggerUi.setup(swaggerSpec)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 7. /api/v1 → router
app.use('/api/v1', v1Router);

// 8. 404 handler for unknown routes
app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

// 9. globalErrorHandler (last middleware)
app.use(globalErrorHandler);

module.exports = app;
