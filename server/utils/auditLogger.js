const db = require('../database');

function logAudit({ actorUserId, action, targetType, targetId, before = null, after = null, req }) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    const stmt = db.prepare(`
      INSERT INTO audit_logs (actorUserId, action, targetType, targetId, before, after, ip, userAgent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      actorUserId,
      action,
      targetType,
      targetId,
      before ? JSON.stringify(before) : null,
      after ? JSON.stringify(after) : null,
      ip,
      userAgent
    );
    
    console.log(`Audit log: ${action} on ${targetType}:${targetId} by user:${actorUserId}`);
  } catch (error) {
    console.error('Failed to log audit entry:', error);
    // Don't throw - audit logging failure shouldn't break the main operation
  }
}

module.exports = { logAudit };