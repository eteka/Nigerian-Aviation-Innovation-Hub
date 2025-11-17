require('dotenv').config();
const dbConfig = require('../config/database');

// Migration definitions
const migrations = {
  sqlite: [
    {
      name: '001_create_users_table',
      up: `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'innovator',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `
    },
    {
      name: '002_create_sessions_table',
      up: `
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          expires_at INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `
    },
    {
      name: '003_create_projects_table',
      up: `
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
      `
    },
    {
      name: '004_create_audit_logs_table',
      up: `
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
        );
        CREATE INDEX IF NOT EXISTS idx_audit_createdAt ON audit_logs(createdAt DESC);
        CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
      `
    },
    {
      name: '005_create_admin_requests_table',
      up: `
        CREATE TABLE IF NOT EXISTS admin_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          reason TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id)
        );
        CREATE INDEX IF NOT EXISTS idx_admin_requests_createdAt ON admin_requests(createdAt DESC);
        CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);
      `
    }
  ],
  
  postgres: [
    {
      name: '001_create_users_table',
      up: `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'innovator',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    },
    {
      name: '002_create_sessions_table',
      up: `
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          expires_at BIGINT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `
    },
    {
      name: '003_create_projects_table',
      up: `
        CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL CHECK(category IN ('Aircraft Tech', 'Operations', 'Sustainable Fuel', 'Offsets')),
          owner_user_id INTEGER NOT NULL,
          status TEXT DEFAULT 'Submitted',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `
    },
    {
      name: '004_create_audit_logs_table',
      up: `
        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          actorUserId INTEGER NOT NULL,
          action TEXT NOT NULL,
          targetType TEXT NOT NULL,
          targetId INTEGER NOT NULL,
          before JSONB,
          after JSONB,
          ip TEXT,
          userAgent TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (actorUserId) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_audit_createdAt ON audit_logs(createdAt DESC);
        CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
      `
    },
    {
      name: '005_create_admin_requests_table',
      up: `
        CREATE TABLE IF NOT EXISTS admin_requests (
          id SERIAL PRIMARY KEY,
          userId INTEGER NOT NULL,
          reason TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_admin_requests_createdAt ON admin_requests(createdAt DESC);
        CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);
      `
    }
  ]
};

async function runMigrations(db) {
  const isPostgres = dbConfig.client === 'pg';
  const migrationList = isPostgres ? migrations.postgres : migrations.sqlite;
  
  console.log(`Running migrations for ${isPostgres ? 'PostgreSQL' : 'SQLite'}...`);
  
  for (const migration of migrationList) {
    try {
      console.log(`  Running migration: ${migration.name}`);
      
      if (isPostgres) {
        await db.exec(migration.up);
      } else {
        db.exec(migration.up);
      }
      
      console.log(`  ✓ ${migration.name} completed`);
    } catch (error) {
      console.error(`  ✗ Migration ${migration.name} failed:`, error.message);
      throw error;
    }
  }
  
  console.log('All migrations completed successfully');
}

module.exports = { runMigrations };
