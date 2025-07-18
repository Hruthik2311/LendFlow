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
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px;
                overflow-x: hidden;
            }
            
            .container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                padding: 20px;
                max-width: 100%;
                width: 100%;
                text-align: center;
                max-height: 100vh;
                overflow-y: auto;
            }
            
            @media (min-width: 768px) {
                .container {
                    padding: 30px;
                    max-width: 700px;
                }
            }
            
            @media (min-width: 1024px) {
                .container {
                    padding: 40px;
                    max-width: 800px;
                }
            }
            
            .header {
                margin-bottom: 20px;
            }
            
            .header h1 {
                color: #2c3e50;
                font-size: clamp(1.8rem, 4vw, 2.5rem);
                margin-bottom: 8px;
                font-weight: 600;
                line-height: 1.2;
            }
            
            .header p {
                color: #7f8c8d;
                font-size: clamp(0.9rem, 2.5vw, 1.1rem);
                margin-bottom: 0;
            }
            
            .status {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                border: 1px solid #28a745;
                border-radius: 8px;
                padding: 12px 16px;
                margin: 15px 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                box-shadow: 0 2px 4px rgba(40, 167, 69, 0.1);
            }
            
            .status-indicator {
                width: 8px;
                height: 8px;
                background: #28a745;
                border-radius: 50%;
                animation: pulse 2s infinite;
                flex-shrink: 0;
            }
            
            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); }
                100% { opacity: 1; transform: scale(1); }
            }
            
            .endpoints {
                display: grid;
                grid-template-columns: 1fr;
                gap: 10px;
                margin: 20px 0;
            }
            
            @media (min-width: 480px) {
                .endpoints {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
            }
            
            @media (min-width: 768px) {
                .endpoints {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                }
            }
            
            .endpoint-card {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 15px;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            
            .endpoint-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #007bff, #6610f2);
                transform: scaleX(0);
                transition: transform 0.3s ease;
            }
            
            .endpoint-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                border-color: #007bff;
            }
            
            .endpoint-card:hover::before {
                transform: scaleX(1);
            }
            
            .endpoint-card h3 {
                color: #495057;
                margin-bottom: 6px;
                font-size: clamp(0.9rem, 2.5vw, 1.1rem);
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .endpoint-card p {
                color: #6c757d;
                font-size: clamp(0.75rem, 2vw, 0.9rem);
                line-height: 1.4;
                margin: 0;
            }
            
            .api-link {
                display: inline-block;
                margin: 15px 0;
                padding: 12px 24px;
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                transition: all 0.3s ease;
                font-weight: 500;
                font-size: clamp(0.85rem, 2.5vw, 1rem);
                box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
            }
            
            .api-link:hover {
                background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
                color: white;
                text-decoration: none;
            }
            
            .footer {
                margin-top: 20px;
                color: #6c757d;
                font-size: clamp(0.75rem, 2vw, 0.9rem);
                line-height: 1.4;
            }
            
            .footer p {
                margin: 2px 0;
            }
            
            /* Mobile optimizations */
            @media (max-width: 480px) {
                body {
                    padding: 5px;
                }
                
                .container {
                    padding: 15px;
                    border-radius: 8px;
                }
                
                .header h1 {
                    font-size: 1.6rem;
                }
                
                .header p {
                    font-size: 0.85rem;
                }
                
                .status {
                    padding: 10px 12px;
                    font-size: 0.85rem;
                }
                
                .endpoint-card {
                    padding: 12px;
                }
                
                .endpoint-card h3 {
                    font-size: 0.85rem;
                }
                
                .endpoint-card p {
                    font-size: 0.75rem;
                }
                
                .api-link {
                    padding: 10px 20px;
                    font-size: 0.85rem;
                }
            }
            
            /* Ensure no horizontal scroll */
            html, body {
                overflow-x: hidden;
                width: 100%;
            }
            
            /* Smooth scrolling */
            html {
                scroll-behavior: smooth;
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
