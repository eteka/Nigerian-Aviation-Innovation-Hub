# Database Configuration Guide

The Nigeria Aviation Innovation Hub supports two database systems:
- **SQLite** for development and testing (default)
- **PostgreSQL** for production deployments

## Environment-Based Database Selection

The application automatically selects the appropriate database based on the `NODE_ENV` environment variable:

| Environment | Database | Configuration |
|-------------|----------|---------------|
| `development` | SQLite | Automatic (file: `server/aviation-hub.db`) |
| `test` | SQLite | In-memory database |
| `production` | PostgreSQL | Requires `DATABASE_URL` or connection params |

## Development Setup (SQLite)

SQLite is used by default in development. No additional configuration needed!

```bash
# Copy the development environment file
cp .env.development .env

# Install dependencies
npm install

# Start the server (migrations run automatically)
npm run dev
```

The SQLite database file will be created at `server/aviation-hub.db`.

## Production Setup (PostgreSQL)

### Step 1: Set Up PostgreSQL Database

Create a PostgreSQL database for your application:

```sql
CREATE DATABASE aviation_hub;
CREATE USER aviation_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE aviation_hub TO aviation_user;
```

### Step 2: Configure Environment Variables

Create a `.env` file with production settings:

```bash
# Option 1: Use DATABASE_URL (recommended for cloud platforms)
NODE_ENV=production
DATABASE_URL=postgresql://aviation_user:your_secure_password@localhost:5432/aviation_hub
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
INITIAL_ADMIN_PASSWORD=SecurePassword123!
```

Or use individual connection parameters:

```bash
# Option 2: Individual connection parameters
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aviation_hub
DB_USER=aviation_user
DB_PASSWORD=your_secure_password
DB_SSL=false
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
INITIAL_ADMIN_PASSWORD=SecurePassword123!
```

### Step 3: Run Migrations

```bash
# Run database migrations
npm run db:migrate
```

### Step 4: Seed Initial Admin User

```bash
# Create the initial regulator admin account
npm run db:seed:prod
```

This creates an admin user with the email specified in `INITIAL_ADMIN_EMAIL`.

### Step 5: Start Production Server

```bash
npm start
```

## Cloud Platform Deployment

### Heroku

```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
heroku config:set INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
heroku config:set INITIAL_ADMIN_PASSWORD=SecurePassword123!

# Deploy
git push heroku main

# Run migrations and seed
heroku run npm run db:migrate
heroku run npm run db:seed:prod
```

### Railway

1. Create a new project and add PostgreSQL database
2. Set environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `JWT_SECRET=<generate-secure-key>`
   - `INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng`
   - `INITIAL_ADMIN_PASSWORD=SecurePassword123!`
3. Railway automatically provides `DATABASE_URL`
4. Deploy your application
5. Run migrations: `railway run npm run db:migrate`
6. Seed admin: `railway run npm run db:seed:prod`

### Render

1. Create a new PostgreSQL database
2. Create a new Web Service
3. Set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=<internal-connection-string>`
   - `JWT_SECRET=<generate-secure-key>`
   - `INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng`
   - `INITIAL_ADMIN_PASSWORD=SecurePassword123!`
4. Add build command: `npm install`
5. Add start command: `npm run db:migrate && npm run db:seed:prod && npm start`

## Database Schema

### Tables

**users**
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Bcrypt hashed password
- `role` - User role (innovator, regulator)
- `created_at` - Timestamp

**sessions**
- `id` - Session ID (primary key)
- `user_id` - Foreign key to users
- `expires_at` - Session expiration timestamp

**projects**
- `id` - Primary key
- `title` - Project title
- `description` - Project description
- `category` - Project category (Aircraft Tech, Operations, Sustainable Fuel, Offsets)
- `owner_user_id` - Foreign key to users
- `status` - Project status (Submitted, Under Review, Approved, Rejected)
- `created_at` - Timestamp
- `updated_at` - Timestamp

**audit_logs**
- `id` - Primary key
- `actorUserId` - User who performed the action
- `action` - Action type
- `targetType` - Type of entity affected
- `targetId` - ID of entity affected
- `before` - JSON snapshot before change
- `after` - JSON snapshot after change
- `ip` - IP address
- `userAgent` - User agent string
- `createdAt` - Timestamp

**admin_requests**
- `id` - Primary key
- `userId` - User requesting admin access
- `reason` - Reason for request
- `status` - Request status (pending, approved, rejected)
- `createdAt` - Timestamp

## Migration System

Migrations are automatically run when the application starts. You can also run them manually:

```bash
npm run db:migrate
```

Migrations are defined in `server/db/migrations.js` and include:
1. Create users table
2. Create sessions table
3. Create projects table
4. Create audit_logs table
5. Create admin_requests table

## Database Abstraction Layer

The application uses a unified database interface (`server/db/index.js`) that provides consistent methods for both SQLite and PostgreSQL:

- `db.query(sql, params)` - Execute a query
- `db.get(sql, params)` - Get a single row
- `db.run(sql, params)` - Execute a statement
- `db.all(sql, params)` - Get all rows
- `db.exec(sql)` - Execute raw SQL
- `db.transaction(fn)` - Run a transaction

This abstraction automatically handles differences between SQLite and PostgreSQL (e.g., parameter placeholders, data types).

## Troubleshooting

### Connection Issues

**PostgreSQL connection refused:**
```bash
# Check if PostgreSQL is running
pg_isready

# Check connection parameters
psql -h localhost -U aviation_user -d aviation_hub
```

**SQLite database locked:**
- Close any other connections to the database
- Check file permissions on `server/aviation-hub.db`

### Migration Issues

**Tables already exist:**
- Migrations use `CREATE TABLE IF NOT EXISTS`, so they're safe to re-run
- If you need to reset: drop all tables and re-run migrations

**PostgreSQL permission denied:**
```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aviation_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aviation_user;
```

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Use strong JWT secrets** - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
3. **Change default admin password** - Immediately after first login
4. **Enable SSL for PostgreSQL** - Set `DB_SSL=true` in production
5. **Use connection pooling** - Already configured for PostgreSQL
6. **Regular backups** - Set up automated database backups

## Backup and Restore

### SQLite (Development)

```bash
# Backup
cp server/aviation-hub.db server/aviation-hub.db.backup

# Restore
cp server/aviation-hub.db.backup server/aviation-hub.db
```

### PostgreSQL (Production)

```bash
# Backup
pg_dump -h localhost -U aviation_user aviation_hub > backup.sql

# Restore
psql -h localhost -U aviation_user aviation_hub < backup.sql
```

## Performance Optimization

### PostgreSQL Indexes

The application automatically creates indexes on:
- `audit_logs.createdAt` (DESC)
- `audit_logs.action`
- `admin_requests.createdAt` (DESC)
- `admin_requests.status`

### Connection Pooling

PostgreSQL uses connection pooling with:
- Minimum connections: 2
- Maximum connections: 10

Adjust in `server/config/database.js` if needed.
