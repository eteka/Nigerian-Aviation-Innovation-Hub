require('dotenv').config();
const db = require('./server/db');
const { bootstrap } = require('./server/db/bootstrap');

async function testDatabaseAbstraction() {
  try {
    console.log('Testing database abstraction layer...\n');
    console.log(`Database client: ${db.client}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
    
    // Bootstrap database
    await bootstrap();
    
    // Test 1: Query all users
    console.log('Test 1: Query all users');
    const users = await db.all('SELECT * FROM users');
    console.log(`  Found ${users.length} users`);
    if (users.length > 0) {
      console.log(`  Sample user: ${users[0].email} (${users[0].role})`);
    }
    
    // Test 2: Get single user
    console.log('\nTest 2: Get single user');
    const user = await db.get('SELECT * FROM users WHERE role = ?', ['regulator']);
    if (user) {
      console.log(`  Found regulator: ${user.email}`);
    } else {
      console.log('  No regulator found');
    }
    
    // Test 3: Count projects
    console.log('\nTest 3: Count projects');
    const projectCount = await db.get('SELECT COUNT(*) as count FROM projects');
    console.log(`  Total projects: ${projectCount.count}`);
    
    // Test 4: Check audit logs
    console.log('\nTest 4: Check audit logs');
    const auditCount = await db.get('SELECT COUNT(*) as count FROM audit_logs');
    console.log(`  Total audit logs: ${auditCount.count}`);
    
    // Test 5: Check admin requests
    console.log('\nTest 5: Check admin requests');
    const adminRequestCount = await db.get('SELECT COUNT(*) as count FROM admin_requests');
    console.log(`  Total admin requests: ${adminRequestCount.count}`);
    
    console.log('\n✓ All database abstraction tests passed!');
    console.log('\nDatabase abstraction layer is working correctly.');
    console.log(`Using ${db.client === 'sqlite3' ? 'SQLite' : 'PostgreSQL'} database.`);
    
    // Close connection
    if (db.client === 'pg') {
      await db.close();
    } else {
      db.close();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Database test failed:', error);
    process.exit(1);
  }
}

testDatabaseAbstraction();
