# Docker Quick Start Guide

## Development Environment

### Start Development Environment
```bash
npm run docker:dev:up
```

### Access Services
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs
- **Adminer** (DB UI): http://localhost:8080

### Adminer Database Connection
- System: `PostgreSQL`
- Server: `db`
- Username: `aviation_user`
- Password: `dev_password_123`
- Database: `aviation_hub_dev`

### View Logs
```bash
npm run docker:dev:logs
```

### Stop Services
```bash
npm run docker:dev:down
```

### Reset Everything (Fresh Start)
```bash
docker-compose -f docker-compose.dev.yml down -v
npm run docker:dev:up
```

---

## Production Environment

### 1. Create Environment File
```bash
cp .env.docker.prod.example .env
```

### 2. Edit .env File
Set these required values:
- `DB_PASSWORD` - Secure database password
- `JWT_SECRET` - 64-character random string
- `INITIAL_ADMIN_EMAIL` - Admin email
- `INITIAL_ADMIN_PASSWORD` - Secure admin password

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Build Production Images
```bash
npm run docker:prod:build
```

### 4. Start Production Services
```bash
npm run docker:prod:up
```

### 5. Access Application
- **Frontend**: http://localhost
- **API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs

### View Logs
```bash
npm run docker:prod:logs
```

### Stop Services
```bash
npm run docker:prod:down
```

---

## Common Commands

### View Running Containers
```bash
docker ps
```

### View All Containers (including stopped)
```bash
docker ps -a
```

### View Logs for Specific Service
```bash
# Development
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f web
docker-compose -f docker-compose.dev.yml logs -f db

# Production
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f db
```

### Restart Services
```bash
# Development
docker-compose -f docker-compose.dev.yml restart

# Production
docker-compose -f docker-compose.prod.yml restart
```

### Execute Commands in Container
```bash
# Development
docker-compose -f docker-compose.dev.yml exec api npm run db:migrate
docker-compose -f docker-compose.dev.yml exec db psql -U aviation_user aviation_hub_dev

# Production
docker-compose -f docker-compose.prod.yml exec api npm run db:migrate
docker-compose -f docker-compose.prod.yml exec db psql -U aviation_user aviation_hub
```

### Database Backup
```bash
# Development
docker-compose -f docker-compose.dev.yml exec db pg_dump -U aviation_user aviation_hub_dev > backup.sql

# Production
docker-compose -f docker-compose.prod.yml exec db pg_dump -U aviation_user aviation_hub > backup.sql
```

### Database Restore
```bash
# Development
cat backup.sql | docker-compose -f docker-compose.dev.yml exec -T db psql -U aviation_user aviation_hub_dev

# Production
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U aviation_user aviation_hub
```

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :8080

# Stop the process or change port in docker-compose file
```

### Services Won't Start
```bash
# Check Docker daemon
docker info

# View detailed logs
docker-compose -f docker-compose.dev.yml logs

# Remove all containers and start fresh
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Database Connection Failed
```bash
# Check database health
docker-compose -f docker-compose.dev.yml exec db pg_isready -U aviation_user

# Check database logs
docker-compose -f docker-compose.dev.yml logs db

# Restart database
docker-compose -f docker-compose.dev.yml restart db
```

### API Not Responding
```bash
# Check API health
curl http://localhost:5000/health

# Check API logs
docker-compose -f docker-compose.dev.yml logs api

# Restart API
docker-compose -f docker-compose.dev.yml restart api
```

---

## Windows Users

### Using Batch Scripts

**Development:**
```cmd
docker-dev-start.bat
```

**Production:**
```cmd
docker-prod-start.bat
```

### PowerShell Execution Policy
If scripts don't run, enable execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Full Documentation

- **Complete Docker Guide**: [DOCKER.md](./DOCKER.md)
- **Database Setup**: [DATABASE.md](./DATABASE.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Main README**: [README.md](./README.md)
