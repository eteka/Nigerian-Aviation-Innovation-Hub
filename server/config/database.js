require('dotenv').config();
const path = require('path');

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '..', 'aviation-hub.db')
    }
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'aviation_hub',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};

const env = process.env.NODE_ENV || 'development';

module.exports = config[env];
