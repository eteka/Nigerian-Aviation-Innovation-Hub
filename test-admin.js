// Test script for admin endpoints
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

async function testAdmin() {
  console.log('Testing Admin Endpoints...\n');

  try {
    // Step 1: Login as regulator
    console.log('1. Logging in as regulator...');
    await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✓ Logged in successfully\n');

    // Step 2: Test admin projects endpoint
    console.log('2. Testing admin projects endpoint...');
    const projectsResponse = await api.get('/admin/projects');
    console.log(`✓ Found ${projectsResponse.data.length} projects`);
    
    if (projectsResponse.data.length > 0) {
      const firstProject = projectsResponse.data[0];
      console.log(`  First project: "${firstProject.title}" - Status: ${firstProject.status}\n`);
      
      // Step 3: Update project status
      console.log('3. Testing project status update...');
      const newStatus = firstProject.status === 'Submitted' ? 'Under Review' : 'Submitted';
      await api.put(`/admin/projects/${firstProject.id}/status`, { status: newStatus });
      console.log(`✓ Updated project status to: ${newStatus}\n`);
    }

    // Step 4: Test admin users endpoint
    console.log('4. Testing admin users endpoint...');
    const usersResponse = await api.get('/admin/users');
    console.log(`✓ Found ${usersResponse.data.length} users`);
    
    if (usersResponse.data.length > 1) {
      const otherUser = usersResponse.data.find(u => u.email !== 'test@example.com');
      if (otherUser) {
        console.log(`  Found other user: ${otherUser.email} - Role: ${otherUser.role}\n`);
      }
    }

    // Step 5: Test audit logs
    console.log('5. Testing audit logs endpoint...');
    const auditResponse = await api.get('/admin/audit-logs');
    console.log(`✓ Found ${auditResponse.data.length} audit log entries`);
    
    if (auditResponse.data.length > 0) {
      const latestLog = auditResponse.data[0];
      console.log(`  Latest: ${latestLog.action} by ${latestLog.actor.email}\n`);
    }

    console.log('✅ All admin tests passed!');
    console.log('\n📝 You can now:');
    console.log('   - Visit http://localhost:3000/admin (as regulator)');
    console.log('   - Manage project statuses');
    console.log('   - Update user roles');
    console.log('   - View audit logs');

  } catch (error) {
    if (error.response?.status === 403) {
      console.log('❌ Access denied - make sure you are a regulator');
      console.log('   Run: node set-regulator.js test@example.com');
    } else {
      console.error('❌ Test failed:', error.response?.data || error.message);
    }
  }
}

testAdmin();