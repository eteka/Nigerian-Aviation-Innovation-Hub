# Docker Deployment Guide

This guide covers running the Nigeria Aviation Innovation Hub using Docker and Docker Compose for both development and production environments.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

## Quick Start

### Development Environment

```bash
# Start all services (PostgreSQL, Adminer, API, Web)
npm run docker:dev:up

# View logs
npm run docker:dev:logs

# Stop all services
npm run docker:dev:down
```

**Access URLs:**
- Frontend: http://localhost:3000
- API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs
- Adminer (DB UI): http://localhost:8080

### Production Environment

```bash
# 1. Create production environment file
cp .env.docker.prod.example .env

# 2. Edit .env and set secure values
# - DB_PASSWORD (required)
# - JWT_SECRET (required)
# - INITIAL_ADMIN_EMAIL
# - INITIAL_ADMIN_PASSWORD

# 3. Build production images
npm run docker:prod:build

# 4. Start production services
npm run docker:prod:up

# 5. View logs
npm run docker:prod:logs

# 6. Stop services
npm run docker:prod:down
```

**Access URLs:**
- Frontend: http://localhost (port 80)
- API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

## Development Environment Details

### Services

**db (PostgreSQL 16)**
- Port: 5432
- Database: aviation_hub_dev
- User: aviation_user
- Password: dev_password_123
- Volume: pgdata_dev (persistent storage)

**adminer (Database UI)**
- Port: 8080
- Access database visually
- No configuration needed

**api (Node.js/Express)**
- Port: 5000
- Hot reload enabled
- Source code mounted as volume
- Auto-runs migrations on startup

**web (Vite/React)**
- Port: 3000
- Hot reload enabled
- Source code mounted as volume
- Proxies API requests to backend

### Features

✅ **Hot Reload**: Edit code and see changes instantly
✅ **Database UI**: Adminer for easy database management
✅ **Auto Migrations**: Database tables created automatically
✅ **Isolated Environment**: No conflicts with local installations
✅ **Easy Reset**: `docker-compose down -v` to start fresh

### Development Workflow

```bash
# Start development environment
npm run docker:dev:up

# Edit files in your IDE
# Changes are reflected immediately (hot reload)

# View logs from all services
npm run docker:dev:logs

# View logs from specific service
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f web

# Access database with Adminer
# Open http://localhost:8080
# System: PostgreSQL
# Server: db
# Username: aviation_user
# Password: dev_password_123
# Database: aviation_hub_dev

# Stop services (keeps data)
npm run docker:dev:down

# Stop services and remove volumes (fresh start)
docker-compose -f docker-compose.dev.yml down -v
```

## Production Environment Details

### Services

**db (PostgreSQL 16)**
- Internal only (not exposed)
- Configured via environment variables
- Persistent volume: pgdata_prod
- Health checks enabled

**api (Node.js/Express)**
- Port: 5000 (configurable via API_PORT)
- Production build
- Runs as non-root user
- Health checks enabled
- Auto-runs migrations and seed on startup

**web (Nginx + React)**
- Port: 80 (configurable via WEB_PORT)
- Optimized production build
- Gzip compression enabled
- Security headers configured
- Health checks enabled

### Environment Variables

Create a `.env` file with these required variables:

```bash
# Database (REQUIRED)
DB_NAME=aviation_hub
DB_USER=aviation_user
DB_PASSWORD=your_secure_password_here

# JWT Secret (REQUIRED)
JWT_SECRET=your-64-character-random-string

# Initial Admin
INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
INITIAL_ADMIN_PASSWORD=SecurePassword123!
INITIAL_ADMIN_NAME=System Administrator

# Ports (optional)
API_PORT=5000
WEB_PORT=80

# CORS (set to your domain)
CORS_ORIGIN=http://localhost
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Production Deployment

#### Step 1: Prepare Environment

```bash
# Clone repository
git clone https://github.com/eteka/Nigerian-Aviation-Innovation-Hub.git
cd Nigerian-Aviation-Innovation-Hub

# Create production environment file
cp .env.docker.prod.example .env

# Edit .env with secure values
nano .env
```

#### Step 2: Build Images

```bash
# Build all production images
npm run docker:prod:build

# Or build individually
docker-compose -f docker-compose.prod.yml build api
docker-compose -f docker-compose.prod.yml build web
```

#### Step 3: Start Services

```bash
# Start all services
npm run docker:prod:up

# This will:
# 1. Start PostgreSQL database
# 2. Wait for database to be healthy
# 3. Start API server
# 4. Run database migrations
# 5. Create initial admin user (if needed)
# 6. Start web server
# 7. Display access URLs and credentials
```

#### Step 4: Verify Deployment

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check health
curl http://localhost:5000/health
curl http://localhost/health

# View logs
npm run docker:prod:logs
```

#### Step 5: Access Application

