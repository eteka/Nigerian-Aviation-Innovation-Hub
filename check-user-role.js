// Check user role via API
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

async function checkUserRole() {
  try {
    console.log('Testing login and role check for ieteka@yahoo.com...\n');
    
    // Login
    console.log('1. Logging in...');
    const loginResponse = await api.post('/auth/login', {
      email: 'ieteka@yahoo.com',
      password: 'password123'  // You'll need to use your actual password
    });
    console.log('✓ Login successful');
    console.log('Login response:', loginResponse.data);
    
    // Check current user
    console.log('\n2. Checking /api/auth/me...');
    const meResponse = await api.get('/auth/me');
    console.log('✓ /api/auth/me response:');
    console.log(JSON.stringify(meResponse.data, null, 2));
    
    if (meResponse.data.role === 'regulator') {
      console.log('\n✅ SUCCESS: Your account is now a regulator!');
      console.log('You can now access:');
      console.log('- http://localhost:3000/admin');
      console.log('- All /api/admin/* endpoints');
    } else {
      console.log('\n❌ Role is not regulator:', meResponse.data.role);
    }
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Login failed - please check your password');
      console.log('If you need to reset, you can create a new account or update the password in the database');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

checkUserRole();