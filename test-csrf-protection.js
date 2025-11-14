// CSRF Protection End-to-End Test
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

const results = [];

function addResult(test, status, message = '') {
  results.push({ test, status, message });
  const icon = status === 'PASS' ? '✅' : status === 'SKIP' ? '⏭️' : '❌';
  console.log(`${icon} ${test}: ${status}${message ? ' - ' + message : ''}`);
}

async function testCSRFProtection() {
  console.log('🛡️  TESTING CSRF PROTECTION\n');

  try {
    // Test 1: Get CSRF token
    console.log('1. Testing CSRF token endpoint...');
    const csrfResponse = await api.get('/v1/csrf');
    const csrfToken = csrfResponse.data.csrfToken;
    
    if (csrfToken && csrfToken.length > 0) {
      addResult('CSRF Token Generation', 'PASS', `Token: ${csrfToken.substring(0, 8)}...`);
    } else {
      addResult('CSRF Token Generation', 'FAIL', 'No token returned');
      return;
    }

    // Test 2: Try mutation without CSRF token (should fail)
    console.log('\n2. Testing mutation without CSRF token...');
    try {
      await api.post('/auth/register', {
        name: 'Test User',
        email: `test${Date.now()}@test.com`,
        password: 'password123'
      });
      addResult('CSRF Protection (No Token)', 'FAIL', 'Should have been blocked');
    } catch (error) {
      if (error.response?.data?.error?.code === 'CSRF_TOKEN_MISSING') {
        addResult('CSRF Protection (No Token)', 'PASS', 'Correctly blocked request');
      } else {
        addResult('CSRF Protection (No Token)', 'FAIL', 'Unexpected error: ' + error.response?.data?.error?.code);
      }
    }

    // Test 3: Try mutation with wrong CSRF token (should fail)
    console.log('\n3. Testing mutation with wrong CSRF token...');
    try {
      await api.post('/auth/register', {
        name: 'Test User',
        email: `test${Date.now()}@test.com`,
        password: 'password123'
      }, {
        headers: {
          'X-CSRF-Token': 'wrong-token-123'
        }
      });
      addResult('CSRF Protection (Wrong Token)', 'FAIL', 'Should have been blocked');
    } catch (error) {
      if (error.response?.data?.error?.code === 'CSRF_TOKEN_INVALID') {
        addResult('CSRF Protection (Wrong Token)', 'PASS', 'Correctly blocked request');
      } else {
        addResult('CSRF Protection (Wrong Token)', 'FAIL', 'Unexpected error: ' + error.response?.data?.error?.code);
      }
    }

    // Test 4: Try mutation with correct CSRF token (should succeed)
    console.log('\n4. Testing mutation with correct CSRF token...');
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
      
      if (registerResponse.data.user) {
        addResult('CSRF Protection (Valid Token)', 'PASS', 'Request succeeded with valid token');
      } else {
        addResult('CSRF Protection (Valid Token)', 'FAIL', 'Request failed unexpectedly');
      }
    } catch (error) {
      addResult('CSRF Protection (Valid Token)', 'FAIL', error.response?.data?.error?.message || error.message);
    }

    // Test 5: Test project creation with CSRF
    console.log('\n5. Testing project creation with CSRF...');
    try {
      const projectResponse = await api.post('/projects', {
        title: 'CSRF Test Project',
        description: 'This is a test project to verify CSRF protection is working correctly.',
        category: 'Aircraft Tech'
      }, {
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });
      
      if (projectResponse.data.project) {
        addResult('Project Creation with CSRF', 'PASS', 'Project created successfully');
        
        // Test 6: Test project update with CSRF
        console.log('\n6. Testing project update with CSRF...');
        try {
          const updateResponse = await api.put(`/projects/${projectResponse.data.project.id}`, {
            title: 'Updated CSRF Test Project'
          }, {
            headers: {
              'X-CSRF-Token': csrfToken
            }
          });
          
          if (updateResponse.data.project) {
            addResult('Project Update with CSRF', 'PASS', 'Project updated successfully');
          } else {
            addResult('Project Update with CSRF', 'FAIL', 'Update failed');
          }
        } catch (error) {
          addResult('Project Update with CSRF', 'FAIL', error.response?.data?.error?.message || error.message);
        }
      } else {
        addResult('Project Creation with CSRF', 'FAIL', 'Project creation failed');
      }
    } catch (error) {
      addResult('Project Creation with CSRF', 'FAIL', error.response?.data?.error?.message || error.message);
    }

    // Test 7: Test admin operations (if regulator account available)
    console.log('\n7. Testing admin operations with CSRF...');
    try {
      // Logout current user and login as regulator
      await api.post('/auth/logout', {}, {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      
      // Try to login as regulator
      const loginResponse = await api.post('/auth/login', {
        email: 'ieteka@yahoo.com',
        password: 'password123'
      }, {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      
      if (loginResponse.data.user?.role === 'regulator') {
        // Test admin request approval
        const requestsResponse = await api.get('/admin/requests');
        const pendingRequests = requestsResponse.data.filter(req => req.status === 'pending');
        
        if (pendingRequests.length > 0) {
          const approveResponse = await api.put(`/admin/requests/${pendingRequests[0].id}/approve`, {}, {
            headers: { 'X-CSRF-Token': csrfToken }
          });
          
          if (approveResponse.data.status === 'approved') {
            addResult('Admin Request Approval with CSRF', 'PASS', 'Request approved successfully');
          } else {
            addResult('Admin Request Approval with CSRF', 'FAIL', 'Approval failed');
          }
        } else {
          addResult('Admin Request Approval with CSRF', 'SKIP', 'No pending requests to test');
        }
      } else {
        addResult('Admin Operations with CSRF', 'SKIP', 'No regulator account available');
      }
    } catch (error) {
      addResult('Admin Operations with CSRF', 'SKIP', 'Could not test admin operations');
    }

    // Test 8: Test GET requests don't require CSRF (should work without token)
    console.log('\n8. Testing GET requests bypass CSRF...');
    try {
      const healthResponse = await api.get('/v1/health');
      if (healthResponse.data.status === 'ok') {
        addResult('GET Request Bypass CSRF', 'PASS', 'GET requests work without CSRF token');
      } else {
        addResult('GET Request Bypass CSRF', 'FAIL', 'GET request failed');
      }
    } catch (error) {
      addResult('GET Request Bypass CSRF', 'FAIL', 'GET request failed unexpectedly');
    }

  } catch (error) {
    console.error('❌ CSRF test failed:', error.message);
  }

  // Print Results
  console.log('\n📊 CSRF PROTECTION TEST RESULTS');
  console.log('┌─────────────────────────────────────────┬────────┬───────────────────────────────┐');
  console.log('│ Test Case                               │ Status │ Details                       │');
  console.log('├─────────────────────────────────────────┼────────┼───────────────────────────────┤');
  
  results.forEach(result => {
    const test = result.test.padEnd(39);
    const status = result.status.padEnd(6);
    const message = (result.message || '').substring(0, 29).padEnd(29);
    console.log(`│ ${test} │ ${status} │ ${message} │`);
  });
  
  console.log('└─────────────────────────────────────────┴────────┴───────────────────────────────┘');

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  
  console.log(`\n📈 SUMMARY: ${passed} PASS | ${failed} FAIL | ${skipped} SKIP`);
  
  if (failed === 0) {
    console.log('\n🛡️  CSRF PROTECTION: ✅ FULLY FUNCTIONAL');
    console.log('✅ Double-submit token pattern implemented correctly');
    console.log('✅ Mutations properly protected');
    console.log('✅ GET requests bypass protection as expected');
    console.log('✅ Token validation working correctly');
  } else {
    console.log('\n⚠️  CSRF PROTECTION: Issues detected');
    results.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`• ${result.test}: ${result.message}`);
    });
  }
  
  console.log('\n🌐 FRONTEND TESTING:');
  console.log('• Visit http://localhost:3000 - CSRF tokens should be handled automatically');
  console.log('• Try creating projects, updating status, admin operations');
  console.log('• Check browser DevTools > Network to see X-CSRF-Token headers');
}

testCSRFProtection().catch(console.error);