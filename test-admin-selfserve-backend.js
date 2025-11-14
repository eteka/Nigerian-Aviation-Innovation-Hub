// Test admin self-serve backend implementation
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

async function testBackend() {
  console.log('🧪 Testing Admin Self-Serve Backend Implementation\n');

  try {
    // Test 1: Check has-admin endpoint
    console.log('1. Testing GET /api/auth/has-admin...');
    const hasAdminResponse = await api.get('/auth/has-admin');
    console.log('✅ Response:', hasAdminResponse.data);

    // Test 2: Test admin registration (should fail without key since admin exists)
    console.log('\n2. Testing admin registration without key...');
    try {
      await api.post('/auth/register', {
        name: 'Test Admin User',
        email: 'testadmin2@test.com',
        password: 'password123',
        adminRequested: true
      });
      console.log('❌ Should have failed without admin key');
    } catch (error) {
      if (error.response?.data?.error?.code === 'ADMIN_KEY_INVALID') {
        console.log('✅ Correctly rejected without admin key');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 3: Test admin registration with correct key
    console.log('\n3. Testing admin registration with correct key...');
    try {
      const adminRegResponse = await api.post('/auth/register', {
        name: 'Test Admin User',
        email: 'testadmin3@test.com',
        password: 'password123',
        adminRequested: true,
        adminKey: 'secret123'
      });
      console.log('✅ Admin registration successful:', adminRegResponse.data.user.role);
      
      // Logout after test
      await api.post('/auth/logout');
    } catch (error) {
      console.log('❌ Admin registration failed:', error.response?.data);
    }

    // Test 4: Login as regular user and test request-admin
    console.log('\n4. Testing admin request flow...');
    try {
      // Login as regular user
      await api.post('/auth/login', {
        email: 'etekaikpe@gmail.com',
        password: 'password123'
      });
      
      const requestResponse = await api.post('/auth/request-admin', {
        reason: 'I need admin access to manage aviation projects'
      });
      console.log('✅ Admin request submitted:', requestResponse.data);
      
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ User already has pending request (expected)');
      } else {
        console.log('❌ Request admin failed:', error.response?.data);
      }
    }

    // Test 5: Login as regulator and test admin endpoints
    console.log('\n5. Testing admin request management...');
    try {
      // Login as regulator
      await api.post('/auth/login', {
        email: 'ieteka@yahoo.com',
        password: 'password123'
      });
      
      const requestsResponse = await api.get('/admin/requests');
      console.log('✅ Admin requests retrieved:', requestsResponse.data.length, 'requests');
      
      if (requestsResponse.data.length > 0) {
        const firstRequest = requestsResponse.data[0];
        console.log('   First request:', firstRequest.user.email, '-', firstRequest.status);
      }
      
    } catch (error) {
      console.log('❌ Admin requests failed:', error.response?.data);
    }

    console.log('\n✅ Backend testing complete!');
    console.log('\n📝 You can now test the frontend:');
    console.log('   - Visit http://localhost:3000/signup (try admin signup)');
    console.log('   - Visit http://localhost:3000/login (try admin login)');
    console.log('   - Visit http://localhost:3000/request-admin (as regular user)');
    console.log('   - Visit http://localhost:3000/admin (as regulator, check Requests tab)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBackend();