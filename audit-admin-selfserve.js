// Audit admin self-serve implementation
const axios = require('axios');
const fs = require('fs');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

async function auditAdminSelfServe() {
  console.log('🔍 AUDITING ADMIN SELF-SERVE IMPLEMENTATION\n');
  
  const results = {};
  
  // 1. Check GET /api/auth/has-admin
  console.log('1. Testing GET /api/auth/has-admin...');
  try {
    const response = await api.get('/auth/has-admin');
    results.hasAdminEndpoint = 'YES';
    console.log('   ✅ YES - Endpoint exists');
  } catch (error) {
    results.hasAdminEndpoint = 'NO';
    console.log('   ❌ NO - Endpoint missing');
  }
  
  // 2. Check POST /api/auth/register supports adminRequested, adminKey
  console.log('\n2. Testing POST /api/auth/register with admin fields...');
  try {
    const response = await api.post('/auth/register', {
      name: 'Test Admin User',
      email: 'testadmin@test.com',
      password: 'password123',
      adminRequested: true,
      adminKey: 'test-key'
    });
    results.registerAdminFields = 'YES';
    console.log('   ✅ YES - Register supports admin fields');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('admin')) {
      results.registerAdminFields = 'PARTIAL';
      console.log('   ⚠️  PARTIAL - Admin fields recognized but validation failed');
    } else {
      results.registerAdminFields = 'NO';
      console.log('   ❌ NO - Admin fields not supported');
    }
  }
  
  // 3. Check environment flags
  console.log('\n3. Checking environment flags...');
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const hasAllowFirstAdmin = envContent.includes('ALLOW_FIRST_ADMIN');
    const hasAdminSecret = envContent.includes('ADMIN_SIGNUP_SECRET');
    
    results.envFlags = hasAllowFirstAdmin && hasAdminSecret ? 'YES' : 'NO';
    console.log(`   ${results.envFlags === 'YES' ? '✅' : '❌'} ${results.envFlags} - Environment flags`);
  } catch (error) {
    results.envFlags = 'NO';
    console.log('   ❌ NO - .env file not readable or missing flags');
  }
  
  // 4. Check POST /api/auth/request-admin
  console.log('\n4. Testing POST /api/auth/request-admin...');
  try {
    const response = await api.post('/auth/request-admin', {
      reason: 'Test admin request'
    });
    results.requestAdminEndpoint = 'YES';
    console.log('   ✅ YES - Request admin endpoint exists');
  } catch (error) {
    results.requestAdminEndpoint = 'NO';
    console.log('   ❌ NO - Request admin endpoint missing');
  }
  
  // 5. Check GET /api/admin/requests
  console.log('\n5. Testing GET /api/admin/requests...');
  try {
    // First login as regulator
    await api.post('/auth/login', {
      email: 'ieteka@yahoo.com',
      password: 'password123'
    });
    
    const response = await api.get('/admin/requests');
    results.adminRequestsEndpoint = 'YES';
    console.log('   ✅ YES - Admin requests endpoint exists');
  } catch (error) {
    results.adminRequestsEndpoint = 'NO';
    console.log('   ❌ NO - Admin requests endpoint missing');
  }
  
  // 6. Check PUT /api/admin/requests/:id/approve
  console.log('\n6. Testing PUT /api/admin/requests/:id/approve...');
  try {
    const response = await api.put('/admin/requests/1/approve');
    results.approveRequestEndpoint = 'YES';
    console.log('   ✅ YES - Approve request endpoint exists');
  } catch (error) {
    if (error.response?.status === 404) {
      results.approveRequestEndpoint = 'PARTIAL';
      console.log('   ⚠️  PARTIAL - Endpoint exists but no request found');
    } else {
      results.approveRequestEndpoint = 'NO';
      console.log('   ❌ NO - Approve request endpoint missing');
    }
  }
  
  // 7. Check UI: /signup admin option
  console.log('\n7. Checking /signup UI for admin option...');
  try {
    const signupContent = fs.readFileSync('client/src/pages/Signup.jsx', 'utf8');
    const hasAdminOption = signupContent.includes('admin') || signupContent.includes('Admin');
    results.signupAdminUI = hasAdminOption ? 'YES' : 'NO';
    console.log(`   ${hasAdminOption ? '✅' : '❌'} ${results.signupAdminUI} - Signup admin UI`);
  } catch (error) {
    results.signupAdminUI = 'NO';
    console.log('   ❌ NO - Cannot read signup file');
  }
  
  // 8. Check UI: /login admin path
  console.log('\n8. Checking /login UI for admin path...');
  try {
    const loginContent = fs.readFileSync('client/src/pages/Login.jsx', 'utf8');
    const hasAdminPath = loginContent.includes('Request Admin') || loginContent.includes('admin');
    results.loginAdminUI = hasAdminPath ? 'YES' : 'NO';
    console.log(`   ${hasAdminPath ? '✅' : '❌'} ${results.loginAdminUI} - Login admin UI`);
  } catch (error) {
    results.loginAdminUI = 'NO';
    console.log('   ❌ NO - Cannot read login file');
  }
  
  // 9. Check UI: /admin requests tab
  console.log('\n9. Checking /admin UI for requests tab...');
  try {
    const adminContent = fs.readFileSync('client/src/pages/Admin.jsx', 'utf8');
    const hasRequestsTab = adminContent.includes('requests') || adminContent.includes('Requests');
    results.adminRequestsUI = hasRequestsTab ? 'YES' : 'NO';
    console.log(`   ${hasRequestsTab ? '✅' : '❌'} ${results.adminRequestsUI} - Admin requests UI`);
  } catch (error) {
    results.adminRequestsUI = 'NO';
    console.log('   ❌ NO - Cannot read admin file');
  }
  
  // Print summary table
  console.log('\n📊 AUDIT RESULTS SUMMARY:');
  console.log('┌─────────────────────────────────────────────┬─────────┐');
  console.log('│ Component                                   │ Status  │');
  console.log('├─────────────────────────────────────────────┼─────────┤');
  console.log(`│ GET /api/auth/has-admin                     │   ${results.hasAdminEndpoint.padEnd(5)} │`);
  console.log(`│ POST /api/auth/register (admin fields)     │   ${results.registerAdminFields.padEnd(5)} │`);
  console.log(`│ Environment flags (ALLOW_FIRST_ADMIN, etc)  │   ${results.envFlags.padEnd(5)} │`);
  console.log(`│ POST /api/auth/request-admin                │   ${results.requestAdminEndpoint.padEnd(5)} │`);
  console.log(`│ GET /api/admin/requests                     │   ${results.adminRequestsEndpoint.padEnd(5)} │`);
  console.log(`│ PUT /api/admin/requests/:id/approve         │   ${results.approveRequestEndpoint.padEnd(5)} │`);
  console.log(`│ UI: /signup admin option                    │   ${results.signupAdminUI.padEnd(5)} │`);
  console.log(`│ UI: /login admin path                       │   ${results.loginAdminUI.padEnd(5)} │`);
  console.log(`│ UI: /admin requests tab                     │   ${results.adminRequestsUI.padEnd(5)} │`);
  console.log('└─────────────────────────────────────────────┴─────────┘');
  
  // Print fixes for NO items
  console.log('\n🔧 FIXES NEEDED FOR "NO" ITEMS:');
  
  if (results.hasAdminEndpoint === 'NO') {
    console.log('• GET /api/auth/has-admin: Add endpoint to check if any admin exists');
  }
  
  if (results.registerAdminFields === 'NO') {
    console.log('• POST /api/auth/register: Add adminRequested, adminKey field support');
  }
  
  if (results.envFlags === 'NO') {
    console.log('• Environment flags: Add ALLOW_FIRST_ADMIN, ADMIN_SIGNUP_SECRET to .env');
  }
  
  if (results.requestAdminEndpoint === 'NO') {
    console.log('• POST /api/auth/request-admin: Add endpoint to create admin requests');
  }
  
  if (results.adminRequestsEndpoint === 'NO') {
    console.log('• GET /api/admin/requests: Add endpoint to list pending admin requests');
  }
  
  if (results.approveRequestEndpoint === 'NO') {
    console.log('• PUT /api/admin/requests/:id/approve: Add endpoint to approve/reject requests');
  }
  
  if (results.signupAdminUI === 'NO') {
    console.log('• UI /signup: Add "Sign up as Admin" checkbox with admin key field');
  }
  
  if (results.loginAdminUI === 'NO') {
    console.log('• UI /login: Add "Request Admin Access" link for non-admins');
  }
  
  if (results.adminRequestsUI === 'NO') {
    console.log('• UI /admin: Add "Requests" tab with approve/reject functionality');
  }
}

auditAdminSelfServe().catch(console.error);