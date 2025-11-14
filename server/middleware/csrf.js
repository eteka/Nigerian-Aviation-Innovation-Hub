const crypto = require('crypto');
const { logWarn } = require('../utils/logger');

// Generate a secure random token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF token generation endpoint
const generateCSRFTokenEndpoint = (req, res) => {
  const csrfToken = generateCSRFToken();
  
  // Set CSRF token in a non-httpOnly cookie so frontend can read it
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false, // Frontend needs to read this
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.json({
    csrfToken,
    requestId: req.requestId
  });
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF protection for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get token from header
  const headerToken = req.get('X-CSRF-Token') || req.get('X-XSRF-TOKEN');
  
  // Get token from cookie
  const cookieToken = req.cookies['XSRF-TOKEN'];

  // Check if both tokens exist
  if (!headerToken || !cookieToken) {
    logWarn('CSRF token missing', {
      hasHeaderToken: !!headerToken,
      hasCookieToken: !!cookieToken,
      method: req.method,
      url: req.url
    }, req);

    return res.status(403).json({
      error: {
        code: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token required for this operation'
      },
      requestId: req.requestId
    });
  }

  // Verify tokens match (double-submit pattern)
  if (headerToken !== cookieToken) {
    logWarn('CSRF token mismatch', {
      headerToken: headerToken.substring(0, 8) + '...',
      cookieToken: cookieToken.substring(0, 8) + '...',
      method: req.method,
      url: req.url
    }, req);

    return res.status(403).json({
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'Invalid CSRF token'
      },
      requestId: req.requestId
    });
  }

  // Token is valid, proceed
  next();
};

module.exports = {
  generateCSRFTokenEndpoint,
  csrfProtection
};