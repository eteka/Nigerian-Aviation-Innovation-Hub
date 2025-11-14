const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');
const { logAudit } = require('../utils/auditLogger');
const { logInfo, logWarn, logError } = require('../utils/logger');
const { validate } = require('../middleware/validation');
const router = express.Router();

// Check if any admin exists
router.get('/has-admin', (req, res, next) => {
  try {
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('regulator');
    const hasAdmin = adminCount.count > 0;
    
    logInfo('Admin status check', { hasAdmin }, req);
    res.json({ hasAdmin, requestId: req.requestId });
  } catch (error) {
    next(error);
  }
});

// Register new user
router.post('/register', validate('register'), async (req, res, next) => {
  try {
    const { name, email, password, adminRequested, adminKey } = req.body;

    // Input validation is handled by middleware

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      logWarn('Registration attempt with existing email', { email }, req);
      return res.status(400).json({ 
        error: { 
          code: 'EMAIL_EXISTS', 
          message: 'Email already registered' 
        },
        requestId: req.requestId
      });
    }

    // Determine role based on admin request
    let role = 'innovator';
    
    if (adminRequested === true) {
      // Check if any regulators exist
      const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('regulator');
      const hasExistingAdmin = adminCount.count > 0;
      
      if (!hasExistingAdmin && process.env.ALLOW_FIRST_ADMIN === 'true') {
        // First admin - no key required
        role = 'regulator';
      } else {
        // Subsequent admin - require key
        if (adminKey !== process.env.ADMIN_SIGNUP_SECRET) {
          logWarn('Invalid admin key attempt', { email }, req);
          return res.status(403).json({ 
            error: { 
              code: 'ADMIN_KEY_INVALID', 
              message: 'Invalid admin signup key' 
            },
            requestId: req.requestId
          });
        }
        role = 'regulator';
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, hashedPassword, role);

    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);

    // Create session
    req.session.userId = user.id;

    logInfo('User registered successfully', { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    }, req);

    res.status(201).json({ 
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      requestId: req.requestId
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', validate('login'), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Input validation is handled by middleware

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create session
    req.session.userId = user.id;

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.session.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

// Request admin access
router.post('/request-admin', validate('requestAdmin'), (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { reason } = req.body;
    const userId = req.session.userId;

    // Check if user already has a pending request
    const existingRequest = db.prepare(
      'SELECT id FROM admin_requests WHERE userId = ? AND status = ?'
    ).get(userId, 'pending');

    if (existingRequest) {
      return res.status(409).json({ 
        error: 'You already have a pending admin request' 
      });
    }

    // Create new admin request
    const result = db.prepare(
      'INSERT INTO admin_requests (userId, reason, status) VALUES (?, ?, ?)'
    ).run(userId, reason || null, 'pending');

    res.status(201).json({
      status: 'pending',
      message: 'Admin access request submitted successfully'
    });
  } catch (error) {
    console.error('Request admin error:', error);
    res.status(500).json({ error: 'Failed to submit admin request' });
  }
});

module.exports = router;
