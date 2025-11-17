# Nigeria Aviation Innovation Hub

A web platform connecting aviation innovators in Nigeria with regulators and resources to develop new technologies safely and sustainably.

## Features

- User registration and authentication for innovators
- Project proposal submission with regulatory feedback
- Knowledge base with aviation regulations and compliance guidelines
- Project dashboard with ICAO basket categorization
- Admin panel for hub managers

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Database**: SQLite (development/test) / PostgreSQL (production)
- **Routing**: React Router
- **Security**: JWT, CSRF protection, rate limiting, input validation

## Database Configuration

The application supports **dual database modes**:

- **Development/Test**: SQLite (automatic, no configuration needed)
- **Production**: PostgreSQL (requires configuration)

The database is automatically selected based on `NODE_ENV`:

| Environment | Database | Auto-configured |
|-------------|----------|-----------------|
| `development` | SQLite | ✅ Yes |
| `test` | SQLite (in-memory) | ✅ Yes |
| `production` | PostgreSQL | ⚙️ Requires setup |

### Quick Start - Development (SQLite)

```bash
# Copy environment file
cp .env.development .env

# Install and run (database auto-created)
npm install
npm run dev
```

### Production Setup (PostgreSQL)

```bash
# 1. Create .env file with PostgreSQL connection
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/aviation_hub
JWT_SECRET=your-secure-secret-key
INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
INITIAL_ADMIN_PASSWORD=SecurePassword123!

# 2. Run migrations
npm run db:migrate

# 3. Create initial admin user
npm run db:seed:prod

# 4. Start production server
npm start
```

📖 **Full database documentation**: See [DATABASE.md](./DATABASE.md) for detailed setup instructions, cloud deployment guides, and troubleshooting.

## Project Structure

```
nigeria-aviation-innovation-hub/
├── server/              # Express backend
│   └── index.js        # Main server file
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── App.jsx     # Main app component
│   │   └── main.jsx    # Entry point
│   └── vite.config.js  # Vite configuration
└── package.json        # Root package file
```

## API Documentation

📚 **Interactive API Documentation**: http://localhost:5000/api/docs

The API documentation is available via Swagger UI when the server is running. It includes:
- Complete endpoint documentation with examples
- Request/response schemas
- Authentication requirements
- CSRF protection details
- Rate limiting information

## Getting Started

### Option 1: Docker (Recommended)

🐳 **Easiest way to run the application with all dependencies**

```bash
# Development environment (with hot reload)
npm run docker:dev:up

# Access:
# - Frontend: http://localhost:3000
# - API: http://localhost:5000
# - Adminer: http://localhost:8080

# Stop services
npm run docker:dev:down
```

📖 **Full Docker guide**: See [DOCKER.md](./DOCKER.md) for production deployment, troubleshooting, and advanced usage.

### Option 2: Local Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
cd ..
```

3. Configure environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# For development, you can use .env.development as a reference
```

### Database Configuration

The application supports two database modes:

#### Development Mode (SQLite)
- **Default for**: `NODE_ENV=development` or `NODE_ENV=test`
- **Database file**: `server/aviation-hub.db`
- **No additional configuration needed**
- Tables are created automatically on first run

**Environment variables (.env.development)**:
```env
NODE_ENV=development
JWT_SECRET=dev-secret-key-not-for-production
PORT=3000
```

#### Production Mode (PostgreSQL)
- **Required for**: `NODE_ENV=production`
- **Database**: PostgreSQL 12+
- **Configuration required**: Set DATABASE_URL or individual DB parameters

**Environment variables (.env.production)**:
```env
NODE_ENV=production

# Option 1: Use DATABASE_URL (recommended for cloud platforms)
DATABASE_URL=postgresql://username:password@hostname:5432/aviation_hub

# Option 2: Use individual parameters
DB_HOST=your-postgres-host.com
DB_PORT=5432
DB_NAME=aviation_hub
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_SSL=true

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Initial admin setup
INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
INITIAL_ADMIN_PASSWORD=SecurePassword123!
INITIAL_ADMIN_NAME=System Administrator

PORT=3000
CORS_ORIGIN=https://yourdomain.com
```

### Database Setup

#### Development (SQLite)
No setup needed - database is created automatically when you start the server.

#### Production (PostgreSQL)

1. **Create PostgreSQL database**:
```bash
# Using psql
createdb aviation_hub

# Or via SQL
psql -U postgres -c "CREATE DATABASE aviation_hub;"
```

2. **Run migrations**:
```bash
NODE_ENV=production npm run db:migrate
```

3. **Seed initial admin user**:
```bash
NODE_ENV=production npm run db:seed:prod
```

This creates an initial regulator admin using the credentials from your `.env` file.

### Running the Application

#### Development Mode (SQLite)

**Option 1: Run both servers concurrently**
```bash
npm run dev
```

**Option 2: Run servers separately**

Terminal 1 - Backend (port 5000):
```bash
npm run server
# or
npm run start:dev
```

Terminal 2 - Frontend (port 5173):
```bash
npm run client
```

#### Production Mode (PostgreSQL)

```bash
# Ensure environment is configured
export NODE_ENV=production

# Run migrations (first time only)
npm run db:migrate

# Seed initial admin (first time only)
npm run db:seed:prod

# Start the server
npm start
```

### Access the Application

- **Frontend**: http://localhost:5173 (dev) or http://localhost:3000 (prod)
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api/docs

## Development Roadmap

### Milestone 1: Project Setup & Homepage ✅
- [x] Project structure
- [x] Express server setup
- [x] React frontend with Vite
- [x] Homepage with navigation
- [x] Basic routing

### Milestone 2: User Authentication ✅
- [x] User registration with email/password
- [x] Login/logout functionality
- [x] Session management with httpOnly cookies
- [x] Password hashing with bcrypt
- [x] Role-based access control (innovator/regulator)
- [x] Protected routes on frontend
- [x] Dynamic navbar showing auth state
- [x] SQLite database integration

### Milestone 3: Project Submission & Listing ✅
- [x] Projects database table with ICAO categories
- [x] Project submission form with validation
- [x] Project listing with category filters
- [x] Project detail pages
- [x] Edit functionality for owners/regulators
- [x] Public viewing, protected creation
- [x] RESTful API endpoints

### Milestone 4: Knowledge Base ✅
- [x] Guidelines index page with 4 ICAO topics
- [x] Individual guideline detail pages
- [x] Aircraft Technology Improvements content
- [x] Operational Improvements content
- [x] Sustainable Aviation Fuels (SAF) content
- [x] Market-Based Measures (CORSIA) content
- [x] Consistent styling and navigation

### Milestone 5: Admin Dashboard ✅
- [x] Regulator-only admin panel
- [x] Project management with status updates
- [x] User management with role changes
- [x] Audit logging system
- [x] Real-time status updates
- [x] Search and filtering
- [x] Toast notifications

## Contributing

This project is in active development. Contributions and suggestions are welcome!

## License

MIT
