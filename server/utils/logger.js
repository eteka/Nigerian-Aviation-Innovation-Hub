const winston = require('winston');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'aviation-hub-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Structured logging functions
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};

const logError = (error, req, context = {}) => {
  logger.error('Application Error', {
    requestId: req?.requestId,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code
    },
    context,
    url: req?.url,
    method: req?.method,
    ip: req?.ip
  });
};

const logInfo = (message, data = {}, req = null) => {
  logger.info(message, {
    requestId: req?.requestId,
    ...data
  });
};

const logWarn = (message, data = {}, req = null) => {
  logger.warn(message, {
    requestId: req?.requestId,
    ...data
  });
};

module.exports = {
  logger,
  logRequest,
  logError,
  logInfo,
  logWarn
};