// Seed sample projects into the database
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'server', 'aviation-hub.db'));

console.log('Seeding sample projects...\n');

try {
  // Get the first user (should be test@example.com)
  const user = db.prepare('SELECT id FROM users LIMIT 1').get();
  
  if (!user) {
    console.log('❌ No users found. Please register a user first.');
    process.exit(1);
  }

  const projects = [
    {
      title: 'Autonomous Drone Delivery System',
      description: 'Developing an AI-powered autonomous drone system for last-mile delivery in urban areas. The system uses electric propulsion and advanced collision avoidance algorithms to ensure safe operations in congested airspace. Our goal is to reduce delivery times by 60% while maintaining zero accidents.',
      category: 'Aircraft Tech'
    },
    {
      title: 'Sustainable Aviation Fuel from Algae',
      description: 'Research and development of sustainable aviation fuel derived from algae cultivation. This project aims to reduce carbon emissions by 80% compared to traditional jet fuel while maintaining performance standards. We are partnering with local universities to scale production.',
      category: 'Sustainable Fuel'
    },
    {
      title: 'AI-Powered Air Traffic Management',
      description: 'Implementing machine learning algorithms to optimize air traffic flow and reduce delays. The system predicts congestion patterns and suggests optimal routing to improve efficiency by 35%. Currently in testing phase at regional airports.',
      category: 'Operations'
    },
    {
      title: 'Carbon Offset Program for Regional Flights',
      description: 'Establishing a comprehensive carbon offset program specifically designed for regional aviation. We partner with verified reforestation projects across Nigeria to offset 100% of emissions from participating airlines.',
      category: 'Offsets'
    },
    {
      title: 'Electric Vertical Takeoff Aircraft',
      description: 'Designing and prototyping an electric VTOL aircraft for urban air mobility. The aircraft features a hybrid-electric propulsion system with a range of 150km and capacity for 4 passengers. Target launch date is 2026.',
      category: 'Aircraft Tech'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO projects (title, description, category, owner_user_id)
    VALUES (?, ?, ?, ?)
  `);

  projects.forEach((project, index) => {
    stmt.run(project.title, project.description, project.category, user.id);
    console.log(`✓ Created: ${project.title}`);
  });

  console.log(`\n✅ Successfully seeded ${projects.length} projects!`);
  console.log('\n📝 Visit http://localhost:3000/projects to see them');

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
