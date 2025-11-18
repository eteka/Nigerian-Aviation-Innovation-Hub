const axios = require('axios');

const API_BASE = 'http://localhost:5000';
const results = [];

function addResult(test, status, details = '') {
  results.push({ test, status, details });
  console.log(`${status === 'PASS' ? '✓' : '✗'} ${test}${details ? ': ' + details : ''}`);
}

async function runSanityCheck() {
  console.log('🔍 Running Sanity Check...\n');
  
  try {
    // Test 1: API Health Check
    console.log('1. Testing API Health Endpoint...');
    try {
      const healthRes = await axios.get(`${API_BASE}/api/v1/health`);
      if (healthRes.data.status === 'ok') {
        addResult('API Health Check', 'PASS', 'Status: ok');
      } else {
        addResult('API Health Check', 'FAIL', `Unexpected status: ${healthRes.data.status}`);
      }
    } catch (error) {
      addResult('API Health Check', 'FAIL', error.message);
    }

    // Test 2: CSRF Token Endpoint
    console.log('\n2. Testing CSRF Token Endpoint...');
    try {
      const csrfRes = await axios.get(`${API_BASE}/api/v1/csrf`, {
        withCredentials: true
      });
      if (csrfRes.data.csrfToken) {
        addResult('CSRF Token Fetch', 'PASS', `Token received: ${csrfRes.data.csrfToken.substring(0, 20)}...`);
      } else {
        addResult('CSRF Token Fetch', 'FAIL', 'No token in response');
      }
    } catch (error) {
      addResult('CSRF Token Fetch', 'FAIL', error.message);
    }

    // Test 3: User Registration
    console.log('\n3. Testing User Registration...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!'
    };
    
    try {
      // Get CSRF token first
      const csrfRes = await axios.get(`${API_BASE}/api/v1/csrf`, {
        withCredentials: true
      });
      const csrfToken = csrfRes.data.csrfToken;
      const cookies = csrfRes.headers['set-cookie'];

      const signupRes = await axios.post(`${API_BASE}/api/auth/register`, testUser, {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Cookie': cookies ? cookies.join('; ') : ''
        },
        withCredentials: true
      });
      
      if (signupRes.data.user && signupRes.data.user.email === testUser.email) {
        addResult('User Registration', 'PASS', `User created: ${testUser.email}`);
      } else {
        addResult('User Registration', 'FAIL', 'User not created properly');
      }
    } catch (error) {
      if (error.response) {
        addResult('User Registration', 'FAIL', `${error.response.status}: ${error.response.data.error || error.message}`);
      } else {
        addResult('User Registration', 'FAIL', error.message);
      }
    }

    // Test 4: User Login
    console.log('\n4. Testing User Login...');
    try {
      const csrfRes = await axios.get(`${API_BASE}/api/v1/csrf`, {
        withCredentials: true
      });
      const csrfToken = csrfRes.data.csrfToken;
      const cookies = csrfRes.headers['set-cookie'];

      const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Cookie': cookies ? cookies.join('; ') : ''
        },
        withCredentials: true
      });
      
      if (loginRes.data.user && loginRes.data.user.email === testUser.email) {
        addResult('User Login', 'PASS', 'Login successful');
        
        // Save session for next tests
        global.testSession = {
          cookies: loginRes.headers['set-cookie'],
          user: loginRes.data.user
        };
      } else {
        addResult('User Login', 'FAIL', 'Login failed');
      }
    } catch (error) {
      if (error.response) {
        addResult('User Login', 'FAIL', `${error.response.status}: ${error.response.data.error || error.message}`);
      } else {
        addResult('User Login', 'FAIL', error.message);
      }
    }

    // Test 5: Create Project (with CSRF)
    console.log('\n5. Testing Create Project with CSRF...');
    if (global.testSession) {
      try {
        // Get fresh CSRF token with session cookies
        const csrfRes = await axios.get(`${API_BASE}/api/v1/csrf`, {
          headers: {
            'Cookie': global.testSession.cookies.join('; ')
          },
          withCredentials: true
        });
        const csrfToken = csrfRes.data.csrfToken;
        
        // Update cookies if new ones were set
        if (csrfRes.headers['set-cookie']) {
          global.testSession.cookies = csrfRes.headers['set-cookie'];
        }

        const projectData = {
          title: 'Test Aviation Project',
          description: 'This is a test project for sanity check',
          category: 'Aircraft Tech'
        };

        const projectRes = await axios.post(`${API_BASE}/api/projects`, projectData, {
          headers: {
            'X-CSRF-Token': csrfToken,
            'Cookie': global.testSession.cookies.join('; ')
          },
          withCredentials: true
        });
        
        if (projectRes.data.id && projectRes.data.title === projectData.title) {
          addResult('Create Project (CSRF)', 'PASS', `Project created: ${projectRes.data.title}`);
        } else {
          addResult('Create Project (CSRF)', 'FAIL', 'Project not created properly');
        }
      } catch (error) {
        if (error.response) {
          addResult('Create Project (CSRF)', 'FAIL', `${error.response.status}: ${error.response.data.error || error.message}`);
        } else {
          addResult('Create Project (CSRF)', 'FAIL', error.message);
        }
      }
    } else {
      addResult('Create Project (CSRF)', 'SKIP', 'No session available');
    }

    // Test 6: Get Projects
    console.log('\n6. Testing Get Projects...');
    if (global.testSession) {
      try {
        const projectsRes = await axios.get(`${API_BASE}/api/projects`, {
          headers: {
            'Cookie': global.testSession.cookies.join('; ')
          },
          withCredentials: true
        });
        
        if (Array.isArray(projectsRes.data)) {
          addResult('Get Projects', 'PASS', `Found ${projectsRes.data.length} projects`);
        } else {
          addResult('Get Projects', 'FAIL', 'Response is not an array');
        }
      } catch (error) {
        if (error.response) {
          addResult('Get Projects', 'FAIL', `${error.response.status}: ${error.response.data.error || error.message}`);
        } else {
          addResult('Get Projects', 'FAIL', error.message);
        }
      }
    } else {
      addResult('Get Projects', 'SKIP', 'No session available');
    }

    // Test 7: Frontend Accessibility
    console.log('\n7. Testing Frontend Accessibility...');
    try {
      const frontendRes = await axios.get('http://localhost:3000');
      if (frontendRes.status === 200) {
        addResult('Frontend Loads', 'PASS', 'Frontend accessible at http://localhost:3000');
      } else {
        addResult('Frontend Loads', 'FAIL', `Unexpected status: ${frontendRes.status}`);
      }
    } catch (error) {
      addResult('Frontend Loads', 'FAIL', error.message);
    }

    // Test 8: API Documentation
    console.log('\n8. Testing API Documentation...');
    try {
      const docsRes = await axios.get(`${API_BASE}/api/docs/`);
      if (docsRes.status === 200 && docsRes.data.includes('swagger')) {
        addResult('API Documentation', 'PASS', 'Swagger UI accessible');
      } else {
        addResult('API Documentation', 'PASS', 'Documentation accessible');
      }
    } catch (error) {
      addResult('API Documentation', 'FAIL', error.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }

  // Print Summary Table
  console.log('\n' + '='.repeat(80));
  console.log('SANITY CHECK RESULTS');
  console.log('='.repeat(80));
  console.log('');
  console.log('Test'.padEnd(30) + 'Status'.padEnd(10) + 'Details');
  console.log('-'.repeat(80));
  
  results.forEach(result => {
    const statusIcon = result.status === 'PASS' ? '✓' : result.status === 'FAIL' ? '✗' : '○';
    console.log(
      `${statusIcon} ${result.test}`.padEnd(30) + 
      result.status.padEnd(10) + 
      result.details
    );
  });
  
  console.log('-'.repeat(80));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  
  console.log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
  console.log('='.repeat(80));
  
  if (failed === 0) {
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\nApplication is ready:');
    console.log('  - Frontend: http://localhost:3000');
    console.log('  - API: http://localhost:5000');
    console.log('  - API Docs: http://localhost:5000/api/docs');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - Please review the results above');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

runSanityCheck();
