# 🏦 Loan Recovery System

A comprehensive web-based loan management and recovery system built with Node.js/Express backend and React frontend. The system handles loan applications, payments, recovery management, and provides detailed reporting for financial institutions.

## ✨ Features

### 🔐 Authentication & Authorization

- **Multi-role System**: Admin, Agent, and Customer roles
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different interfaces and permissions per role
- **Auto-login**: Automatic login after registration

### 💰 Loan Management

- **Loan Applications**: Customers can apply for loans with automatic interest rate calculation
- **Smart Interest Rates**: Dynamic calculation based on amount and term (1.5% - 3.5%)
- **Loan Status Tracking**: Pending, Approved, Rejected, Active, Closed, Defaulted
- **EMI Calculation**: Automatic EMI computation with proper financial formulas
- **Payment Progress**: Visual progress bars showing payment completion

### 💳 Payment System

- **EMI Payments**: Structured monthly payments
- **Payment History**: Complete transaction history
- **Balance Tracking**: Real-time remaining balance calculation
- **Floating-point Precision**: Handles small balance discrepancies (< ₹1 considered fully paid)
- **Payment Success Animation**: Engaging user feedback

### 🔍 Recovery Management

- **Agent Assignment**: Admins can assign recovery agents to loans
- **Recovery Status**: Pending, In Progress, Recovered
- **Agent Dashboard**: Dedicated interface for recovery agents
- **Status Updates**: Real-time recovery status management

### 📊 Reporting System (Admin Only)

- **Recovered Loans Report**: Complete overview of recovered loans
- **Outstanding Loans Report**: Active loans requiring attention
- **Comprehensive Recovery Report**: Overall system performance
- **Summary Statistics**: Total amounts, counts, and recovery rates
- **Export-ready Data**: Structured data for external analysis

### 🎨 Modern UI/UX

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Styling**: Gradient backgrounds, glass morphism effects
- **Interactive Elements**: Hover effects, loading states, animations
- **Consistent Design**: Unified design language across all pages
- **Bootstrap Integration**: Professional component library

## 🏗️ Architecture

### Backend (Node.js/Express)

```
backend/
├── src/
│   ├── controllers/     # Business logic
│   ├── models/         # Database models
│   ├── routes/         # API endpoints
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utilities and helpers
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── logs/               # Application logs
├── docker-compose.yml  # Docker configuration
└── package.json        # Dependencies
```

### Frontend (React 19 + Vite)

```
frontend/
├── src/
│   ├── pages/          # Main application pages
│   ├── components/     # Reusable components
│   ├── utils/          # API utilities and helpers
│   ├── styles/         # CSS stylesheets
│   ├── assets/         # Static assets
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Public assets
└── package.json        # Dependencies
```

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Logging**: Winston
- **Validation**: Custom middleware
- **Error Handling**: Centralized error management

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: CSS with Bootstrap 5
- **Animations**: Lottie animations
- **HTTP Client**: Fetch API with custom wrapper
- **State Management**: React Hooks
- **Routing**: React Router (implicit)

### DevOps

- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 16
- **Environment**: Development and production ready

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Loan_System
   ```

2. **Start the application**

   ```bash
   cd backend
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Local Development

1. **Backend Setup**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database Setup**
   - Install PostgreSQL
   - Create database: `loan_recovery`
   - Update `.env` file with database credentials

## 📋 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Loans

- `GET /api/loans` - Get all loans (admin)
- `GET /api/loans/customer/:id` - Get customer loans
- `GET /api/loans/agent/:id` - Get agent loans
- `POST /api/loans` - Create loan application
- `PUT /api/loans/:id/status` - Update loan status
- `PUT /api/loans/:id/assign-agent` - Assign recovery agent
- `PUT /api/loans/:id/recovery-status` - Update recovery status
- `DELETE /api/loans/:id` - Delete rejected loan

### Payments

- `GET /api/payments/loan/:id` - Get loan payments
- `POST /api/payments` - Create payment

### Reports (Admin Only)

- `GET /api/reports/recovered` - Recovered loans report
- `GET /api/reports/outstanding` - Outstanding loans report
- `GET /api/reports/recovery` - Comprehensive recovery report

## 👥 User Roles & Permissions

### 👤 Customer

- Apply for loans
- View own loan applications
- Make EMI payments
- View payment history
- Delete rejected applications

### 👨‍💼 Agent

- View assigned loans
- Update recovery status
- Track payment progress
- Manage recovery process

### 👨‍💻 Admin

- View all loans and users
- Approve/reject loan applications
- Assign recovery agents
- Access comprehensive reports
- Manage system-wide data

## 🔧 Configuration

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=loan_recovery
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret

# Server
PORT=5000
NODE_ENV=development
```

### Database Schema

- **Users**: Authentication and role management
- **Customers**: Customer information
- **Agents**: Recovery agent details
- **Loans**: Loan applications and status
- **Payments**: Payment transactions

## 🛡️ Security Features

- **Input Validation**: Comprehensive validation for all inputs
- **SQL Injection Protection**: Sequelize ORM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CORS Configuration**: Proper cross-origin resource sharing
- **Rate Limiting**: Built-in Express rate limiting
- **Error Handling**: Secure error responses without sensitive data

## 📈 Performance Features

- **Database Indexing**: Optimized queries with proper indexing
- **Connection Pooling**: Efficient database connections
- **Caching**: Strategic caching for frequently accessed data
- **Compression**: Response compression for better performance
- **Lazy Loading**: Component-based code splitting

## 🐛 Error Handling

The system implements comprehensive error handling:

- **Centralized Error Management**: Consistent error responses
- **Custom Error Classes**: Specific error types for different scenarios
- **Frontend Error Boundaries**: Graceful error recovery
- **Detailed Logging**: Winston-based structured logging
- **User-friendly Messages**: Clear error communication

See [ERROR_HANDLING.md](ERROR_HANDLING.md) for detailed documentation.

## 🧪 Testing

### Manual Testing Scenarios

1. **User Registration & Login**
2. **Loan Application Process**
3. **Payment Processing**
4. **Recovery Management**
5. **Report Generation**

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test API info
curl http://localhost:5000/
```

## 📝 Development Guidelines

### Code Style

- **Backend**: ESLint configuration for Node.js
- **Frontend**: ESLint with React-specific rules
- **Consistent Formatting**: Prettier integration

### Git Workflow

- Feature branches for new development
- Pull requests for code review
- Semantic commit messages

### Database Migrations

- Sequelize migrations for schema changes
- Data seeding for development

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**: Configure production environment variables
2. **Database Migration**: Run database migrations
3. **Build Process**: Build frontend for production
4. **Container Deployment**: Deploy using Docker Compose
5. **SSL Configuration**: Set up HTTPS certificates
6. **Monitoring**: Implement application monitoring

### Docker Deployment

```bash
# Production build
docker-compose -f docker-compose.prod.yml up --build

# With custom environment
docker-compose -f docker-compose.prod.yml --env-file .env.prod up
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the error handling guide

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Added comprehensive error handling
- **v1.2.0**: Enhanced UI/UX with modern design
- **v1.3.0**: Added reporting system
- **v1.4.0**: Improved payment processing and balance calculations

---

**Built with ❤️ using modern web technologies**
