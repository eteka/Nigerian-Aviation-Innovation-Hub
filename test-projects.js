// Test script for project endpoints
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

async function testProjects() {
  console.log('Testing Project Endpoints...\n');

  try {
    // Step 1: Login first
    console.log('1. Logging in...');
    await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✓ Logged in successfully\n');

    // Step 2: Create a project
    console.log('2. Creating a project...');
    const createResponse = await api.post('/projects', {
      title: 'Autonomous Drone Delivery System',
      description: 'Developing an AI-powered autonomous drone system for last-mile delivery in urban areas. The system uses electric propulsion and advanced collision avoidance to ensure safe operations in congested airspace.',
      category: 'Aircraft Tech'
    });
    console.log('✓ Project created:', createResponse.data.project.title);
    const projectId = createResponse.data.project.id;
    console.log('  Project ID:', projectId, '\n');

    // Step 3: Create another project
    console.log('3. Creating another project...');
    await api.post('/projects', {
      title: 'Sustainable Aviation Fuel from Algae',
      description: 'Research and development of sustainable aviation fuel derived from algae cultivation. This project aims to reduce carbon emissions by 80% compared to traditional jet fuel.',
      category: 'Sustainable Fuel'
    });
    console.log('✓ Second project created\n');

    // Step 4: Get all projects
    console.log('4. Fetching all projects...');
    const allProjects = await api.get('/projects');
    console.log(`✓ Found ${allProjects.data.length} projects\n`);

    // Step 5: Filter by category
    console.log('5. Filtering by category (Aircraft Tech)...');
    const filtered = await api.get('/projects?category=Aircraft Tech');
    console.log(`✓ Found ${filtered.data.length} Aircraft Tech projects\n`);

    // Step 6: Get single project
    console.log('6. Fetching single project...');
    const singleProject = await api.get(`/projects/${projectId}`);
    console.log('✓ Project details:', singleProject.data.title);
    console.log('  Category:', singleProject.data.category);
    console.log('  Status:', singleProject.data.status);
    console.log('  Owner:', singleProject.data.owner_name, '\n');

    // Step 7: Update project
    console.log('7. Updating project...');
    await api.put(`/projects/${projectId}`, {
      title: 'Advanced Autonomous Drone Delivery System',
      description: 'Updated: Developing an AI-powered autonomous drone system with enhanced safety features.'
    });
    console.log('✓ Project updated successfully\n');

    console.log('✅ All project tests passed!');
    console.log('\n📝 You can now:');
    console.log('   - Visit http://localhost:3000/projects to see all projects');
    console.log('   - Click on a project to view details');
    console.log('   - Use category filters to filter projects');
    console.log('   - Login and create new projects at /projects/new');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testProjects();
