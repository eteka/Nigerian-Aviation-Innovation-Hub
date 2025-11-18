#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🚀 Generating Deployment Configuration\n');
console.log('='.repeat(70));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Generate admin password
const adminPassword = crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + '!Aa1';

console.log('\n📋 RAILWAY ENVIRONMENT VARIABLES');
console.log('='.repeat(70));
console.log('\nCopy these to Railway project settings → Variables:\n');

const railwayEnv = `NODE_ENV=production
DATABASE_URL=\${DATABASE_URL}
PORT=5000
JWT_SECRET=${jwtSecret}
INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
INITIAL_ADMIN_PASSWORD=${adminPassword}
INITIAL_ADMIN_NAME=System Administrator
ALLOW_FIRST_ADMIN=true
COOKIE_SECURE=true
CORS_ORIGIN=https://your-app.vercel.app`;

console.log(railwayEnv);

// Save to file
fs.writeFileSync(
  path.join(__dirname, '..', '.env.railway.generated'),
  railwayEnv + '\n\n# Generated on: ' + new Date().toISOString()
);

console.log('\n✓ Saved to .env.railway.generated');

console.log('\n📋 VERCEL ENVIRONMENT VARIABLES');
console.log('='.repeat(70));
console.log('\nAdd these in Vercel project settings → Environment Variables:\n');

const vercelEnv = `VITE_API_BASE=https://your-app.up.railway.app`;

console.log(vercelEnv);

// Save to file
fs.writeFileSync(
  path.join(__dirname, '..', '.env.vercel.generated'),
  vercelEnv + '\n\n# Generated on: ' + new Date().toISOString()
);

console.log('\n✓ Saved to .env.vercel.generated');

console.log('\n📝 IMPORTANT NOTES');
console.log('='.repeat(70));
console.log('\n1. Update CORS_ORIGIN in Railway after deploying to Vercel');
console.log('2. Update VITE_API_BASE in Vercel with your Railway URL');
console.log('3. Change admin password immediately after first login');
console.log('4. Set ALLOW_FIRST_ADMIN=false after creating first admin');
console.log('\n⚠️  SECURITY: Keep these credentials secure!');
console.log('   Admin Password: ' + adminPassword);
console.log('   (This password will only be shown once)\n');

console.log('='.repeat(70));
console.log('\n✅ Configuration generated successfully!\n');
