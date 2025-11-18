# Docker Architecture Overview

## Development Environment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Development Environment                │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Adminer    │  │     Web      │  │     API      │          │
│  │  (DB UI)     │  │   (Vite)     │  │  (Express)   │          │
│  │              │  │              │  │              │          │
│  │  Port: 8080  │  │  Port: 3000  │  │  Port: 5000  │          │
│  │              │  │              │  │              │          │
│  │  Hot Reload  │  │  Hot Reload  │  │  Hot Reload  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           │                                     │
│                  ┌────────▼────────┐                            │
│                  │   PostgreSQL    │                            │
│                  │   Database      │                            │
│                  │                 │                            │
│                  │  Port: 5432     │                            │
│                  │  Volume: pgdata │                            │
│                  └─────────────────┘                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Access URLs:
- Frontend:  http://localhost:3000
- API:       http://localhost:5000
- API Docs:  http://localhost:5000/api/docs
- Adminer:   http://localhost:8080
```

## Production Environment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Docker Production Environment                  │
│                                                                   │
│  ┌──────────────────────┐       ┌──────────────────────┐        │
│  │        Web           │       │         API          │        │
│  │   (Nginx + React)    │       │   (Node/Express)     │        │
│  │                      │       │                      │        │
│  │  - Optimized Build   │       │  - Production Build  │        │
│  │  - Gzip Compression  │       │  - Non-root User     │        │
│  │  - Security Headers  │       │  - Health Checks     │        │
│  │  - Static Assets     │       │  - Auto Migrations   │        │
│  │                      │       │  - Auto Seeding      │        │
│  │  Port: 80            │       │  Port: 5000          │        │
│  │  Health: /health     │       │  Health: /health     │        │
│  └──────────┬───────────┘       └──────────┬───────────┘        │
│             │                              │                    │
│             │                              │                    │
│             └──────────────┬───────────────┘                    │
│                            │                                    │
│                   ┌────────▼────────┐                           │
│                   │   PostgreSQL    │                           │
│                   │   Database      │                           │
│                   │                 │                           │
│                   │  Internal Only  │                           │
│                   │  Health Checks  │                           │
│                   │  Volume: pgdata │                           │
│                   └─────────────────┘                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Access URLs:
- Frontend:  http://localhost (port 80)
- API:       http://localhost:5000
- API Docs:  http://localhost:5000/api/docs
```

## Service Dependencies

### Development
```
db (PostgreSQL)
  ↓
api (Express) ← depends on db
  ↓
web (Vite) ← depends on api
  ↓
adminer ← depends on db
```

### Production
```
db (PostgreSQL)
  ↓ (health check)
api (Express) ← waits for db healthy
  ↓ (health check)
web (Nginx) ← waits for api healthy
```

## Volume Persistence

### Development
- `pgdata_dev` → PostgreSQL data
- Source code mounted as volumes (hot reload)

### Production
- `pgdata_prod` → PostgreSQL data
- No source mounts (built into images)

## Network Configuration

### Development Network
```
aviation-network-dev (bridge)
├── db (aviation-hub-db-dev)
├── api (aviation-hub-api-dev)
├── web (aviation-hub-web-dev)
└── adminer (aviation-hub-adminer)
```

### Production Network
```
aviation-network-prod (bridge)
├── db (aviation-hub-db-prod)
├── api (aviation-hub-api-prod)
└── web (aviation-hub-web-prod)
```

## Health Checks

### Database (PostgreSQL)
- Command: `pg_isready -U aviation_user`
- Interval: 10s
- Timeout: 5s
- Retries: 5

### API (Node.js)
- Endpoint: `http://localhost:5000/health`
- Interval: 30s
- Timeout: 10s
- Retries: 3
- Start Period: 40s

### Web (Nginx)
- Endpoint: `http://localhost/health`
- Interval: 30s
- Timeout: 10s
- Retries: 3
- Start Period: 10s

## Build Process

### Development
```
1. Pull base images (node:18-alpine, postgres:16-alpine)
2. Install dependencies in containers
3. Mount source code as volumes
4. Start services with hot reload
```

### Production
```
API Build:
1. Base: node:18-alpine
2. Copy package files
3. Install production dependencies only
4. Copy server code
5. Create non-root user
6. Set health check
7. Start production server

Web Build:
1. Builder Stage:
   - Base: node:18-alpine
   - Copy client code
   - Install dependencies
   - Build production bundle
2. Production Stage:
   - Base: nginx:alpine
   - Copy built assets from builder
   - Copy nginx config
   - Set health check
   - Start nginx
```

