const { v4: uuidv4 } = require('uuid');

// Add unique request ID to each request
const requestIdMiddleware = (req, res, next) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

module.exports = requestIdMiddleware;