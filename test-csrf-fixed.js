// CSRF Protection Test (Fixed with Cookie Handling)
const axios = require('axios');

// Create axios instance with cookie jar support
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

// Simple cookie storage for testing
let cookies = {};

// Intercept responses to capture cookies
api.interceptors.response.use(
  (response) => {
    // Extract cookies from Set-Cookie header
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      setCookieHeader.forEach(cookie => {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        cookies[name] = value;
      });
    }
    return response;
  },
  (error) => error
);

// Intercept requests to add cookies
api.interceptors.request.use(
  (config) => {
    // Add cookies to request
    const cookieString = Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
    
    if (cookieString) {
      config.headers.Cookie = cookieString;
    }
    
    return config;
  },
  (error) => error
);

async function testCSRFFixed() {
  console.log('🛡️  TESTING CSRF PROTECTION (Fixed)\n');

  try {
    // Test 1: Get CSRF token and cookie
    console.log('1. Getting CSRF token...');
    const csrfResponse = await api.get('/v1/csrf');
    const csrfToken = csrfResponse.data.csrfToken;
    
    console.log('✅ CSRF Token received:', csrfToken.substring(0, 16) + '...');
    console.log('✅ Cookies captured:', Object.keys(cookies));

    // Test 2: Test with valid token and cookie
    console.log('\n2. Testing registration with CSRF token...');
    try {
      const registerResponse = await api.post('/auth/register', {
        name: 'CSRF Test User',
        email: `csrftest${Date.now()}@test.com`,
        password: 'password123'
      }, {
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });
      
      console.log('✅ Registration successful with CSRF protection');
      console.log('   User role:', registerResponse.data.user.role);
      
      // Test 3: Test project creation
      console.log('\n3. Testing project creation...');
      const projectResponse = await api.post('/projects', {
        title: 'CSRF Protected Project',
        description: 'This project was created with CSRF protection enabled.',
        category: 'Aircraft Tech'
      }, {
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });
      
      console.log('✅ Project creation successful');
      console.log('   Project ID:', projectResponse.data.project.id);
      
      // Test 4: Test without CSRF token (should fail)
      console.log('\n4. Testing without CSRF token (should fail)...');
      try {
        await api.post('/projects', {
          title: 'Unprotected Project',
          description: 'This should fail.',
          category: 'Operations'
        });
        console.log('❌ Request should have failed without CSRF token');
      } catch (error) {
        if (error.response?.data?.error?.code === 'CSRF_TOKEN_MISSING') {
          console.log('✅ Correctly blocked request without CSRF token');
        } else {
          console.log('⚠️  Unexpected error:', error.response?.data?.error?.code);
        }
      }
      
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.error?.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCSRFFixed().catch(console.error);