Open http://localhost in your browser and login with:
- Email: (from INITIAL_ADMIN_EMAIL)
- Password: (from INITIAL_ADMIN_PASSWORD)

**⚠️ Change the admin password immediately after first login!**

### Production Management

```bash
# View logs
npm run docker:prod:logs

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f db

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api

# Stop services (keeps data)
npm run docker:prod:down

# Stop and remove everything (including volumes)
docker-compose -f docker-compose.prod.yml down -v

# Execute commands in containers
docker-compose -f docker-compose.prod.yml exec api npm run db:migrate
docker-compose -f docker-compose.prod.yml exec api npm run db:seed:prod
docker-compose -f docker-compose.prod.yml exec db psql -U aviation_user -d aviation_hub
```

## Database Management

### Backup Database

```bash
# Backup PostgreSQL database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U aviation_user aviation_hub > backup_$(date +%Y%m%d).sql

# Or with docker exec
docker exec aviation-hub-db-prod pg_dump -U aviation_user aviation_hub > backup.sql
```

### Restore Database

```bash
# Restore from backup
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U aviation_user aviation_hub

# Or with docker exec
cat backup.sql | docker exec -i aviation-hub-db-prod psql -U aviation_user aviation_hub
```

### Access Database Shell

```bash
# Development
docker-compose -f docker-compose.dev.yml exec db psql -U aviation_user aviation_hub_dev

# Production
docker-compose -f docker-compose.prod.yml exec db psql -U aviation_user aviation_hub
```

## Troubleshooting

### Services Won't Start

```bash
# Check if ports are already in use
netstat -an | grep -E ':(3000|5000|8080|5432|80)'

# Check Docker status
docker ps -a

# View detailed logs
docker-compose -f docker-compose.dev.yml logs
```

### Database Connection Issues

```bash
# Check database health
docker-compose -f docker-compose.prod.yml exec db pg_isready -U aviation_user

# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec api env | grep DATABASE
```

### API Not Responding

```bash
# Check API health
curl http://localhost:5000/health

# Check API logs
docker-compose -f docker-compose.prod.yml logs api

# Restart API
docker-compose -f docker-compose.prod.yml restart api
```

### Frontend Not Loading

```bash
# Check web server health
curl http://localhost/health

# Check web logs
docker-compose -f docker-compose.prod.yml logs web

# Rebuild web image
docker-compose -f docker-compose.prod.yml build web
docker-compose -f docker-compose.prod.yml up -d web
```

### Reset Everything

```bash
# Development - complete reset
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Production - complete reset (⚠️ DELETES ALL DATA)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

## Performance Optimization

### Resource Limits

Add resource limits to docker-compose.prod.yml:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Database Tuning

```bash
# Access PostgreSQL config
docker-compose -f docker-compose.prod.yml exec db cat /var/lib/postgresql/data/postgresql.conf

# Adjust settings for production
# shared_buffers = 256MB
# effective_cache_size = 1GB
# maintenance_work_mem = 64MB
```

## Security Best Practices

1. **Change Default Credentials**
   - Set strong DB_PASSWORD
   - Set strong JWT_SECRET (64+ characters)
   - Change admin password after first login

2. **Use HTTPS in Production**
   - Add reverse proxy (Nginx/Traefik)
   - Configure SSL certificates
   - Update CORS_ORIGIN to https://

3. **Network Security**
   - Don't expose database port externally
   - Use Docker networks for service communication
   - Configure firewall rules

4. **Regular Updates**
   ```bash
   # Pull latest images
   docker-compose -f docker-compose.prod.yml pull
   
   # Rebuild with latest base images
   docker-compose -f docker-compose.prod.yml build --no-cache
   ```

5. **Monitoring**
   - Set up log aggregation
   - Monitor container health
   - Set up alerts for failures

## Cloud Deployment

### AWS ECS

Use docker-compose.prod.yml as a base for ECS task definitions.

### Google Cloud Run

```bash
# Build and push images
docker build -f Dockerfile.api -t gcr.io/PROJECT_ID/aviation-hub-api .
docker build -f Dockerfile.web -t gcr.io/PROJECT_ID/aviation-hub-web .
docker push gcr.io/PROJECT_ID/aviation-hub-api
docker push gcr.io/PROJECT_ID/aviation-hub-web

# Deploy to Cloud Run
gcloud run deploy aviation-hub-api --image gcr.io/PROJECT_ID/aviation-hub-api
gcloud run deploy aviation-hub-web --image gcr.io/PROJECT_ID/aviation-hub-web
```

### DigitalOcean App Platform

Upload docker-compose.prod.yml and configure environment variables in the dashboard.

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

## Support

For Docker-specific issues:
1. Check logs: `npm run docker:dev:logs` or `npm run docker:prod:logs`
2. Verify environment variables
3. Check Docker daemon status
4. Review [DATABASE.md](./DATABASE.md) for database issues
5. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
