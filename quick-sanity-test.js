const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function test() {
  console.log('🔍 Quick Sanity Test\n');
  
  // Create axios instance with cookie jar
  const client = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  try {
    // 1. Health Check
    console.log('1. GET /api/v1/health');
    const health = await client.get('/api/v1/health');
    console.log(`   ✓ Status: ${health.data.status}\n`);

    // 2. CSRF Token
    console.log('2. GET /api/v1/csrf');
    const csrf1 = await client.get('/api/v1/csrf');
    console.log(`   ✓ CSRF Token: ${csrf1.data.csrfToken.substring(0, 20)}...\n`);

    // 3. Register
    console.log('3. POST /api/auth/register');
    const testEmail = `test${Date.now()}@example.com`;
    const registerRes = await client.post('/api/auth/register', {
      name: 'Test User',
      email: testEmail,
      password: 'TestPass123!'
    }, {
      headers: { 'X-CSRF-Token': csrf1.data.csrfToken }
    });
    console.log(`   ✓ User created: ${registerRes.data.user.email}`);
    console.log(`   ✓ Role: ${registerRes.data.user.role}\n`);

    // 4. Login
    console.log('4. POST /api/auth/login');
    const csrf2 = await client.get('/api/v1/csrf');
    const loginRes = await client.post('/api/auth/login', {
      email: testEmail,
      password: 'TestPass123!'
    }, {
      headers: { 'X-CSRF-Token': csrf2.data.csrfToken }
    });
    console.log(`   ✓ Logged in: ${loginRes.data.user.email}\n`);

    // 5. Create Project
    console.log('5. POST /api/projects');
    const csrf3 = await client.get('/api/v1/csrf');
    const projectRes = await client.post('/api/projects', {
      title: 'Test Aviation Project',
      description: 'Testing project creation with CSRF',
      category: 'Aircraft Tech'
    }, {
      headers: { 'X-CSRF-Token': csrf3.data.csrfToken }
    });
    console.log(`   ✓ Project created: ${projectRes.data.title}`);
    console.log(`   ✓ Project ID: ${projectRes.data.id}\n`);

    // 6. Get Projects
    console.log('6. GET /api/projects');
    const projectsRes = await client.get('/api/projects');
    console.log(`   ✓ Found ${projectsRes.data.length} projects\n`);

    // 7. Frontend
    console.log('7. GET http://localhost:3000');
    const frontendRes = await axios.get('http://localhost:3000');
    console.log(`   ✓ Frontend accessible (${frontendRes.status})\n`);

    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED!\n');
    console.log('Application URLs:');
    console.log('  - Frontend:  http://localhost:3000');
    console.log('  - API:       http://localhost:5000');
    console.log('  - API Docs:  http://localhost:5000/api/docs');
    console.log('  - Guidelines: http://localhost:3000/guidelines');
    console.log('  - Admin:     http://localhost:3000/admin (regulator only)');
    console.log('\nAuth routes available at: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n✗ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

test();
