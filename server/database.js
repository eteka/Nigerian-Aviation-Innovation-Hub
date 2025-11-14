const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'aviation-hub.db'));

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'innovator',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create sessions table
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Create projects table
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Aircraft Tech', 'Operations', 'Sustainable Fuel', 'Offsets')),
    owner_user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'Submitted',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
  )
`);

// Create audit_logs table
function createAuditTable() {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          actorUserId INTEGER NOT NULL,
          action TEXT NOT NULL,
          targetType TEXT NOT NULL,
          targetId INTEGER NOT NULL,
          before JSON,
          after JSON,
          ip TEXT,
          userAgent TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (actorUserId) REFERENCES users(id)
        )
      `);
      
      db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_createdAt ON audit_logs(createdAt DESC)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action)`);
      
      break; // Success, exit loop
    } catch (error) {
      attempts++;
      if (error.code === 'SQLITE_BUSY' && attempts < maxAttempts) {
        console.log(`Database busy, retrying audit table creation (attempt ${attempts}/${maxAttempts})...`);
        // Wait 200ms before retry
        const start = Date.now();
        while (Date.now() - start < 200) {
          // Busy wait
        }
      } else {
        throw error;
      }
    }
  }
}

createAuditTable();

// Create admin_requests table
function createAdminRequestsTable() {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS admin_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          reason TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `);
      
      db.exec(`CREATE INDEX IF NOT EXISTS idx_admin_requests_createdAt ON admin_requests(createdAt DESC)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status)`);
      
      break; // Success, exit loop
    } catch (error) {
      attempts++;
      if (error.code === 'SQLITE_BUSY' && attempts < maxAttempts) {
        console.log(`Database busy, retrying admin requests table creation (attempt ${attempts}/${maxAttempts})...`);
        // Wait 200ms before retry
        const start = Date.now();
        while (Date.now() - start < 200) {
          // Busy wait
        }
      } else {
        throw error;
      }
    }
  }
}

createAdminRequestsTable();

console.log('Database initialized successfully');

module.exports = db;
