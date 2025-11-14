const express = require('express');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');
const { validate, validateId } = require('../middleware/validation');
const router = express.Router();

// Get all projects (public, with optional category filter)
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT 
        p.id, p.title, p.description, p.category, p.status, p.created_at, p.updated_at,
        u.id as owner_id, u.name as owner_name, u.email as owner_email
      FROM projects p
      JOIN users u ON p.owner_user_id = u.id
    `;
    
    const params = [];
    
    if (category) {
      query += ' WHERE p.category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const projects = db.prepare(query).all(...params);
    
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project by ID (public)
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const project = db.prepare(`
      SELECT 
        p.id, p.title, p.description, p.category, p.status, p.created_at, p.updated_at,
        u.id as owner_id, u.name as owner_name, u.email as owner_email
      FROM projects p
      JOIN users u ON p.owner_user_id = u.id
      WHERE p.id = ?
    `).get(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project (requires authentication)
router.post('/', requireAuth, validate('createProject'), (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    
    // Input validation is handled by middleware
    
    // Insert project
    const result = db.prepare(`
      INSERT INTO projects (title, description, category, owner_user_id)
      VALUES (?, ?, ?, ?)
    `).run(title, description, category, req.session.userId);
    
    // Get the created project
    const project = db.prepare(`
      SELECT 
        p.id, p.title, p.description, p.category, p.status, p.created_at, p.updated_at,
        u.id as owner_id, u.name as owner_name, u.email as owner_email
      FROM projects p
      JOIN users u ON p.owner_user_id = u.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    next(error);
  }
});

// Update project (requires ownership or regulator role)
router.put('/:id', requireAuth, validateId(), validate('updateProject'), (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    
    // Get project and check ownership
    const project = db.prepare('SELECT owner_user_id FROM projects WHERE id = ?').get(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is owner or regulator
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.session.userId);
    const isOwner = project.owner_user_id === req.session.userId;
    const isRegulator = user && user.role === 'regulator';
    
    if (!isOwner && !isRegulator) {
      return res.status(403).json({ error: 'You do not have permission to update this project' });
    }
    
    // Input validation is handled by middleware
    
    // Build update query
    const updates = [];
    const params = [];
    
    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description) {
      updates.push('description = ?');
      params.push(description);
    }
    if (category) {
      updates.push('category = ?');
      params.push(category);
    }
    
    // Validation ensures at least one field is provided
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    
    // Get updated project
    const updatedProject = db.prepare(`
      SELECT 
        p.id, p.title, p.description, p.category, p.status, p.created_at, p.updated_at,
        u.id as owner_id, u.name as owner_name, u.email as owner_email
      FROM projects p
      JOIN users u ON p.owner_user_id = u.id
      WHERE p.id = ?
    `).get(id);
    
    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
