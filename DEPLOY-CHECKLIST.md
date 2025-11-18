# Deployment Checklist

Use this checklist to ensure a successful deployment to Railway and Vercel.

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Railway account created
- [ ] Vercel account created

## Railway Backend Deployment

### Setup
- [ ] Create new Railway project
- [ ] Connect GitHub repository
- [ ] Add PostgreSQL database
- [ ] Database URL automatically configured

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` (auto-configured)
- [ ] `PORT=5000`
- [ ] `JWT_SECRET` (64-char random string)
- [ ] `INITIAL_ADMIN_EMAIL` (your email)
- [ ] `INITIAL_ADMIN_PASSWORD` (secure password)
- [ ] `INITIAL_ADMIN_NAME` (admin name)
- [ ] `ALLOW_FIRST_ADMIN=true`
- [ ] `COOKIE_SECURE=true`
- [ ] `CORS_ORIGIN` (will update after Vercel)

### Build Configuration
- [ ] Build command: `npm ci`
- [ ] Start command: `npm run db:migrate && npm run db:seed:prod && npm start`
- [ ] Health check path: `/health`

### Deployment
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Note the Railway URL

### Verification
- [ ] `GET /health` returns 200 OK
- [ ] `GET /api/v1/health` returns `{"status":"ok"}`
- [ ] `GET /api/v1/csrf` returns CSRF token
- [ ] `GET /api/docs` shows Swagger UI
- [ ] Check logs for migration success
- [ ] Check logs for admin user creation

**Railway API URL:** `_______________________________`

## Vercel Frontend Deployment

### Setup
- [ ] Create new Vercel project
- [ ] Connect GitHub repository
- [ ] Select `client` as root directory

### Environment Variables
- [ ] `VITE_API_BASE` (Railway API URL from above)

### Build Configuration
- [ ] Framework: Vite
- [ ] Root directory: `client`
- [ ] Build command: `npm ci && npm run build`
- [ ] Output directory: `dist`

### Deployment
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Note the Vercel URL

### Update Railway CORS
- [ ] Go back to Railway
- [ ] Update `CORS_ORIGIN` to Vercel URL
- [ ] Redeploy Railway service

### Verification
- [ ] Homepage loads
- [ ] No console errors
- [ ] Can sign up for account
- [ ] Can log in
- [ ] Can create project
- [ ] Guidelines page loads
- [ ] Admin page accessible
- [ ] API calls work (check Network tab)

**Vercel Frontend URL:** `_______________________________`

## Post-Deployment

### Security
- [ ] Change admin password after first login
- [ ] Set `ALLOW_FIRST_ADMIN=false` in Railway
- [ ] Verify HTTPS is used everywhere
- [ ] Test CSRF protection
- [ ] Test rate limiting

### Testing
- [ ] Sign up new user
- [ ] Log in as new user
- [ ] Create a project
- [ ] View projects list
- [ ] View project details
- [ ] Access guidelines
- [ ] Test admin features (as regulator)
- [ ] Test logout

### Monitoring
- [ ] Set up Railway alerts
- [ ] Monitor Vercel analytics
- [ ] Check error logs
- [ ] Monitor database usage
- [ ] Monitor API response times

### Documentation
- [ ] Update README with live URLs
- [ ] Document any custom configuration
- [ ] Share credentials with team (securely)
- [ ] Create user guide if needed

## Optional Enhancements

- [ ] Add custom domain to Railway
- [ ] Add custom domain to Vercel
- [ ] Set up automated backups
- [ ] Configure monitoring/alerting
- [ ] Set up CI/CD pipeline
- [ ] Add error tracking (Sentry)
- [ ] Configure CDN
- [ ] Enable database connection pooling

## Rollback Plan

If deployment fails:

1. **Railway:**
   - Go to Deployments
   - Click on previous successful deployment
   - Click "Redeploy"

2. **Vercel:**
   - Go to Deployments
   - Find previous successful deployment
   - Click "Promote to Production"

3. **Database:**
   - Restore from backup if needed
   - Run: `railway run psql $DATABASE_URL < backup.sql`

## Support Contacts

- Railway Support: https://railway.app/help
- Vercel Support: https://vercel.com/support
- Project Issues: https://github.com/eteka/Nigerian-Aviation-Innovation-Hub/issues

## Deployment Complete! 🎉

- [ ] All checklist items completed
- [ ] Application is live and functional
- [ ] Team notified of deployment
- [ ] Documentation updated

**Live URLs:**
- Frontend: `_______________________________`
- API: `_______________________________`
- API Docs: `_______________________________/api/docs`

**Admin Credentials:**
- Email: `_______________________________`
- Password: `_______________________________` (change immediately!)
