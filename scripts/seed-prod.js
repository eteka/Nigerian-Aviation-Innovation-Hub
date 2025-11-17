require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../server/db');
const { bootstrap } = require('../server/db/bootstrap');

async function seedProduction() {
  try {
    console.log('Starting production seed...');
    
    // Ensure database is bootstrapped
    await bootstrap();
    
    // Get initial admin email from environment
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMe123!';
    const adminName = process.env.INITIAL_ADMIN_NAME || 'System Administrator';
    
    if (!adminEmail) {
      console.error('ERROR: INITIAL_ADMIN_EMAIL environment variable is required');
      process.exit(1);
    }
    
    // Check if admin already exists
    const existingAdmin = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [adminEmail]
    );
    
    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists. Skipping creation.`);
      
      // Update role to regulator if not already
      if (existingAdmin.role !== 'regulator') {
        await db.run(
          'UPDATE users SET role = ? WHERE email = ?',
          ['regulator', adminEmail]
        );
        console.log(`Updated ${adminEmail} role to 'regulator'`);
      }
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Create initial regulator admin
      const result = await db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [adminName, adminEmail, hashedPassword, 'regulator']
      );
      
      console.log(`✓ Created initial regulator admin:`);
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Name: ${adminName}`);
      console.log(`  Role: regulator`);
      
      if (adminPassword === 'ChangeMe123!') {
        console.log('\n⚠️  WARNING: Using default password. Please change it immediately after first login!');
      }
    }
    
    console.log('\nProduction seed completed successfully');
    
    // Close database connection
    if (db.client === 'pg') {
      await db.close();
    } else {
      db.close();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Production seed failed:', error);
    process.exit(1);
  }
}

seedProduction();
