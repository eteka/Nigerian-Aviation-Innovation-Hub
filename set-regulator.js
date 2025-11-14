// Helper script to set a user as regulator
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'server', 'aviation-hub.db'));

const email = process.argv[2];

if (!email) {
  console.log('Usage: node set-regulator.js <email>');
  console.log('Example: node set-regulator.js test@example.com');
  process.exit(1);
}

try {
  const result = db.prepare('UPDATE users SET role = ? WHERE email = ?').run('regulator', email);
  
  if (result.changes > 0) {
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE email = ?').get(email);
    console.log('✓ User updated successfully:');
    console.log(user);
  } else {
    console.log('❌ User not found with email:', email);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}

db.close();
