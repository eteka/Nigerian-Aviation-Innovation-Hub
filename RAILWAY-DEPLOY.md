# Railway Deployment Guide (One-Click Deploy)

This guide walks you through deploying the Nigeria Aviation Innovation Hub to Railway (backend) and Vercel (frontend).

## Prerequisites

- GitHub account with this repository
- Railway account (free tier available)
- Vercel account (free tier available)

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to [Railway](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose `Nigerian-Aviation-Innovation-Hub` repository
5. Railway will detect it as a Node.js project

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway automatically creates `DATABASE_URL` environment variable

### Step 3: Configure Environment Variables

In Railway project settings → Variables, add:

```bash
NODE_ENV=production
DATABASE_URL=${DATABASE_URL}  # Auto-provided by Railway
PORT=5000
CORS_ORIGIN=https://your-app.vercel.app  # Update after Vercel deploy
COOKIE_SECURE=true
JWT_SECRET=<generate-64-char-random-string>
INITIAL_ADMIN_EMAIL=your-email@example.com
INITIAL_ADMIN_PASSWORD=SecurePassword123!
INITIAL_ADMIN_NAME=System Administrator
ALLOW_FIRST_ADMIN=true
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Configure Build & Deploy

Railway should auto-detect settings from `railway.json`, but verify:

- **Build Command**: `npm ci`
- **Start Command**: `npm run db:migrate && npm run db:seed:prod && npm start`
- **Health Check Path**: `/health`

### Step 5: Deploy

1. Click "Deploy" in Railway
2. Wait for build to complete (~2-3 minutes)
3. Railway will provide a URL like: `https://your-app.up.railway.app`

### Step 6: Verify API Deployment

Test the API health endpoint:

```bash
curl https://your-app.up.railway.app/health
# Should return: {"status":"ok","timestamp":"...","environment":"production"}

curl https://your-app.up.railway.app/api/v1/health
# Should return: {"status":"ok","requestId":"..."}
```

**Copy your Railway API URL** - you'll need it for Vercel deployment.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Vercel Deployment

1. Go to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import `Nigerian-Aviation-Innovation-Hub` from GitHub
4. Vercel will detect it as a Vite project

### Step 2: Configure Build Settings

Vercel should auto-detect from `vercel.json`, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm ci && npm run build`
- **Output Directory**: `dist`

### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables:

```bash
VITE_API_BASE=https://your-app.up.railway.app
```

Replace with your actual Railway API URL from Part 1.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~1-2 minutes)
3. Vercel will provide a URL like: `https://your-app.vercel.app`

### Step 5: Update Railway CORS

Go back to Railway and update the `CORS_ORIGIN` variable:

```bash
CORS_ORIGIN=https://your-app.vercel.app
```

Then redeploy the Railway service.

### Step 6: Verify Frontend Deployment

1. Open your Vercel URL: `https://your-app.vercel.app`
2. You should see the homepage
3. Try signing up for an account
4. Try logging in
5. Navigate to `/guidelines`
6. If you're the first user, you can access `/admin`

---

## Verification Checklist

### Backend (Railway)

- [ ] Health endpoint responds: `GET /health`
- [ ] API health responds: `GET /api/v1/health`
- [ ] CSRF token endpoint works: `GET /api/v1/csrf`
- [ ] API docs accessible: `GET /api/docs`
- [ ] Database migrations ran successfully
- [ ] Initial admin user created

### Frontend (Vercel)

- [ ] Homepage loads
- [ ] Can sign up for new account
- [ ] Can log in
- [ ] Can create projects
- [ ] Guidelines page loads
- [ ] Admin page accessible (for regulators)
- [ ] API calls work (check browser console)
- [ ] CSRF tokens sent automatically

### Integration

- [ ] Frontend can call backend API
- [ ] CORS configured correctly
- [ ] Authentication works end-to-end
- [ ] Sessions persist across requests
- [ ] CSRF protection working

---

## Troubleshooting

### Railway Issues

**Build fails:**
- Check build logs in Railway dashboard
- Verify `package.json` has all dependencies
- Ensure Node.js version is compatible (18.x)

**Database connection fails:**
- Verify `DATABASE_URL` is set
- Check PostgreSQL service is running
- Review application logs

**Health check fails:**
- Verify `/health` endpoint returns 200
- Check `healthcheckTimeout` in `railway.json`
- Review startup logs

### Vercel Issues

**Build fails:**
- Check build logs in Vercel dashboard
- Verify `client/package.json` exists
- Ensure all dependencies are listed

**API calls fail (CORS):**
- Verify `VITE_API_BASE` is set correctly
- Check Railway `CORS_ORIGIN` matches Vercel URL
- Look for CORS errors in browser console

**Environment variables not working:**
- Ensure variables start with `VITE_`
- Redeploy after adding variables
- Check browser console for API base URL

### Common Issues

**"CSRF token required" errors:**
- Frontend must call `/api/v1/csrf` first
- Token must be sent in `X-CSRF-Token` header
- Check browser cookies are enabled

**"Authentication required" errors:**
- Ensure cookies are being sent
- Check `COOKIE_SECURE=true` in production
- Verify HTTPS is used (not HTTP)

**Database tables not created:**
- Check Railway logs for migration errors
- Manually run: `railway run npm run db:migrate`
- Verify PostgreSQL connection

---

## Post-Deployment

### 1. Change Admin Password

After first login, immediately change the admin password:
1. Log in with `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD`
2. Go to profile settings
3. Change password

### 2. Update Environment Variables

Remove or change these after initial setup:
- `INITIAL_ADMIN_PASSWORD` (change to something secure)
- `ALLOW_FIRST_ADMIN` (set to `false` after first admin created)

### 3. Monitor Application

**Railway:**
- Check logs: Railway dashboard → Deployments → Logs
- Monitor metrics: CPU, Memory, Network
- Set up alerts for downtime

**Vercel:**
- Check analytics: Vercel dashboard → Analytics
- Monitor build times
- Review error logs

### 4. Custom Domain (Optional)

**Railway:**
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records

**Vercel:**
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records
4. Update Railway `CORS_ORIGIN` to new domain

---

## Scaling

### Railway

**Vertical Scaling:**
- Upgrade to Pro plan for more resources
- Increase memory/CPU limits

**Database:**
- Upgrade PostgreSQL plan for more storage
- Enable connection pooling
- Add read replicas

### Vercel

**Automatic:**
- Vercel auto-scales based on traffic
- CDN caching for static assets
- Edge network for global distribution

---

## Cost Estimates

### Free Tier Limits

**Railway:**
- $5 free credit per month
- Includes PostgreSQL database
- Suitable for development/testing

**Vercel:**
- 100 GB bandwidth per month
- Unlimited deployments
- Suitable for small to medium traffic

### Paid Plans

**Railway Pro:**
- $20/month
- More resources and priority support

**Vercel Pro:**
- $20/month per user
- Advanced analytics and support

---

## Backup Strategy

### Database Backups (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Backup database
railway run pg_dump $DATABASE_URL > backup.sql

# Restore database
cat backup.sql | railway run psql $DATABASE_URL
```

### Automated Backups

Set up GitHub Actions for automated backups:
1. Create `.github/workflows/backup.yml`
2. Schedule daily backups
3. Store in GitHub or cloud storage

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Project Issues**: https://github.com/eteka/Nigerian-Aviation-Innovation-Hub/issues

---

## Quick Deploy Commands

### Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up

# View logs
railway logs

# Run migrations
railway run npm run db:migrate

# Seed admin
railway run npm run db:seed:prod
```

### Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# View logs
vercel logs

# Set environment variable
vercel env add VITE_API_BASE
```

---

## Success Criteria

✅ Railway API deployed and healthy
✅ PostgreSQL database connected
✅ Database migrations completed
✅ Initial admin user created
✅ Vercel frontend deployed
✅ Frontend can call backend API
✅ CORS configured correctly
✅ Authentication working
✅ CSRF protection active
✅ All features functional

**Your application is now live and ready for users!**
