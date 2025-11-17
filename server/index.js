const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
require('dotenv').config();
require('./database'); // Initialize database

// Import middleware
const requestIdMiddleware = require('./middleware/requestId');
const { logRequest, logInfo } = require('./utils/logger');
const { defaultLimiter, authLimiter } = require('./middleware/rateLimiting');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generateCSRFTokenEndpoint, csrfProtection } = require('./middleware/csrf');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false // Allow embedding for development
}));

// Request ID and logging
app.use(requestIdMiddleware);
app.use(logRequest);

// Rate limiting
app.use(defaultLimiter);
app.use('/api/auth', authLimiter);

// CORS - strict configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = ['http://localhost:3000'];
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'aviation-hub-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  name: 'sessionId' // Don't use default session name
}));

// CSRF Protection (apply to mutation routes)
app.use('/api/auth', csrfProtection);
app.use('/api/projects', csrfProtection);
app.use('/api/admin', csrfProtection);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

// Basic API info
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Nigeria Aviation Innovation Hub API',
    version: '1.0.0',
    requestId: req.requestId
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'ok',
    requestId: req.requestId
  });
});

// CSRF token endpoint
app.get('/api/v1/csrf', generateCSRFTokenEndpoint);

// Load OpenAPI specification
const swaggerDocument = require('./openapi.json');

// Swagger UI setup
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Nigeria Aviation Innovation Hub API',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// 404 handler for unknown routes
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logInfo('Server started', { 
    port: PORT, 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
  console.log(`🚀 Server is running on port ${PORT}`);
});
