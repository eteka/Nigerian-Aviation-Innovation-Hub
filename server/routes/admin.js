const express = require('express');
const db = require('../database');
const { requireAuth, requireRegulator } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');
const { validate, validateId } = require('../middleware/validation');
const router = express.Router();

// All admin routes require regulator role
router.use(requireAuth);
router.use(requireRegulator);

// List projects with filters
router.get('/projects', (req, res) => {
  try {
    const { status, category, q } = req.query;
    
    let query = `
      SELECT 
        p.id, p.title, p.category, p.status, p.created_at as createdAt, p.updated_at,
        u.id as owner_id, u.name as owner_name, u.email as owner_email
      FROM projects p
      JOIN users u ON p.owner_user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }
    
    if (q) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ? OR u.name LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY p.updated_at DESC';
    
    const projects = db.prepare(query).all(...params);
    
    // Format response
    const formattedProjects = projects.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updated_at,
      owner: {
        id: p.owner_id,
        name: p.owner_name,
        email: p.owner_email
      }
    }));
    
    res.json(formattedProjects);
  } catch (error) {
    console.error('Admin get projects error:', error);
    res.status(500).json({ error: { code: 'DB_ERROR', message: 'Failed to fetch projects' } });
  }
});

// Update project status
router.put('/projects/:id/status', validateId(), validate('updateProjectStatus'), (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Input validation is handled by middleware
    
    // Get current project
    const currentProject = db.prepare('SELECT status FROM projects WHERE id = ?').get(id);
    if (!currentProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const oldStatus = currentProject.status;
    
    // Update status
    const result = db.prepare('UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Log audit entry
    logAudit({
      actorUserId: req.session.userId,
      action: 'PROJECT_STATUS_UPDATED',
      targetType: 'project',
      targetId: parseInt(id),
      before: { status: oldStatus },
      after: { status: status },
      req
    });
    
    res.json({
      id: parseInt(id),
      status: status,
      message: 'Project status updated successfully'
    });
  } catch (error) {
    console.error('Admin update project status error:', error);
    res.status(500).json({ error: { code: 'DB_ERROR', message: 'Failed to update project status' } });
  }
});

// List users
router.get('/users', (req, res) => {
  try {
    const { q } = req.query;
    
    let query = 'SELECT id, name, email, role, created_at as createdAt FROM users WHERE 1=1';
    const params = [];
    
    if (q) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const users = db.prepare(query).all(...params);
    res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: { code: 'DB_ERROR', message: 'Failed to fetch users' } });
  }
});

// Update user role
router.put('/users/:id/role', validateId(), validate('updateUserRole'), (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Input validation is handled by middleware
    
    // Prevent self-demotion
    if (parseInt(id) === req.session.userId) {
      const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(id);
      if (currentUser && currentUser.role === 'regulator' && role === 'innovator') {
        return res.status(400).json({ error: 'Cannot demote yourself from regulator to innovator' });
      }
    }
    
    // Get current user
    const currentUser = db.prepare('SELECT role FROM users WHERE id = ?').get(id);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const oldRole = currentUser.role;
    
    // Update role
    const result = db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Log audit entry
    logAudit({
      actorUserId: req.session.userId,
      action: 'USER_ROLE_UPDATED',
      targetType: 'user',
      targetId: parseInt(id),
      before: { role: oldRole },
      after: { role: role },
      req
    });
    
    res.json({
      id: parseInt(id),
      role: role,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Admin update user role error:', error);
    res.status(500).json({ error: { code: 'DB_ERROR', message: 'Failed to update user role' } });
  }
});

// Get audit logs
router.get('/audit-logs', (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
    
    const logs = db.prepare(`
      SELECT 
        a.id, a.action, a.targetType, a.targetId, a.before, a.after, 
        a.ip, a.userAgent, a.createdAt,
        u.id as actor_id, u.email as actor_email
      FROM audit_logs a
      JOIN users u ON a.actorUserId = u.id
      ORDER BY a.createdAt DESC
      LIMIT ?
    `).all(limit);
    
    // Format response
    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      before: log.before ? JSON.parse(log.before) : null,
      after: log.after ? JSON.parse(log.after) : null,
      actor: {
        id: log.actor_id,
        email: log.actor_email
      },
      ip: log.ip,
      userAgent: log.userAgent,
      createdAt: log.createdAt
    }));
    
    res.json(formattedLogs);
  } catch (error) {
    console.error('Admin get audit logs error:', error);
    res.status(500).json({ error: { code: 'DB_ERROR', message: 'Failed to fetch audit logs' } });
  }
});

// Get admin requests
router.get('/requests', (req, res) => {
  try {
    const requests = db.prepare(`
      SELECT 
        ar.id, ar.reason, ar.status, ar.createdAt,
        u.id as user_id, u.name as user_name, u.email as user_email
      FROM admin_requests ar
      JOIN users u ON ar.userId = u.id
      ORDER BY ar.createdAt DESC
    `).all();
    
    // Format response
    const formattedRequests = requests.map(req => ({
      id: req.id,
      user: {
        id: req.user_id,
        name: req.user_name,
        email: req.user_email
      },
      reason: req.reason,
      status: req.status,
      createdAt: req.createdAt
    }));
    
    res.json(formattedRequests);
  } catch (error) {
    console.error('Admin get requests error:', error);
    res.status(500).json({ error: { code: 'DB_ERROR', message: 'Failed to fetch admin requests' } });
  }
});

// Approve admin request
router.put('/requests/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the request
    const request = db.prepare(`
      SELECT ar.*, u.role as current_role 
      FROM admin_requests ar 
      JOIN users u ON ar.userId = u.id 
      WHERE ar.id = ?
    `).get(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Admin request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }
    
    // Update request status
    db.prepare('UPDATE admin_requests SET status = ? WHERE id = ?').run('approved', id);
    
    // Update user role to regulator
    const oldRole = request.current_role;
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run('regulator', request.userId);
    
    // Log audit entry
    logAudit({
      actorUserId: req.session.userId,
      action: 'USER_ROLE_UPDATED',
      targetType: 'user',
      targetId: request.userId,
      before: { role: oldRole },
      after: { role: 'regulator' },
      req
    });
    
    // Get updated request
    const updatedRequest = db.prepare(`
      SELECT 
        ar.id, ar.reason, ar.status, ar.createdAt,
        u.id as user_id, u.name as user_name, u.email as user_email
      FROM admin_requests ar
      JOIN users u ON ar.userId = u.id
      WHERE ar.id = ?
    `).get(id);
    
    res.json({
      id: updatedRequest.id,
      user: {
        id: updatedRequest.user_id,
        name: updatedRequest.user_name,
        email: updatedRequest.user_email
      },
      reason: updatedRequest.reason,
      status: updatedRequest.status,
      createdAt: updatedRequest.createdAt,
      message: 'Admin request approved successfully'
    });
  } catch (error) {
    console.error('Admin approve request error:', error);
    res.status(500).json({ error: { code: 'DB_ERROR', message: 'Failed to approve admin request' } });
  }
});

// Reject admin request
router.put('/requests/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the request
    const request = db.prepare('SELECT * FROM admin_requests WHERE id = ?').get(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Admin request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }
    
    // Update request status
    db.prepare('UPDATE admin_requests SET status = ? WHERE id = ?').run('rejected', id);
    
    // Log audit entry
    logAudit({
      actorUserId: req.session.userId,
      action: 'ADMIN_REQUEST_REJECTED',
      targetType: 'admin_request',
      targetId: parseInt(id),
      before: { status: 'pending' },
      after: { status: 'rejected' },
      req
    });
    
    // Get updated request
    const updatedRequest = db.prepare(`
      SELECT 
        ar.id, ar.reason, ar.status, ar.createdAt,
        u.id as user_id, u.name as user_name, u.email as user_email
      FROM admin_requests ar
      JOIN users u ON ar.userId = u.id
      WHERE ar.id = ?
    `).get(id);
    
    res.json({
      id: updatedRequest.id,
      user: {
        id: updatedRequest.user_id,
        name: updatedRequest.user_name,
        email: updatedRequest.user_email
      },
      reason: updatedRequest.reason,
      status: updatedRequest.status,
      createdAt: updatedRequest.createdAt,
      message: 'Admin request rejected'
    });
  } catch (error) {
    console.error('Admin reject request error:', error);
    res.status(500).json({ error: { code: 'DB_ERROR', message: 'Failed to reject admin request' } });
  }
});

module.exports = router;