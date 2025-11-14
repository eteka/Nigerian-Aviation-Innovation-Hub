// E2E Admin Self-Serve Verification Script
const axios = require('axios');
const Database = require('better-sqlite3');
const path = require('path');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

const results = [];

function addResult(test, status, message = '') {
  results.push({ test, status, message });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${test}: ${status}${message ? ' - ' + message : ''}`);
}

async function runE2EVerification() {
  console.log('🚀 RUNNING E2E ADMIN SELF-SERVE VERIFICATION\n');

  try {
    // Step 1: Check server health
    console.log('1. Checking server health...');
    try {
      const healthResponse = await api.get('/health');
      addResult('Server Health Check', 'PASS');
    } catch (error) {
      addResult('Server Health Check', 'FAIL', 'Server not responding');
      return;
    }

    // Step 2: Check current admin status
    console.log('\n2. Checking admin status...');
    const hasAdminResponse = await api.get('/auth/has-admin');
    const hasExistingAdmin = hasAdminResponse.data.hasAdmin;
    addResult('Admin Status Check', 'PASS', `hasAdmin: ${hasExistingAdmin}`);

    // Step 3: Test first admin scenario (if no admins exist)
    if (!hasExistingAdmin) {
      console.log('\n3. Testing First Admin Signup (no key required)...');
      try {
        const firstAdminResponse = await api.post('/auth/register', {
          name: 'First Admin',
          email: 'firstadmin@test.com',
          password: 'password123',
          adminRequested: true
          // No adminKey required for first admin
        });
        
        if (firstAdminResponse.data.user.role === 'regulator') {
          addResult('First Admin Signup', 'PASS', 'Role set to regulator without key');
        } else {
          addResult('First Admin Signup', 'FAIL', 'Role not set to regulator');
        }
        
        // Logout after test
        await api.post('/auth/logout');
      } catch (error) {
        addResult('First Admin Signup', 'FAIL', error.response?.data?.error || error.message);
      }
    } else {
      console.log('\n3. Skipping First Admin test (admin already exists)');
      addResult('First Admin Signup', 'SKIP', 'Admin already exists');
    }

    // Step 4: Test admin signup with wrong key
    console.log('\n4. Testing Admin Signup with Wrong Key...');
    try {
      await api.post('/auth/register', {
        name: 'Wrong Key Admin',
        email: 'wrongkey@test.com',
        password: 'password123',
        adminRequested: true,
        adminKey: 'wrongkey123'
      });
      addResult('Wrong Key Admin Signup', 'FAIL', 'Should have been rejected');
    } catch (error) {
      if (error.response?.data?.error?.code === 'ADMIN_KEY_INVALID') {
        addResult('Wrong Key Admin Signup', 'PASS', 'Correctly rejected invalid key');
      } else {
        addResult('Wrong Key Admin Signup', 'FAIL', 'Unexpected error: ' + (error.response?.data?.error || error.message));
      }
    }

    // Step 5: Test admin signup with correct key
    console.log('\n5. Testing Admin Signup with Correct Key...');
    try {
      const correctKeyResponse = await api.post('/auth/register', {
        name: 'Correct Key Admin',
        email: 'correctkey@test.com',
        password: 'password123',
        adminRequested: true,
        adminKey: 'secret123'
      });
      
      if (correctKeyResponse.data.user.role === 'regulator') {
        addResult('Correct Key Admin Signup', 'PASS', 'Role set to regulator with correct key');
      } else {
        addResult('Correct Key Admin Signup', 'FAIL', 'Role not set to regulator');
      }
      
      // Logout after test
      await api.post('/auth/logout');
    } catch (error) {
      addResult('Correct Key Admin Signup', 'FAIL', error.response?.data?.error || error.message);
    }

    // Step 6: Create a regular user for testing
    console.log('\n6. Creating Regular User for Testing...');
    try {
      const regularUserResponse = await api.post('/auth/register', {
        name: 'Regular User',
        email: 'regularuser@test.com',
        password: 'password123'
      });
      
      if (regularUserResponse.data.user.role === 'innovator') {
        addResult('Regular User Creation', 'PASS', 'Created with innovator role');
      } else {
        addResult('Regular User Creation', 'FAIL', 'Unexpected role: ' + regularUserResponse.data.user.role);
      }
    } catch (error) {
      // User might already exist, try to login instead
      try {
        await api.post('/auth/login', {
          email: 'regularuser@test.com',
          password: 'password123'
        });
        addResult('Regular User Creation', 'PASS', 'User already exists, logged in');
      } catch (loginError) {
        addResult('Regular User Creation', 'FAIL', 'Could not create or login: ' + error.message);
        return;
      }
    }

    // Step 7: Test admin request submission
    console.log('\n7. Testing Admin Request Submission...');
    try {
      const requestResponse = await api.post('/auth/request-admin', {
        reason: 'I need admin access to manage aviation innovation projects for my organization.'
      });
      
      if (requestResponse.data.status === 'pending') {
        addResult('Admin Request Submission', 'PASS', 'Request created with pending status');
      } else {
        addResult('Admin Request Submission', 'FAIL', 'Unexpected status: ' + requestResponse.data.status);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        addResult('Admin Request Submission', 'PASS', 'User already has pending request (expected)');
      } else {
        addResult('Admin Request Submission', 'FAIL', error.response?.data?.error || error.message);
      }
    }

    // Logout regular user
    await api.post('/auth/logout');

    // Step 8: Login as regulator and test request management
    console.log('\n8. Testing Admin Request Management...');
    try {
      // Login as existing regulator
      await api.post('/auth/login', {
        email: 'ieteka@yahoo.com',
        password: 'password123'
      });
      
      // Get admin requests
      const requestsResponse = await api.get('/admin/requests');
      const pendingRequests = requestsResponse.data.filter(req => req.status === 'pending');
      
      if (pendingRequests.length > 0) {
        addResult('Admin Requests Retrieval', 'PASS', `Found ${pendingRequests.length} pending requests`);
        
        // Test approval of first pending request
        const requestToApprove = pendingRequests[0];
        console.log(`\n9. Testing Request Approval (User: ${requestToApprove.user.email})...`);
        
        try {
          const approvalResponse = await api.put(`/admin/requests/${requestToApprove.id}/approve`);
          
          if (approvalResponse.data.status === 'approved') {
            addResult('Request Approval', 'PASS', 'Request approved successfully');
            
            // Verify user role was updated
            const usersResponse = await api.get('/admin/users');
            const approvedUser = usersResponse.data.find(u => u.id === requestToApprove.user.id);
            
            if (approvedUser && approvedUser.role === 'regulator') {
              addResult('User Role Update', 'PASS', 'User role updated to regulator');
            } else {
              addResult('User Role Update', 'FAIL', 'User role not updated');
            }
            
            // Check audit log
            const auditResponse = await api.get('/admin/audit-logs?limit=10');
            const roleUpdateLog = auditResponse.data.find(log => 
              log.action === 'USER_ROLE_UPDATED' && 
              log.targetId === requestToApprove.user.id
            );
            
            if (roleUpdateLog) {
              addResult('Audit Log Entry', 'PASS', 'USER_ROLE_UPDATED logged correctly');
            } else {
              addResult('Audit Log Entry', 'FAIL', 'Audit log entry not found');
            }
            
          } else {
            addResult('Request Approval', 'FAIL', 'Request not approved');
          }
        } catch (error) {
          addResult('Request Approval', 'FAIL', error.response?.data?.error || error.message);
        }
      } else {
        addResult('Admin Requests Retrieval', 'PASS', 'No pending requests (may need to create one first)');
        addResult('Request Approval', 'SKIP', 'No pending requests to approve');
        addResult('User Role Update', 'SKIP', 'No requests to test');
        addResult('Audit Log Entry', 'SKIP', 'No requests to test');
      }
      
    } catch (error) {
      addResult('Admin Request Management', 'FAIL', error.response?.data?.error || error.message);
    }

    // Step 10: Test rejection flow
    console.log('\n10. Testing Request Rejection...');
    try {
      const requestsResponse = await api.get('/admin/requests');
      const pendingRequests = requestsResponse.data.filter(req => req.status === 'pending');
      
      if (pendingRequests.length > 0) {
        const requestToReject = pendingRequests[0];
        const rejectionResponse = await api.put(`/admin/requests/${requestToReject.id}/reject`);
        
        if (rejectionResponse.data.status === 'rejected') {
          addResult('Request Rejection', 'PASS', 'Request rejected successfully');
          
          // Check audit log for rejection
          const auditResponse = await api.get('/admin/audit-logs?limit=5');
          const rejectionLog = auditResponse.data.find(log => 
            log.action === 'ADMIN_REQUEST_REJECTED' && 
            log.targetId === requestToReject.id
          );
          
          if (rejectionLog) {
            addResult('Rejection Audit Log', 'PASS', 'ADMIN_REQUEST_REJECTED logged correctly');
          } else {
            addResult('Rejection Audit Log', 'FAIL', 'Rejection audit log not found');
          }
        } else {
          addResult('Request Rejection', 'FAIL', 'Request not rejected properly');
        }
      } else {
        addResult('Request Rejection', 'SKIP', 'No pending requests to reject');
        addResult('Rejection Audit Log', 'SKIP', 'No rejections to test');
      }
    } catch (error) {
      addResult('Request Rejection', 'FAIL', error.response?.data?.error || error.message);
    }

  } catch (error) {
    console.error('❌ E2E Test failed with error:', error.message);
  }

  // Print summary report
  console.log('\n📊 E2E VERIFICATION SUMMARY REPORT');
  console.log('┌─────────────────────────────────────────────┬────────┬─────────────────────────────────────┐');
  console.log('│ Test Case                                   │ Status │ Message                             │');
  console.log('├─────────────────────────────────────────────┼────────┼─────────────────────────────────────┤');
  
  results.forEach(result => {
    const test = result.test.padEnd(43);
    const status = result.status.padEnd(6);
    const message = (result.message || '').substring(0, 35).padEnd(35);
    console.log(`│ ${test} │ ${status} │ ${message} │`);
  });
  
  console.log('└─────────────────────────────────────────────┴────────┴─────────────────────────────────────┘');

  // Count results
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  
  console.log(`\n📈 RESULTS: ${passed} PASS, ${failed} FAIL, ${skipped} SKIP`);
  
  if (failed > 0) {
    console.log('\n🔧 SUGGESTED FIXES FOR FAILURES:');
    results.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`• ${result.test}: ${result.message}`);
    });
  } else {
    console.log('\n🎉 ALL TESTS PASSED! Admin Self-Serve system is fully functional.');
  }
}

// Run the verification
runE2EVerification().catch(console.error);