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

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
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

app.use(express.json());

// Root route for basic connectivity
app.get('/', (req, res) => {
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
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${env.NODE_ENV}`);
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