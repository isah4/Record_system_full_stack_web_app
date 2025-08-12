const express = require('express');
const cors = require('cors');
const { checkAndFreePort } = require('./utils/port-manager');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const salesRoutes = require('./routes/sales');
const itemsRoutes = require('./routes/items');
const analyticsRoutes = require('./routes/analytics');
const expensesRoutes = require('./routes/expenses');
const debtsRoutes = require('./routes/debts');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/debts', debtsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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
        console.log(`Server running on port ${PORT}`);
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