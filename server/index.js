const express = require('express');
const cors = require('cors');
const { checkAndFreePort } = require('./utils/port-manager');
const env = require('./config/env');

const app = express();
const PORT = env.PORT;

// CORS configuration with environment variables
const allowedOrigins = env.CLIENT_URL 
  ? [env.CLIENT_URL]
  : ['http://localhost:3000', 'http://localhost:3001'];

console.log('🚀 Server starting with configuration:');
console.log('📍 Port:', PORT);
console.log('🌍 Environment:', env.NODE_ENV);
console.log('🔗 Allowed Origins:', allowedOrigins);
console.log('📡 API URL:', env.CLIENT_URL);

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS: Allowing origin:', origin);
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log('❌ CORS: Blocking origin:', origin);
    console.log('🔒 Allowed origins:', allowedOrigins);
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n📥 [${timestamp}] ${req.method} ${req.url}`);
  console.log('📍 Origin:', req.get('Origin'));
  console.log('🔑 Authorization:', req.get('Authorization') ? 'Present' : 'None');
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`📤 [${timestamp}] Response Status: ${res.statusCode}`);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log('📦 Response Data:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('📦 Response Data (raw):', data);
      }
    }
    originalSend.call(this, data);
  };
  
  next();
});

app.use(express.json());

// Root route for basic connectivity
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint accessed');
  res.json({ 
    status: 'OK', 
    message: 'Record System API Server is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    port: PORT,
    allowedOrigins: allowedOrigins
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');
const itemsRoutes = require('./routes/items');
const analyticsRoutes = require('./routes/analytics');
const expensesRoutes = require('./routes/expenses');
const debtsRoutes = require('./routes/debts');
const activityRoutes = require('./routes/activity');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/debts', debtsRoutes);
app.use('/api/activity', activityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('💚 Health check endpoint accessed');
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    port: PORT
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  console.log('🧪 CORS test endpoint accessed');
  console.log('📍 Request Origin:', req.get('Origin'));
  console.log('🔒 Allowed Origins:', allowedOrigins);
  
  res.json({ 
    status: 'OK', 
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    requestOrigin: req.get('Origin'),
    allowedOrigins: allowedOrigins,
    corsEnabled: true
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:', err.stack);
  console.error('📍 Request URL:', req.url);
  console.error('🔑 Request Method:', req.method);
  
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS Error', 
      message: 'Origin not allowed',
      allowedOrigins: allowedOrigins,
      requestOrigin: req.get('Origin')
    });
  }
  
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler - fixed for Express 4.x
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.url);
  res.status(404).json({ error: 'Route not found' });
});

// Start server only on the specified port
async function startServer() {
  try {
    // Try to free the port if it's in use (set second parameter to true to kill the process)
    const portFreed = await checkAndFreePort(PORT, true);
    
    if (portFreed) {
      // Port is available or was freed, start server on the original port
      app.listen(PORT, () => {
        console.log(`\n🎉 Server successfully started!`);
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${env.NODE_ENV}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📊 Root endpoint: http://localhost:${PORT}/`);
        console.log(`🔒 Allowed Origins: ${allowedOrigins.join(', ')}`);
        console.log(`⏰ Started at: ${new Date().toISOString()}`);
        console.log('='.repeat(50));
      });
    } else {
      // Could not free the port, exit the process
      console.error(`Could not free port ${PORT}. Please ensure port ${PORT} is available before starting the server.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;