## Startup Sequence

### Development
```
1. Start PostgreSQL
2. Wait for database health check
3. Start API (runs migrations automatically)
4. Start Web (connects to API)
5. Start Adminer
6. Display access URLs
```

### Production
```
1. Start PostgreSQL
2. Wait for database health check (10s intervals)
3. Start API
4. API runs initialization script:
   - Wait for database connection
   - Run migrations
   - Check for existing admin
   - Seed admin if needed
5. Wait for API health check (30s intervals)
6. Start Web
7. Display access URLs and credentials
```

## Security Features

### Development
- Isolated Docker network
- Database not exposed externally (only via Adminer)
- CORS configured for localhost

### Production
- Non-root user for API container
- Read-only filesystem where possible
- Security headers in Nginx
- Database not exposed externally
- Health checks for reliability
- Secure environment variable handling
- HTTPS-ready (add reverse proxy)

## Resource Usage

### Development (Typical)
- PostgreSQL: ~50MB RAM
- API: ~100MB RAM
- Web: ~50MB RAM
- Adminer: ~20MB RAM
- Total: ~220MB RAM

### Production (Typical)
- PostgreSQL: ~100MB RAM
- API: ~150MB RAM
- Web: ~20MB RAM
- Total: ~270MB RAM

## Scaling Considerations

### Horizontal Scaling
```
Load Balancer
    ↓
┌───┴───┬───────┬───────┐
│ Web 1 │ Web 2 │ Web 3 │
└───┬───┴───┬───┴───┬───┘
    │       │       │
┌───┴───┬───┴───┬───┴───┐
│ API 1 │ API 2 │ API 3 │
└───┬───┴───┬───┴───┬───┘
    │       │       │
    └───────┴───────┘
            ↓
      PostgreSQL
     (with pooling)
```

### Vertical Scaling
- Increase container resource limits
- Adjust PostgreSQL connection pool
- Add Redis for session management
- Use CDN for static assets

## Backup Strategy

### Development
```bash
# Backup database
docker-compose -f docker-compose.dev.yml exec db \
  pg_dump -U aviation_user aviation_hub_dev > backup.sql

# Backup volume
docker run --rm -v aviation-hub-pgdata-dev:/data \
  -v $(pwd):/backup alpine tar czf /backup/pgdata.tar.gz /data
```

### Production
```bash
# Automated daily backup
0 2 * * * docker-compose -f docker-compose.prod.yml exec db \
  pg_dump -U aviation_user aviation_hub > /backups/$(date +\%Y\%m\%d).sql

# Backup to cloud storage
aws s3 cp backup.sql s3://bucket/backups/
```

## Monitoring

### Container Health
```bash
# Check all containers
docker ps

# Check specific service health
docker inspect aviation-hub-api-prod | grep Health

# View health check logs
docker inspect aviation-hub-api-prod | jq '.[0].State.Health'
```

### Application Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f api

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 api
```

### Resource Usage
```bash
# Real-time stats
docker stats

# Specific container
docker stats aviation-hub-api-prod
```

## Troubleshooting Flow

```
Issue Detected
    ↓
Check Container Status
    ↓
docker ps -a
    ↓
Container Running? ──No──→ Check Logs → docker logs <container>
    ↓ Yes                        ↓
Check Health                 Fix Issue
    ↓                            ↓
docker inspect <container>   Restart Container
    ↓                            ↓
Healthy? ──No──→ Check Health Endpoint
    ↓ Yes              ↓
Check Application   curl http://localhost:5000/health
    ↓                  ↓
Test Endpoints     Fix Configuration
    ↓                  ↓
Check Database     Rebuild Image
    ↓                  ↓
Verify Data        Redeploy
```

## Quick Commands Reference

```bash
# Development
npm run docker:dev:up      # Start all services
npm run docker:dev:down    # Stop all services
npm run docker:dev:logs    # View logs

# Production
npm run docker:prod:build  # Build images
npm run docker:prod:up     # Start all services
npm run docker:prod:down   # Stop all services
npm run docker:prod:logs   # View logs

# Maintenance
docker system prune -a     # Clean up unused resources
docker volume prune        # Remove unused volumes
docker network prune       # Remove unused networks
```
