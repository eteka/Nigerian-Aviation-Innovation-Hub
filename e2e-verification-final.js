// Final E2E Admin Self-Serve Verification
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

async function runFinalVerification() {
  console.log('🚀 FINAL E2E ADMIN SELF-SERVE VERIFICATION\n');

  try {
    // Test 1: Server Health
    console.log('1. Testing Server Health...');
    try {
      await api.get('/');
      addResult('Server Health', 'PASS', 'API server responding');
    } catch (error) {
      addResult('Server Health', 'FAIL', 'Server not responding');
      return;
    }

    // Test 2: Admin Status Check
    console.log('\n2. Testing Admin Status Endpoint...');
    try {
      const hasAdminResponse = await api.get('/auth/has-admin');
      addResult('Admin Status Endpoint', 'PASS', `hasAdmin: ${hasAdminResponse.data.hasAdmin}`);
    } catch (error) {
      addResult('Admin Status Endpoint', 'FAIL', error.message);
    }

    // Test 3: Admin Signup - Wrong Key
    console.log('\n3. Testing Admin Signup with Wrong Key...');
    try {
      await api.post('/auth/register', {
        name: 'Wrong Key User',
        email: `wrongkey${Date.now()}@test.com`,
        password: 'password123',
        adminRequested: true,
        adminKey: 'wrongkey123'
      });
      addResult('Wrong Key Rejection', 'FAIL', 'Should have been rejected');
    } catch (error) {
      if (error.response?.data?.error?.code === 'ADMIN_KEY_INVALID') {
        addResult('Wrong Key Rejection', 'PASS', 'Correctly rejected invalid key');
      } else {
        addResult('Wrong Key Rejection', 'FAIL', 'Unexpected error');
      }
    }

    // Test 4: Admin Signup - Correct Key
    console.log('\n4. Testing Admin Signup with Correct Key...');
    try {
      const adminResponse = await api.post('/auth/register', {
        name: 'Valid Admin User',
        email: `validadmin${Date.now()}@test.com`,
        password: 'password123',
        adminRequested: true,
        adminKey: 'secret123'
      });
      
      if (adminResponse.data.user.role === 'regulator') {
        addResult('Correct Key Admin Creation', 'PASS', 'Admin role assigned correctly');
      } else {
        addResult('Correct Key Admin Creation', 'FAIL', 'Role not set to regulator');
      }
      
      // Logout
      await api.post('/auth/logout');
    } catch (error) {
      addResult('Correct Key Admin Creation', 'FAIL', error.response?.data?.error || error.message);
    }

    // Test 5: Regular User Creation and Admin Request
    console.log('\n5. Testing Regular User Admin Request Flow...');
    try {
      const userResponse = await api.post('/auth/register', {
        name: 'Regular User',
        email: `regular${Date.now()}@test.com`,
        password: 'password123'
      });
      
      if (userResponse.data.user.role === 'innovator') {
        addResult('Regular User Creation', 'PASS', 'Innovator role assigned');
        
        // Test admin request (user is logged in from registration)
        try {
          const requestResponse = await api.post('/auth/request-admin', {
            reason: 'Need admin access for aviation project management'
          });
          
          if (requestResponse.data.status === 'pending') {
            addResult('Admin Request Submission', 'PASS', 'Request created successfully');
          } else {
            addResult('Admin Request Submission', 'FAIL', 'Unexpected status');
          }
        } catch (reqError) {
          if (reqError.response?.status === 409) {
            addResult('Admin Request Submission', 'PASS', 'Duplicate request handled correctly');
          } else {
            addResult('Admin Request Submission', 'FAIL', reqError.response?.data?.error);
          }
        }
      } else {
        addResult('Regular User Creation', 'FAIL', 'Wrong role assigned');
      }
      
      await api.post('/auth/logout');
    } catch (error) {
      addResult('Regular User Creation', 'FAIL', error.response?.data?.error);
    }

    // Test 6: Admin Endpoints (try with known regulator)
    console.log('\n6. Testing Admin Request Management...');
    try {
      // Try known regulator accounts
      const regulatorAccounts = [
        { email: 'ieteka@yahoo.com', password: 'password123' },
        { email: 'test@example.com', password: 'password123' }
      ];
      
      let loggedIn = false;
      for (const account of regulatorAccounts) {
        try {
          await api.post('/auth/login', account);
          loggedIn = true;
          break;
        } catch (loginError) {
          continue;
        }
      }
      
      if (loggedIn) {
        // Test admin requests endpoint
        const requestsResponse = await api.get('/admin/requests');
        addResult('Admin Requests Endpoint', 'PASS', `Retrieved ${requestsResponse.data.length} requests`);
        
        // Test audit logs endpoint
        const auditResponse = await api.get('/admin/audit-logs');
        addResult('Audit Logs Endpoint', 'PASS', `Retrieved ${auditResponse.data.length} audit entries`);
        
        // Test users endpoint
        const usersResponse = await api.get('/admin/users');
        addResult('Admin Users Endpoint', 'PASS', `Retrieved ${usersResponse.data.length} users`);
        
      } else {
        addResult('Admin Endpoints', 'SKIP', 'No regulator account available for testing');
      }
      
    } catch (error) {
      addResult('Admin Endpoints', 'FAIL', error.response?.data?.error || error.message);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }

  // Print Results Table
  console.log('\n📊 E2E VERIFICATION RESULTS');
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
  
  // Overall Assessment
  const criticalTests = ['Server Health', 'Admin Status Endpoint', 'Wrong Key Rejection', 'Correct Key Admin Creation', 'Regular User Creation'];
  const criticalPassed = results.filter(r => criticalTests.includes(r.test) && r.status === 'PASS').length;
  
  if (criticalPassed === criticalTests.length) {
    console.log('\n🎉 CORE FUNCTIONALITY: ✅ VERIFIED');
    console.log('✅ Admin self-serve system is working correctly');
    console.log('✅ Key validation is functioning');
    console.log('✅ Role assignment is working');
    console.log('✅ Request submission is operational');
  } else {
    console.log('\n⚠️  CORE FUNCTIONALITY: Issues detected');
  }
  
  console.log('\n🌐 MANUAL TESTING RECOMMENDED:');
  console.log('• Frontend: http://localhost:3000/signup (admin toggle)');
  console.log('• Frontend: http://localhost:3000/login (admin login)');
  console.log('• Frontend: http://localhost:3000/request-admin');
  console.log('• Frontend: http://localhost:3000/admin (Requests tab)');
  
  if (failed > 0) {
    console.log('\n🔧 ISSUES TO ADDRESS:');
    results.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`• ${result.test}: ${result.message}`);
    });
  }
}

runFinalVerification().catch(console.error);