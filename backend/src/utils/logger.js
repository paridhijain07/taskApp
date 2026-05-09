const { env } = require('../config/env');

const winston = require('winston');

const transports = [
  new winston.transports.Console({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level}] ${message}${metaStr}`;
      })
    ),
  }),
];

const logger = winston.createLogger({
  level: 'info',
  transports,
  exitOnError: false,
});

module.exports = logger;
