const rateLimit = require('express-rate-limit');
const { logWarn } = require('../utils/logger');

// Default rate limiter (100 requests per 15 minutes)
// Read-only "who am I / is there an admin / give me a CSRF token" questions are asked on every
// page load, so they must not use up the allowance meant for password guessing.
const PAGE_LOAD_PATHS = new Set(['/api/auth/me', '/api/auth/has-admin', '/api/v1/csrf']);
const isPageLoadCheck = (req) =>
  req.method === 'GET' && PAGE_LOAD_PATHS.has((req.originalUrl || req.url).split('?')[0]);

const defaultLimiter = rateLimit({
  skip: isPageLoadCheck,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logWarn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    }, req);
    
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later'
      },
      requestId: req.requestId
    });
  }
});

// Stricter rate limiter for auth endpoints (20 requests per 15 minutes)
const authLimiter = rateLimit({
  skip: isPageLoadCheck,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs for auth endpoints
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logWarn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    }, req);
    
    res.status(429).json({
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later'
      },
      requestId: req.requestId
    });
  }
});

module.exports = {
  defaultLimiter,
  authLimiter
};