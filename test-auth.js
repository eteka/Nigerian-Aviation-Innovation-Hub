// Quick test script for authentication endpoints
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

async function testAuth() {
  console.log('Testing Authentication Endpoints...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing Registration...');
    const registerResponse = await api.post('/auth/register', {
      name: 'Test Innovator',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✓ Registration successful:', registerResponse.data);
    console.log('  User role:', registerResponse.data.user.role);

    // Test 2: Logout
    console.log('\n2. Testing Logout...');
    await api.post('/auth/logout');
    console.log('✓ Logout successful');

    // Test 3: Login
    console.log('\n3. Testing Login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✓ Login successful:', loginResponse.data);

    // Test 4: Get current user
    console.log('\n4. Testing /auth/me endpoint...');
    const meResponse = await api.get('/auth/me');
    console.log('✓ Current user:', meResponse.data);

    console.log('\n✅ All authentication tests passed!');
    console.log('\n📝 Note: To test regulator access, manually update the user role in the database:');
    console.log('   UPDATE users SET role = "regulator" WHERE email = "test@example.com";');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();
