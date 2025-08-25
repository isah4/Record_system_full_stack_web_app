#!/usr/bin/env node

// Startup script for Render.com deployment
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const env = require('./config/env');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration for production
const allowedOrigins = process.env.CLIENT_URL 
  ? [process.env.CLIENT_URL]
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root route for Render health checks
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Record System API Server is running on Render',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    port: PORT,
    render: true
  });
});

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    render: true
  });
});

// Import and use routes
const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');
const itemsRoutes = require('./routes/items');
const analyticsRoutes = require('./routes/analytics');
const expensesRoutes = require('./routes/expenses');
const debtsRoutes = require('./routes/debts');
const activityRoutes = require('./routes/activity');

app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/debts', debtsRoutes);
app.use('/api/activity', activityRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Render server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Root endpoint: http://localhost:${PORT}/`);
});

module.exports = app;
