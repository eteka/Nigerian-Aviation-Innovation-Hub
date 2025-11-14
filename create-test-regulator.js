// Create a test regulator account
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

async function createTestRegulator() {
  try {
    console.log('Creating test regulator account...\n');
    
    // Register new account
    const registerResponse = await api.post('/auth/register', {
      name: 'Test Regulator',
      email: 'regulator@test.com',
      password: 'password123'
    });
    
    console.log('✓ Account created successfully');
    console.log('User:', registerResponse.data.user);
    
    // Check current role (should be innovator by default)
    const meResponse1 = await api.get('/auth/me');
    console.log('\n✓ Initial role check:');
    console.log(JSON.stringify(meResponse1.data, null, 2));
    
    // Logout to promote role
    await api.post('/auth/logout');
    console.log('\n✓ Logged out to update role');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createTestRegulator();