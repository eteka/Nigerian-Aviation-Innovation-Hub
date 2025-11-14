// Check what users exist in the database
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'server', 'aviation-hub.db'));

console.log('Current users in database:\n');

try {
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at').all();
  
  if (users.length === 0) {
    console.log('No users found in database.');
  } else {
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${user.created_at}`);
      console.log('---');
    });
  }
} catch (error) {
  console.error('Error:', error.message);
} finally {
  db.close();
}