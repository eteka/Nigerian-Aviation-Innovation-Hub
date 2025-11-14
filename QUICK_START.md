# Quick Start Guide

## 🚀 Your Application is Running!

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## ✅ What's Working Now

### 1. User Registration & Login
- Visit http://localhost:3000/signup to create an account
- All new users get the `innovator` role by default
- Passwords are securely hashed with bcrypt

### 2. Authentication State
- The navbar shows your name when logged in
- Logout button appears when authenticated
- Login/Sign Up buttons show when not authenticated

### 3. Protected Routes
- `/projects/new` - Requires login (try accessing before/after login)
- `/admin` - Requires regulator role

### 4. Role-Based Access
- Default users are `innovator`
- To test admin features, make yourself a regulator:
  ```bash
  node set-regulator.js your-email@example.com
  ```
- Then logout and login again
- You'll see an "Admin" link in the navbar

## 🧪 Test Flow

1. **Sign Up**
   - Go to http://localhost:3000/signup
   - Create account with name, email, password
   - You'll be auto-logged in

2. **Test Protected Route**
   - Click "Projects" in navbar
   - Click "Submit New Project" button
   - You should see the new project page (placeholder)

3. **Logout**
   - Click "Logout" in navbar
   - Try accessing http://localhost:3000/projects/new
   - You'll be redirected to login

4. **Login Again**
   - Go to http://localhost:3000/login
   - Enter your credentials
   - You're back in!

5. **Test Admin Access** (Optional)
   - Open a terminal and run: `node set-regulator.js your-email@example.com`
   - Logout and login again
   - You'll see "Admin" link in navbar
   - Click it to access admin dashboard

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt
- ✅ HttpOnly cookies (can't be accessed by JavaScript)
- ✅ Session expires after 24 hours
- ✅ CORS configured for localhost:3000
- ✅ Protected API endpoints
- ✅ Role-based authorization

## 📁 Database

- Location: `server/aviation-hub.db`
- Type: SQLite
- Tables: `users`, `sessions`

To view users:
```bash
# Install sqlite3 CLI if needed, then:
sqlite3 server/aviation-hub.db "SELECT id, name, email, role FROM users;"
```

## 🛠️ Useful Commands

```bash
# Start both servers
npm run dev

# Start backend only
npm run server

# Start frontend only
cd client && npm run dev

# Make user a regulator
node set-regulator.js email@example.com

# Test auth endpoints
node test-auth.js
```

## 📝 API Endpoints

All endpoints use `/api` prefix:

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/health` - Health check

## 🎯 Next: Milestone 3

Coming next:
- Project submission form with file uploads
- Database schema for projects
- ICAO basket categorization
- Project listing and management

## 💡 Tips

- Keep both terminal windows open (backend + frontend)
- Check browser console for any errors
- Check terminal output for server logs
- Use browser DevTools > Application > Cookies to see session cookie
