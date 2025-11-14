const { logError } = require('../utils/logger');

// Centralized error handler
const errorHandler = (err, req, res, next) => {
  // Log the error
  logError(err, req, { 
    body: req.body,
    params: req.params,
    query: req.query 
  });

  // Default error response
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Invalid input data';
    details = err.details;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Authentication required';
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 400;
    errorCode = 'DATABASE_CONSTRAINT';
    message = 'Database constraint violation';
  } else if (err.code === 'SQLITE_BUSY') {
    statusCode = 503;
    errorCode = 'DATABASE_BUSY';
    message = 'Database temporarily unavailable';
  } else if (err.statusCode) {
    // Express errors with statusCode
    statusCode = err.statusCode;
    errorCode = err.code || 'HTTP_ERROR';
    message = err.message;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
    details = null;
  }

  // Send structured error response
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
      ...(details && { details })
    },
    requestId: req.requestId
  });
};

// 404 handler for unknown routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    },
    requestId: req.requestId
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};