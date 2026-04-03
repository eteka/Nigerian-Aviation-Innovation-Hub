const axios = require('axios');

// Configuration - can be overridden with environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:5000';

const results = [];
let cookies = [];

function extractCookies(response) {
  const setCookie = response.headers['set-cookie'];
  if (setCookie) {
    setCookie.forEach(cookie => {
      const cookieName = cookie.split('=')[0];
      cookies = cookies.filter(c => !c.startsWith(cookieName + '='));
      cookies.push(cookie.split(';')[0]);
    });
  }
}

function getCookieHeader() {
  return cookies.join('; ');
}

function addResult(test, status, details = '', url = '') {
  results.push({ test, status, details, url });
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '○';
  console.log(`      ${icon} ${status} - ${details}`);
}

async function getCSRFToken() {
  const csrf = await axios.get(`${API_URL}/api/v1/csrf`, {
    headers: cookies.length > 0 ? { 'Cookie': getCookieHeader() } : {}
  });
  extractCookies(csrf);
  return csrf.data.csrfToken;
}

async function smokeTest() {
  console.log('🔥 PRODUCTION SMOKE TEST');
  console.log('='.repeat(80));
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`API:      ${API_URL}`);
  console.log('='.repeat(80));
  console.log('');

  try {
    // ============================================================================
    // PHASE 1: SEED INITIAL ADMIN
    // ============================================================================
    console.log('📦 PHASE 1: Database Seeding\n');

    console.log('[1.1] Checking if admin exists...');
    const hasAdminRes = await axios.get(`${API_URL}/api/auth/has-admin`);
    const hasAdmin = hasAdminRes.data.hasAdmin;
    
    if (hasAdmin) {
      console.log('      ✓ Admin already exists, skipping seed');
      addResult('Admin Exists', 'PASS', 'Regulator already in database');
    } else {
      console.log('      ○ No admin found, creating first admin...');
      
      // Create first admin using ALLOW_FIRST_ADMIN flow
      const adminEmail = `admin${Date.now()}@aviation.gov.ng`;
      const adminPassword = 'AdminPass123!';
      
      const csrfToken = await getCSRFToken();
      
      const adminRes = await axios.post(`${API_URL}/api/auth/register`, {
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        adminRequested: true
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Cookie': getCookieHeader()
        }
      });
      
      extractCookies(adminRes);
      
      if (adminRes.data.user && adminRes.data.user.role === 'regulator') {
        addResult('Create First Admin', 'PASS', `Admin created: ${adminEmail}`);
        global.adminCredentials = { email: adminEmail, password: adminPassword };
      } else {
        addResult('Create First Admin', 'FAIL', 'Admin not created with regulator role');
      }
    }

    // ============================================================================
    // PHASE 2: ADMIN WORKFLOW
    // ============================================================================
    console.log('\n👤 PHASE 2: Admin Workflow\n');

    console.log('[2.1] Admin Login...');
    cookies = []; // Reset cookies
    
    // If we just created an admin, use those credentials
    // Otherwise, create a new test admin
    let adminEmail, adminPassword;
    
    if (global.adminCredentials) {
      adminEmail = global.adminCredentials.email;
      adminPassword = global.adminCredentials.password;
    } else {
      // Create a test admin for smoke testing
      console.log('      Creating test admin for smoke test...');
      adminEmail = `smoketest${Date.now()}@aviation.gov.ng`;
      adminPassword = 'SmokeTest123!';
      
      try {
        const csrfToken = await getCSRFToken();
        const createAdminRes = await axios.post(`${API_URL}/api/auth/register`, {
          name: 'Smoke Test Admin',
          email: adminEmail,
          password: adminPassword,
          adminRequested: true
        }, {
          headers: {
            'X-CSRF-Token': csrfToken,
            'Cookie': getCookieHeader()
          }
        });
        
        extractCookies(createAdminRes);
        
        if (createAdminRes.data.user && createAdminRes.data.user.role === 'regulator') {
          console.log(`      ✓ Test admin created: ${adminEmail}`);
        }
      } catch (error) {
        console.log(`      ✗ Failed to create test admin: ${error.response?.data?.error || error.message}`);
      }
    }
    
    cookies = []; // Reset cookies for login
    
    try {
      const csrfToken = await getCSRFToken();
      const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
        email: adminEmail,
        password: adminPassword
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Cookie': getCookieHeader()
        }
      });
      
      extractCookies(loginRes);
      
      if (loginRes.data.user && loginRes.data.user.role === 'regulator') {
        addResult('Admin Login', 'PASS', `Logged in as ${loginRes.data.user.email}`, `${FRONTEND_URL}/admin`);
        global.adminSession = { cookies: [...cookies], user: loginRes.data.user };
      } else {
        addResult('Admin Login', 'FAIL', 'Not logged in as regulator');
      }
    } catch (error) {
      addResult('Admin Login', 'FAIL', error.response?.data?.error || error.message);
    }

    // ============================================================================
    // PHASE 3: INNOVATOR WORKFLOW
    // ============================================================================
    console.log('\n💡 PHASE 3: Innovator Workflow\n');

    console.log('[3.1] Innovator Registration...');
    cookies = []; // Reset cookies for new user
    const innovatorEmail = `innovator${Date.now()}@example.com`;
    const innovatorPassword = 'InnovPass123!';
    
    try {
      const csrfToken = await getCSRFToken();
      const regRes = await axios.post(`${API_URL}/api/auth/register`, {
        name: 'Test Innovator',
        email: innovatorEmail,
        password: innovatorPassword
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Cookie': getCookieHeader()
        }
      });
      
      extractCookies(regRes);
      
      if (regRes.data.user && regRes.data.user.role === 'innovator') {
        addResult('Innovator Registration', 'PASS', `User created: ${innovatorEmail}`);
        global.innovatorCredentials = { email: innovatorEmail, password: innovatorPassword };
      } else {
        addResult('Innovator Registration', 'FAIL', 'User not created properly');
      }
    } catch (error) {
      addResult('Innovator Registration', 'FAIL', error.response?.data?.error || error.message);
    }

    console.log('[3.2] Innovator Login...');
    cookies = []; // Reset cookies
    try {
      const csrfToken = await getCSRFToken();
      const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
        email: innovatorEmail,
        password: innovatorPassword
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Cookie': getCookieHeader()
        }
      });
      
      extractCookies(loginRes);
      
      if (loginRes.data.user) {
        addResult('Innovator Login', 'PASS', `Logged in as ${loginRes.data.user.email}`);
        global.innovatorSession = { cookies: [...cookies], user: loginRes.data.user };
      }
    } catch (error) {
      addResult('Innovator Login', 'FAIL', error.response?.data?.error || error.message);
    }

    console.log('[3.3] Create Project...');
    try {
      const csrfToken = await getCSRFToken();
      const projectRes = await axios.post(`${API_URL}/api/projects`, {
        title: 'Advanced Drone Navigation System',
        description: 'AI-powered navigation system for autonomous drones in Nigerian airspace',
        category: 'Aircraft Tech'
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Cookie': getCookieHeader()
        }
      });
      
      if (projectRes.data.id) {
        addResult('Create Project', 'PASS', `Project created: ${projectRes.data.title}`, `${FRONTEND_URL}/projects/${projectRes.data.id}`);
        global.testProjectId = projectRes.data.id;
      } else {
        addResult('Create Project', 'FAIL', 'No project ID returned');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.response?.data?.error || error.message;
      addResult('Create Project', 'FAIL', errorMsg);
    }

    console.log('[3.4] View Project Detail...');
    if (global.testProjectId) {
      try {
        const projectRes = await axios.get(`${API_URL}/api/projects/${global.testProjectId}`, {
          headers: { 'Cookie': getCookieHeader() }
        });
        
        if (projectRes.data.id === global.testProjectId) {
          addResult('View Project Detail', 'PASS', `Loaded project: ${projectRes.data.title}`);
        }
      } catch (error) {
        addResult('View Project Detail', 'FAIL', error.response?.data?.error || error.message);
      }
    } else {
      addResult('View Project Detail', 'SKIP', 'No project created');
    }

    console.log('[3.5] Request Admin Access...');
    try {
      const csrfToken = await getCSRFToken();
      const requestRes = await axios.post(`${API_URL}/api/auth/request-admin`, {
        reason: 'I need admin access to manage aviation projects'
      }, {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Cookie': getCookieHeader()
        }
      });
      
      if (requestRes.data.message) {
        addResult('Request Admin Access', 'PASS', 'Admin request submitted');
        global.adminRequestId = requestRes.data.requestId;
      }
    } catch (error) {
      addResult('Request Admin Access', 'FAIL', error.response?.data?.error || error.message);
    }

    // ============================================================================
    // PHASE 4: ADMIN MANAGEMENT
    // ============================================================================
    console.log('\n⚙️  PHASE 4: Admin Management\n');

    // Switch back to admin session
    if (global.adminSession) {
      cookies = [...global.adminSession.cookies];
    }

    console.log('[4.1] Update Project Status...');
    if (global.testProjectId) {
      try {
        const csrfToken = await getCSRFToken();
        const updateRes = await axios.put(`${API_URL}/api/admin/projects/${global.testProjectId}`, {
          status: 'Under Review'
        }, {
          headers: {
            'X-CSRF-Token': csrfToken,
            'Cookie': getCookieHeader()
          }
        });
        
        if (updateRes.data.status === 'Under Review') {
          addResult('Update Project Status', 'PASS', 'Status changed to "Under Review"');
        }
      } catch (error) {
        addResult('Update Project Status', 'FAIL', error.response?.data?.error || error.message);
      }
    } else {
      addResult('Update Project Status', 'SKIP', 'No project to update');
    }

    console.log('[4.2] View Admin Requests...');
    try {
      const requestsRes = await axios.get(`${API_URL}/api/admin/requests`, {
        headers: { 'Cookie': getCookieHeader() }
      });
      
      if (Array.isArray(requestsRes.data)) {
        addResult('View Admin Requests', 'PASS', `Found ${requestsRes.data.length} admin requests`);
        
        // Find the pending request we just created
        const pendingRequest = requestsRes.data.find(r => r.status === 'pending');
        if (pendingRequest) {
          global.pendingRequestId = pendingRequest.id;
        }
      }
    } catch (error) {
      addResult('View Admin Requests', 'FAIL', error.response?.data?.error || error.message);
    }

    console.log('[4.3] Approve Admin Request...');
    if (global.pendingRequestId) {
      try {
        const csrfToken = await getCSRFToken();
        const approveRes = await axios.put(`${API_URL}/api/admin/requests/${global.pendingRequestId}`, {
          status: 'approved'
        }, {
          headers: {
            'X-CSRF-Token': csrfToken,
            'Cookie': getCookieHeader()
          }
        });
        
        if (approveRes.data.status === 'approved') {
          addResult('Approve Admin Request', 'PASS', 'Admin request approved');
        }
      } catch (error) {
        addResult('Approve Admin Request', 'FAIL', error.response?.data?.error || error.message);
      }
    } else {
      addResult('Approve Admin Request', 'SKIP', 'No pending request found');
    }

    // ============================================================================
    // PHASE 5: INFRASTRUCTURE
    // ============================================================================
    console.log('\n🏗️  PHASE 5: Infrastructure\n');

    console.log('[5.1] Frontend Accessibility...');
    try {
      const frontendRes = await axios.get(FRONTEND_URL);
      if (frontendRes.status === 200) {
        addResult('Frontend Loads', 'PASS', 'Frontend accessible', FRONTEND_URL);
      }
    } catch (error) {
      addResult('Frontend Loads', 'FAIL', error.message);
    }

    console.log('[5.2] API Health Check...');
    try {
      const healthRes = await axios.get(`${API_URL}/api/v1/health`);
      if (healthRes.data.status === 'ok') {
        addResult('API Health', 'PASS', 'API is healthy', `${API_URL}/api/v1/health`);
      }
    } catch (error) {
      addResult('API Health', 'FAIL', error.message);
    }

    console.log('[5.3] API Documentation...');
    try {
      const docsRes = await axios.get(`${API_URL}/api/docs/`);
      if (docsRes.status === 200) {
        addResult('API Documentation', 'PASS', 'Swagger UI accessible', `${API_URL}/api/docs`);
      }
    } catch (error) {
      addResult('API Documentation', 'FAIL', error.message);
    }

    console.log('[5.4] Guidelines Page...');
    try {
      const guidelinesRes = await axios.get(`${FRONTEND_URL}/guidelines`);
      if (guidelinesRes.status === 200) {
        addResult('Guidelines Page', 'PASS', 'Guidelines accessible', `${FRONTEND_URL}/guidelines`);
      }
    } catch (error) {
      addResult('Guidelines Page', 'FAIL', error.message);
    }

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
  }

  // ============================================================================
  // RESULTS SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(80));
  console.log('SMOKE TEST RESULTS');
  console.log('='.repeat(80));
  console.log('');
  
  console.log('Test'.padEnd(35) + 'Status'.padEnd(10) + 'Details');
  console.log('-'.repeat(80));
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✓' : result.status === 'FAIL' ? '✗' : '○';
    console.log(
      `${icon} ${result.test}`.padEnd(35) +
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

  // ============================================================================
  // DEPLOYMENT URLS
  // ============================================================================
  console.log('\n📍 DEPLOYMENT URLS');
  console.log('='.repeat(80));
  console.log(`Frontend:       ${FRONTEND_URL}`);
  console.log(`API:            ${API_URL}`);
  console.log(`API Docs:       ${API_URL}/api/docs`);
  console.log(`Guidelines:     ${FRONTEND_URL}/guidelines`);
  console.log(`Admin Panel:    ${FRONTEND_URL}/admin`);
  console.log('='.repeat(80));

  if (failed === 0 && passed > 0) {
    console.log('\n✅ ALL SMOKE TESTS PASSED!');
    console.log('\n🎉 Production deployment is fully functional and ready for use!');
  } else if (failed > 0) {
    console.log('\n⚠️  SOME TESTS FAILED - Review the results above');
  }

  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

smokeTest();
