require('dotenv').config();
const dbConfig = require('../config/database');

let db;

if (dbConfig.client === 'sqlite3') {
  // SQLite for development and testing
  const Database = require('better-sqlite3');
  const sqlite = new Database(dbConfig.connection.filename);
  
  // Wrap SQLite to provide a unified interface
  db = {
    client: 'sqlite3',
    raw: sqlite,
    
    query: (sql, params = []) => {
      try {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          return sqlite.prepare(sql).all(...params);
        } else {
          const result = sqlite.prepare(sql).run(...params);
          return { 
            rowCount: result.changes,
            rows: [],
            lastInsertRowid: result.lastInsertRowid
          };
        }
      } catch (error) {
        console.error('SQLite query error:', error);
        throw error;
      }
    },
    
    get: (sql, params = []) => {
      return sqlite.prepare(sql).get(...params);
    },
    
    run: (sql, params = []) => {
      return sqlite.prepare(sql).run(...params);
    },
    
    all: (sql, params = []) => {
      return sqlite.prepare(sql).all(...params);
    },
    
    exec: (sql) => {
      return sqlite.exec(sql);
    },
    
    prepare: (sql) => {
      return sqlite.prepare(sql);
    },
    
    transaction: (fn) => {
      return sqlite.transaction(fn);
    },
    
    close: () => {
      sqlite.close();
    }
  };
  
} else if (dbConfig.client === 'pg') {
  // PostgreSQL for production
  const { Pool } = require('pg');
  const pool = new Pool(dbConfig.connection);
  
  // Wrap PostgreSQL to provide a unified interface
  db = {
    client: 'pg',
    raw: pool,
    
    query: async (sql, params = []) => {
      try {
        // Convert SQLite-style ?-placeholders to PostgreSQL $1, $2, etc.
        let pgSql = sql;
        let paramIndex = 1;
        pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
        
        const result = await pool.query(pgSql, params);
        return result.rows;
      } catch (error) {
        console.error('PostgreSQL query error:', error);
        throw error;
      }
    },
    
    get: async (sql, params = []) => {
      const rows = await db.query(sql, params);
      return rows[0] || null;
    },
    
    run: async (sql, params = []) => {
      let pgSql = sql;
      let paramIndex = 1;
      pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
      
      const result = await pool.query(pgSql, params);
      return {
        changes: result.rowCount,
        lastInsertRowid: result.rows[0]?.id || null
      };
    },
    
    all: async (sql, params = []) => {
      return await db.query(sql, params);
    },
    
    exec: async (sql) => {
      await pool.query(sql);
    },
    
    transaction: async (fn) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    
    close: async () => {
      await pool.end();
    }
  };
}

module.exports = db;
