const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { globalErrorHandler, notFoundHandler } = require('./utils/errorHandler');
const { logRequest } = require('./utils/logger');

const app = express();

// Security middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(logRequest);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Loan Recovery System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Example route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Loan Recovery System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      customers: '/api/customers',
      loans: '/api/loans',
      payments: '/api/payments',
      agents: '/api/agents'
    }
  });
});

// API Routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const loanRoutes = require('./routes/loan');
const paymentRoutes = require('./routes/payment');
const agentRoutes = require('./routes/agent');
const reportRoutes = require('./routes/report');

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/reports', reportRoutes);

// 404 Handler - must be after all routes
app.use(notFoundHandler);

// Global Error Handler - must be last
app.use(globalErrorHandler);

module.exports = app;
