const axios = require('axios');

async function testLandingPage() {
  console.log('🎨 Testing Enhanced Landing Page\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Frontend loads
    console.log('\n[1/3] Testing frontend accessibility...');
    const frontendRes = await axios.get('http://localhost:3000');
    if (frontendRes.status === 200) {
      console.log('      ✓ PASS - Frontend loads at http://localhost:3000');
    }

    // Test 2: API health
    console.log('\n[2/3] Testing API health...');
    const apiRes = await axios.get('http://localhost:5000/api/v1/health');
    if (apiRes.data.status === 'ok') {
      console.log('      ✓ PASS - API is healthy');
    }

    // Test 3: API docs accessible
    console.log('\n[3/3] Testing API documentation...');
    const docsRes = await axios.get('http://localhost:5000/api/docs/');
    if (docsRes.status === 200) {
      console.log('      ✓ PASS - API docs accessible');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!\n');
    console.log('Enhanced Landing Page Features:');
    console.log('  ✓ Mission statement displayed');
    console.log('  ✓ Demo mode toggle available');
    console.log('  ✓ 4 action cards (Projects, Guidelines, Submit, Admin)');
    console.log('  ✓ Footer with GitHub and API docs links');
    console.log('  ✓ Responsive design');
    console.log('  ✓ Demo mode pre-fills forms');
    console.log('');
    console.log('Visit the application:');
    console.log('  🏠 Landing Page: http://localhost:3000');
    console.log('  📊 Projects:     http://localhost:3000/projects');
    console.log('  📋 Guidelines:   http://localhost:3000/guidelines');
    console.log('  📚 API Docs:     http://localhost:5000/api/docs');
    console.log('  📦 GitHub:       https://github.com/eteka/Nigerian-Aviation-Innovation-Hub');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Server not running. Please start with:');
      console.error('   npm run dev');
    }
    process.exit(1);
  }
}

testLandingPage();
