# API Documentation - Nigeria Aviation Innovation Hub

## 📚 Interactive Documentation

**🌐 Access URL:** http://localhost:5000/api/docs

The Nigeria Aviation Innovation Hub API is fully documented using OpenAPI 3.0.3 specification with interactive Swagger UI.

## ✅ Documentation Features

### Complete Coverage
- ✅ All 15+ endpoints documented with examples
- ✅ Request/response schemas defined
- ✅ Authentication requirements specified
- ✅ CSRF protection details included
- ✅ Rate limiting information provided
- ✅ Error response formats standardized

### Interactive Features
- ✅ "Try it out" functionality for all endpoints
- ✅ Real-time request/response testing
- ✅ Authentication flow testing
- ✅ Parameter validation
- ✅ Response format verification

### Security Documentation
- ✅ Session-based authentication explained
- ✅ CSRF token requirements detailed
- ✅ Rate limiting policies documented
- ✅ Error codes and messages standardized

## 🔗 Key Endpoints Documented

### Health & Security
- `GET /api/v1/health` - System health check
- `GET /api/v1/csrf` - CSRF token generation

### Authentication
- `POST /api/auth/register` - User registration (with admin support)
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/me` - Current user information
- `GET /api/auth/has-admin` - Admin existence check
- `POST /api/auth/request-admin` - Admin access request

### Projects
- `GET /api/projects` - List all projects (with filtering)
- `GET /api/projects/{id}` - Get specific project
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project

### Admin Functions
- `GET /api/admin/projects` - Admin project management
- `PUT /api/admin/projects/{id}/status` - Update project status
- `GET /api/admin/users` - User management
- `PUT /api/admin/users/{id}/role` - Update user roles
- `GET /api/admin/requests` - Admin request management
- `PUT /api/admin/requests/{id}/approve` - Approve admin requests
- `PUT /api/admin/requests/{id}/reject` - Reject admin requests
- `GET /api/admin/audit-logs` - Audit trail viewing

## 🛡️ Security Requirements

### Authentication
- Session-based authentication using httpOnly cookies
- Cookie name: `sessionId`
- Session duration: 24 hours

### CSRF Protection
- Required for all POST/PUT/DELETE operations
- Token obtained from `GET /api/v1/csrf`
- Token sent in `X-CSRF-Token` header
- Double-submit cookie pattern implemented

### Rate Limiting
- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 20 requests per 15 minutes
- Headers: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

## 📋 Schema Definitions

### User Schema
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "innovator"
}
```

### Error Schema
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      }
    ]
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Project Schema
```json
{
  "id": 1,
  "title": "Autonomous Drone Delivery System",
  "description": "Developing an AI-powered autonomous drone system...",
  "category": "Aircraft Tech",
  "status": "Submitted",
  "createdAt": "2023-11-14T10:30:00Z",
  "owner": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "innovator"
  }
}
```

## 🧪 Testing Results

All documentation endpoints tested successfully:

| Test | Status | Details |
|------|--------|---------|
| **Swagger UI Access** | ✅ PASS | Available at /api/docs |
| **Health Endpoint** | ✅ PASS | Matches OpenAPI spec |
| **CSRF Endpoint** | ✅ PASS | Matches OpenAPI spec |
| **Error Format** | ✅ PASS | Consistent JSON structure |

## 🎯 Usage Instructions

### For Developers
1. **View Documentation:** Visit http://localhost:5000/api/docs
2. **Test Endpoints:** Use "Try it out" buttons in Swagger UI
3. **Authentication:** Login first, then test protected endpoints
4. **CSRF Tokens:** Get token from `/v1/csrf` before mutations

### For Frontend Integration
1. **Base URL:** `http://localhost:5000/api`
2. **Authentication:** Include `withCredentials: true`
3. **CSRF Protection:** Fetch token and include in headers
4. **Error Handling:** Parse standardized error responses

## 📁 Files Created

- `server/openapi.json` - Complete OpenAPI 3.0.3 specification
- `server/openapi.yaml` - YAML version (backup)
- `API_DOCUMENTATION.md` - This documentation file
- Updated `server/index.js` - Swagger UI integration
- Updated `README.md` - Documentation access information

## 🚀 Production Ready

The API documentation is now production-ready with:
- ✅ Complete endpoint coverage
- ✅ Security requirements documented
- ✅ Interactive testing capability
- ✅ Standardized error responses
- ✅ Request/response validation
- ✅ Authentication flow documentation

**🌐 Access the documentation at: http://localhost:5000/api/docs**