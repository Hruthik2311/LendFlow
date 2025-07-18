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

// Main page with nice HTML interface
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Loan Recovery System API</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .container {
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 40px;
                max-width: 800px;
                width: 100%;
                text-align: center;
            }
            
            .header {
                margin-bottom: 30px;
            }
            
            .header h1 {
                color: #333;
                font-size: 2.5em;
                margin-bottom: 10px;
                font-weight: 300;
            }
            
            .header p {
                color: #666;
                font-size: 1.1em;
            }
            
            .status {
                background: #e8f5e8;
                border: 2px solid #4caf50;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .status-indicator {
                width: 12px;
                height: 12px;
                background: #4caf50;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .endpoints {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-top: 30px;
            }
            
            .endpoint-card {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 10px;
                padding: 20px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .endpoint-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .endpoint-card h3 {
                color: #495057;
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            
            .endpoint-card p {
                color: #6c757d;
                font-size: 0.9em;
                line-height: 1.4;
            }
            
            .api-link {
                display: inline-block;
                margin-top: 20px;
                padding: 12px 24px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 25px;
                transition: background 0.3s;
            }
            
            .api-link:hover {
                background: #0056b3;
            }
            
            .footer {
                margin-top: 30px;
                color: #6c757d;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏦 Loan Recovery System</h1>
                <p>Backend API Server</p>
            </div>
            
            <div class="status">
                <div class="status-indicator"></div>
                <span><strong>Status:</strong> Server is running and ready</span>
            </div>
            
            <div class="endpoints">
                <div class="endpoint-card">
                    <h3>🔐 Authentication</h3>
                    <p>User login, registration, and session management</p>
                </div>
                <div class="endpoint-card">
                    <h3>👥 Customers</h3>
                    <p>Customer management and profile operations</p>
                </div>
                <div class="endpoint-card">
                    <h3>💰 Loans</h3>
                    <p>Loan application, approval, and management</p>
                </div>
                <div class="endpoint-card">
                    <h3>💳 Payments</h3>
                    <p>Payment processing and transaction history</p>
                </div>
                <div class="endpoint-card">
                    <h3>👨‍💼 Agents</h3>
                    <p>Agent management and performance tracking</p>
                </div>
                <div class="endpoint-card">
                    <h3>📊 Reports</h3>
                    <p>Analytics, reports, and data insights</p>
                </div>
            </div>
            
            <a href="/api" class="api-link">View API Documentation</a>
            
            <div class="footer">
                <p>Version 1.0.0 | Environment: ${process.env.NODE_ENV || 'development'}</p>
                <p>Server running on port ${process.env.PORT || 5000}</p>
            </div>
        </div>
    </body>
    </html>
  `;
  res.send(html);
});

// API documentation endpoint (JSON)
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Loan Recovery System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      customers: '/api/customers',
      loans: '/api/loans',
      payments: '/api/payments',
      agents: '/api/agents',
      reports: '/api/reports',
      notifications: '/api/notifications'
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
const notificationRoutes = require('./routes/notification');

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Handler - must be after all routes
app.use(notFoundHandler);

// Global Error Handler - must be last
app.use(globalErrorHandler);

module.exports = app;
