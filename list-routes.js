const express = require('express');
const path = require('path');

// Mock the database to avoid initialization
const mockDb = {
  exec: () => {},
  prepare: () => ({ run: () => {}, all: () => [], get: () => null }),
  transaction: (fn) => fn(),
  close: () => {}
};

// Override database module
require.cache[require.resolve('./server/database')] = {
  exports: mockDb,
  loaded: true
};

// Now load the server
const app = require('./server/index');

function listRoutes(app) {
  const routes = [];
  
  function extractRoutes(stack, prefix = '') {
    stack.forEach(middleware => {
      if (middleware.route) {
        // Route middleware
        const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase());
        const path = prefix + middleware.route.path;
        methods.forEach(method => {
          routes.push({ method, path });
        });
      } else if (middleware.name === 'router' && middleware.handle.stack) {
        // Router middleware
        const routerPath = middleware.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace(/\^/g, '')
          .replace(/\$/g, '')
          .replace(/\\/g, '');
        
        extractRoutes(middleware.handle.stack, prefix + routerPath);
      }
    });
  }
  
  extractRoutes(app._router.stack);
  return routes;
}

console.log('🔍 Listing all registered Express routes...\n');

const routes = listRoutes(app);

// Group by prefix
const grouped = {};
routes.forEach(route => {
  const key = route.path.split('/')[1] || 'root';
  if (!grouped[key]) grouped[key] = [];
  grouped[key].push(route);
});

// Print routes
console.log('REGISTERED ROUTES:');
console.log('='.repeat(60));

Object.keys(grouped).sort().forEach(group => {
  console.log(`\n[${group.toUpperCase()}]`);
  grouped[group].forEach(route => {
    console.log(`  ${route.method.padEnd(7)} ${route.path}`);
  });
});

console.log('\n' + '='.repeat(60));
console.log(`Total routes: ${routes.length}\n`);

// Find auth routes specifically
const authRoutes = routes.filter(r => r.path.includes('/auth'));
console.log('AUTH ROUTES:');
authRoutes.forEach(route => {
  console.log(`  ${route.method} ${route.path}`);
});

if (authRoutes.length === 0) {
  console.log('  ⚠️  No auth routes found!');
}

console.log('\n' + '='.repeat(60));

// Check auth router file
const authRouterPath = path.join(__dirname, 'server', 'routes', 'auth.js');
console.log(`\nAuth router file: ${authRouterPath}`);

// Read auth router to see what routes it defines
const fs = require('fs');
const authRouterContent = fs.readFileSync(authRouterPath, 'utf8');
const routeMatches = authRouterContent.match(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g);

if (routeMatches) {
  console.log('\nRoutes defined in auth.js:');
  routeMatches.forEach(match => {
    const [, method, path] = match.match(/router\.(\w+)\(['"]([^'"]+)['"]/);
    console.log(`  ${method.toUpperCase()} /api/auth${path}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log(`\nAuth routes available at: ${authRoutes.map(r => r.path).join(', ') || 'NONE FOUND'}`);

process.exit(0);
