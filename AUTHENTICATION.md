# Authentication System Documentation

## Overview

Milestone 2 implements a complete authentication system with role-based access control for the Nigeria Aviation Innovation Hub.

## Features Implemented

### Backend (Express on port 5000)

✅ **Secure Authentication**
- Password hashing with bcrypt (10 salt rounds)
- HttpOnly cookies for session management
- Session-based authentication with express-session
- SQLite database for user storage

✅ **API Endpoints**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/me` - Get current authenticated user

✅ **Role-Based Access Control**
- Default role: `innovator`
- Admin role: `regulator`
- Middleware for protected routes
- Middleware for regulator-only routes

### Frontend (React + Vite on port 3000)

✅ **Authentication Pages**
- `/signup` - User registration form
- `/login` - User login form
- Form validation and error handling
- Loading states during API calls

✅ **Auth Context**
- Global authentication state management
- Auto-check authentication on app load
- Login, register, and logout functions
- User data accessible throughout app

✅ **Protected Routes**
- `/projects/new` - Requires authentication
- `/admin` - Requires regulator role
- Automatic redirect to login if not authenticated
- Access denied message for insufficient permissions

✅ **Dynamic Navbar**
- Shows Login/Sign Up when not authenticated
- Shows user name and Logout when authenticated
- Shows Admin link for regulators only
- Professional styling with role indicators

## Usage

### Starting the Application

```bash
# Start both servers
npm run dev

# Or start separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
cd client && npm run dev
```

### Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Testing Authentication

1. **Register a new user:**
   - Go to http://localhost:3000/signup
   - Fill in name, email, and password
   - Click "Sign Up"
   - You'll be automatically logged in

2. **Login:**
   - Go to http://localhost:3000/login
   - Enter email and password
   - Click "Login"

3. **Test protected routes:**
   - Try accessing http://localhost:3000/projects/new
   - Should work when logged in
   - Redirects to login when not authenticated

4. **Test regulator access:**
   - Set a user as regulator: `node set-regulator.js <email>`
   - Login with that user
   - Access http://localhost:3000/admin
   - Should see admin dashboard

### Setting a User as Regulator

```bash
node set-regulator.js user@example.com
```

This updates the user's role from `innovator` to `regulator` in the database.

## API Examples

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```bash
GET /api/auth/me
Cookie: connect.sid=<session-cookie>
```

### Logout
```bash
POST /api/auth/logout
Cookie: connect.sid=<session-cookie>
```

## Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ HttpOnly cookies prevent XSS attacks
- ✅ CORS configured for localhost:3000 only
- ✅ Session expiration (24 hours)
- ✅ Credentials required for API calls
- ✅ Input validation on registration
- ✅ SQL injection protection (prepared statements)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'innovator',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

## File Structure

```
server/
├── index.js              # Main server with session config
├── database.js           # SQLite database setup
├── routes/
│   └── auth.js          # Authentication endpoints
└── middleware/
    └── auth.js          # Auth middleware (requireAuth, requireRegulator)

client/src/
├── context/
│   └── AuthContext.jsx  # Global auth state
├── components/
│   ├── Navbar.jsx       # Dynamic navbar with auth state
│   └── ProtectedRoute.jsx # Route protection component
├── pages/
│   ├── Login.jsx        # Login page
│   ├── Signup.jsx       # Registration page
│   ├── NewProject.jsx   # Protected page (auth required)
│   └── Admin.jsx        # Protected page (regulator required)
└── utils/
    └── api.js           # Axios instance with credentials
```

## Next Steps (Milestone 3)

- Project submission form
- File upload functionality
- Database schema for projects
- Project listing and management

## Troubleshooting

**Issue: Session not persisting**
- Make sure `withCredentials: true` is set in axios
- Check that CORS origin matches frontend URL
- Verify cookies are enabled in browser

**Issue: Can't access admin page**
- Run `node set-regulator.js <your-email>` to set regulator role
- Logout and login again to refresh session

**Issue: Database locked**
- Stop the server
- Delete `server/aviation-hub.db`
- Restart server (database will be recreated)
