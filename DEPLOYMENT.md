# Deployment Guide

This guide covers deploying the Nigeria Aviation Innovation Hub to production with PostgreSQL.

## Pre-Deployment Checklist

- [ ] PostgreSQL database created and accessible
- [ ] Environment variables configured
- [ ] JWT secret generated (secure random string)
- [ ] Initial admin email/password decided
- [ ] Frontend built and ready to serve
- [ ] SSL/TLS certificates configured (if self-hosting)

## Environment Variables

Required environment variables for production:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=<64-character-random-string>
INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
INITIAL_ADMIN_PASSWORD=<secure-password>
PORT=3000
CORS_ORIGIN=https://yourdomain.com
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Deployment Options

### Option 1: Heroku

```bash
# 1. Create Heroku app
heroku create nigeria-aviation-hub

# 2. Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# 3. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
heroku config:set INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
heroku config:set INITIAL_ADMIN_PASSWORD=SecurePassword123!
heroku config:set CORS_ORIGIN=https://nigeria-aviation-hub.herokuapp.com

# 4. Deploy
git push heroku main

# 5. Run migrations and seed
heroku run npm run db:migrate
heroku run npm run db:seed:prod

# 6. Open app
heroku open
```

### Option 2: Railway

1. **Create Project**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Add PostgreSQL**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway automatically sets `DATABASE_URL`

3. **Configure Environment Variables**
   - Go to your service → "Variables"
   - Add:
     ```
     NODE_ENV=production
     JWT_SECRET=<generate-secure-key>
     INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
     INITIAL_ADMIN_PASSWORD=SecurePassword123!
     ```

4. **Deploy**
   - Railway auto-deploys on git push
   - Run migrations: `railway run npm run db:migrate`
   - Seed admin: `railway run npm run db:seed:prod`

### Option 3: Render

1. **Create PostgreSQL Database**
   - Go to [Render](https://render.com)
   - New → PostgreSQL
   - Copy the "Internal Database URL"

2. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm install`
     - **Start Command**: `npm run db:migrate && npm run db:seed:prod && npm start`

3. **Environment Variables**
   ```
   NODE_ENV=production
   DATABASE_URL=<internal-database-url>
   JWT_SECRET=<generate-secure-key>
   INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
   INITIAL_ADMIN_PASSWORD=SecurePassword123!
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render auto-deploys on git push

### Option 4: DigitalOcean App Platform

1. **Create App**
   - Go to [DigitalOcean](https://cloud.digitalocean.com/apps)
   - Create → Apps → GitHub repository

2. **Add Database**
   - Add Component → Database → PostgreSQL
   - DigitalOcean provides `${db.DATABASE_URL}`

3. **Configure**
   - Environment Variables:
     ```
     NODE_ENV=production
     DATABASE_URL=${db.DATABASE_URL}
     JWT_SECRET=<generate-secure-key>
     INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
     INITIAL_ADMIN_PASSWORD=SecurePassword123!
     ```
   - Run Command: `npm run db:migrate && npm run db:seed:prod && npm start`

4. **Deploy**
   - Click "Create Resources"

### Option 5: Self-Hosted (VPS)

For Ubuntu/Debian server:

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 3. Create database
sudo -u postgres psql
CREATE DATABASE aviation_hub;
CREATE USER aviation_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE aviation_hub TO aviation_user;
\q

# 4. Clone repository
git clone https://github.com/eteka/Nigerian-Aviation-Innovation-Hub.git
cd Nigerian-Aviation-Innovation-Hub

# 5. Install dependencies
npm install

# 6. Create .env file
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://aviation_user:secure_password@localhost:5432/aviation_hub
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
INITIAL_ADMIN_EMAIL=admin@aviation.gov.ng
INITIAL_ADMIN_PASSWORD=SecurePassword123!
PORT=3000
EOF

# 7. Run migrations and seed
npm run db:migrate
npm run db:seed:prod

# 8. Install PM2 for process management
sudo npm install -g pm2

# 9. Start application
pm2 start npm --name "aviation-hub" -- start
pm2 save
pm2 startup

# 10. Setup Nginx reverse proxy
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/aviation-hub

# Add this configuration:
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/aviation-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 11. Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Post-Deployment Steps

### 1. Verify Database Connection

```bash
# Test database abstraction
npm run db:test
```

### 2. Check Initial Admin User

```bash
# Login with:
# Email: <INITIAL_ADMIN_EMAIL>
# Password: <INITIAL_ADMIN_PASSWORD>
```

### 3. Change Admin Password

1. Login to the application
2. Go to profile settings
3. Change password immediately

### 4. Configure CORS

Update `CORS_ORIGIN` to match your frontend domain:
```bash
CORS_ORIGIN=https://yourdomain.com
```

### 5. Setup Monitoring

Consider adding:
- Application monitoring (e.g., New Relic, Datadog)
- Error tracking (e.g., Sentry)
- Uptime monitoring (e.g., UptimeRobot)
- Database backups (automated)

## Database Backups

### Automated Backups (Heroku)

```bash
# Enable automated backups
heroku pg:backups:schedule DATABASE_URL --at '02:00 America/New_York'

# Manual backup
heroku pg:backups:capture

# Download backup
heroku pg:backups:download
```

### Manual Backups (PostgreSQL)

```bash
# Backup
pg_dump -h hostname -U username -d aviation_hub > backup_$(date +%Y%m%d).sql

# Restore
psql -h hostname -U username -d aviation_hub < backup_20231117.sql
```

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql $DATABASE_URL

# Check environment variables
echo $DATABASE_URL
echo $NODE_ENV
```

### Migration Failures

```bash
# Re-run migrations
npm run db:migrate

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Application Crashes

```bash
# Check logs (PM2)
pm2 logs aviation-hub

# Check logs (Heroku)
heroku logs --tail

# Check logs (Railway)
railway logs
```

## Security Checklist

- [ ] Strong JWT secret (64+ characters)
- [ ] Secure admin password
- [ ] SSL/TLS enabled
- [ ] Database SSL enabled
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Input validation enabled
- [ ] CSRF protection active
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Monitoring and alerts setup

## Scaling Considerations

### Database Connection Pooling

Adjust pool size in `server/config/database.js`:
```javascript
pool: {
  min: 2,
  max: 10  // Increase for high traffic
}
```

### Horizontal Scaling

For multiple instances:
1. Use external session store (Redis)
2. Configure load balancer
3. Ensure database can handle connections
4. Use CDN for static assets

### Performance Optimization

1. Enable database query caching
2. Add Redis for session management
3. Implement API response caching
4. Use CDN for frontend assets
5. Enable gzip compression
6. Optimize database indexes

## Support

For deployment issues:
- Check [DATABASE.md](./DATABASE.md) for database-specific help
- Review application logs
- Verify environment variables
- Test database connection
- Check firewall rules
