const db = require('../database');

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Middleware to check if user has regulator role
function requireRegulator(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.session.userId);
  
  if (!user || user.role !== 'regulator') {
    return res.status(403).json({ error: 'Regulator access required' });
  }
  
  next();
}

module.exports = { requireAuth, requireRegulator };
