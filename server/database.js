// Legacy database module - now uses the new abstraction layer
// This file is kept for backward compatibility
require('dotenv').config();
const db = require('./db');
const { bootstrap } = require('./db/bootstrap');

// Bootstrap database on first load (auto-create tables if missing)
(async () => {
  try {
    await bootstrap();
  } catch (error) {
    console.error('Failed to bootstrap database:', error);
    process.exit(1);
  }
})();

module.exports = db;
