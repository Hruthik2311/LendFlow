# 🏦 Loan Recovery System

A comprehensive web-based loan management and recovery system built with Node.js/Express backend and React 19 frontend.

## ✨ Features

- **Multi-role System**: Admin, Agent, and Customer roles
- **JWT Authentication**: Secure token-based authentication
- **Loan Management**: Applications, approvals, EMI calculations
- **Payment System**: EMI payments with progress tracking
- **Recovery Management**: Agent assignment and status tracking
- **Real-time Notifications**: Instant notifications for agents
- **Reporting System**: Admin-only reports and analytics
- **Modern UI/UX**: Responsive design with smooth animations

## 🛠️ Technology Stack

**Backend**: Node.js, Express.js, PostgreSQL, Sequelize ORM, JWT, Winston
**Frontend**: React 19, Vite, CSS, Lottie animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm

### Setup

1. **Install PostgreSQL** and create database:

   ```sql
   CREATE DATABASE loan_recovery_system;
   CREATE USER loan_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE loan_recovery_system TO loan_user;
   ```

2. **Configure Environment**:

   Backend `.env`:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=loan_recovery_system
   DB_USER=loan_user
   DB_PASSWORD=your_password
   DB_DIALECT=postgresql
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

   Frontend `.env`:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Install & Run**:

   ```bash
   # Backend
   cd backend
   npm install
   npm run dev

   # Frontend (new terminal)
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 👥 User Roles

- **Admin**: Approve loans, assign agents, view reports
- **Agent**: Manage assigned loans, update recovery status
- **Customer**: Apply for loans, make payments, view history

## 📋 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/loans` - Get all loans (admin)
- `POST /api/loans` - Create loan application
- `PATCH /api/loans/:id/assign-agent` - Assign recovery agent
- `GET /api/payments/loan/:id` - Get loan payments
- `POST /api/payments` - Create payment (customers only)
- `GET /api/reports/*` - Admin reports
- `GET /api/notifications` - Get user notifications

## 🧪 Testing

Import the provided Postman collection (`Loan_Recovery_System_API.postman_collection.json`) for comprehensive API testing.

## 🔑 Default Users

- **Admin**: admin@example.com / admin123
- **Agent**: agent@example.com / agent123
- **Customer**: customer@example.com / customer123

## 🚀 Future Plans

- Docker containerization
- Production deployment automation
- Application monitoring
- CI/CD integration

## 📝 Documentation

- [Setup Guide](setup.md) - Detailed setup instructions
- [Error Handling](ERROR_HANDLING.md) - Error handling documentation
- [Submission Summary](SUBMISSION_SUMMARY.md) - Project overview

---

**Built with ❤️ using modern web technologies**
