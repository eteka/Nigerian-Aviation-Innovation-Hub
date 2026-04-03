const db = require('./server/database');

console.log('Checking for regulators in database...\n');

const regulators = db.prepare('SELECT id, name, email, role FROM users WHERE role = ?').all('regulator');

if (regulators.length === 0) {
  console.log('❌ No regulators found in database');
} else {
  console.log(`✓ Found ${regulators.length} regulator(s):\n`);
  regulators.forEach(reg => {
    console.log(`  ID: ${reg.id}`);
    console.log(`  Name: ${reg.name}`);
    console.log(`  Email: ${reg.email}`);
    console.log(`  Role: ${reg.role}`);
    console.log('');
  });
}

db.close();
