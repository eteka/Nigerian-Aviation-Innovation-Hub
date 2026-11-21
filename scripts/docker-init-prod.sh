#!/bin/sh
set -e

echo "🚀 Initializing production database..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until node -e "const { Client } = require('pg'); const client = new Client(process.env.DATABASE_URL); client.connect().then(() => { console.log('Connected'); client.end(); process.exit(0); }).catch(() => process.exit(1));" 2>/dev/null; do
  echo "   Database not ready, waiting..."
  sleep 2
done

echo "✓ Database connection established"

# Run migrations
echo "📦 Running database migrations..."
npm run db:migrate

# Check if tables are empty and seed if needed
echo "🌱 Checking if initial admin exists..."
node -e "
const db = require('./server/db');
(async () => {
  try {
    const users = await db.all('SELECT * FROM users WHERE role = ?', ['regulator']);
    if (users.length === 0) {
      console.log('No regulator found, running seed script...');
      process.exit(2);
    } else {
      console.log('Regulator already exists, skipping seed');
      process.exit(0);
    }
  } catch (error) {
    console.log('Error checking users, will run seed:', error.message);
    process.exit(2);
  }
})();
" || {
  if [ $? -eq 2 ]; then
    echo "🌱 Seeding initial admin user..."
    npm run db:seed:prod
  fi
}

echo "✅ Production database initialization complete!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:${WEB_PORT:-80}"
echo "   API:      http://localhost:${API_PORT:-5000}"
echo "   API Docs: http://localhost:${API_PORT:-5000}/api/docs"
echo ""
echo "👤 Initial Admin Credentials:"
echo "   Email:    ${INITIAL_ADMIN_EMAIL:-admin@example.com}"
echo "   Password: ${INITIAL_ADMIN_PASSWORD:-ChangeMe123!}"
echo ""
echo "⚠️  Remember to change the admin password after first login!"
