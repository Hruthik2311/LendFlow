# 🚀 Quick Setup Guide

This guide will help you set up the Loan Recovery System locally with PostgreSQL.

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** (latest version)

## Step 1: Database Setup

1. **Install PostgreSQL**:

   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql`
   - **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service**:

   - **Windows**: PostgreSQL service should start automatically
   - **macOS**: `brew services start postgresql`
   - **Ubuntu**: `sudo systemctl start postgresql`

3. **Create database and user**:
   ```sql
   CREATE DATABASE loan_recovery_system;
   CREATE USER loan_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE loan_recovery_system TO loan_user;
   ```

## Step 2: Environment Configuration

1. **Backend Environment**:
   Create `.env` file in `backend/` directory:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=loan_recovery_system
   DB_USER=loan_user
   DB_PASSWORD=your_secure_password
   DB_DIALECT=postgresql

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRES_IN=24h

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

2. **Frontend Environment**:
   Create `.env` file in `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## Step 3: Install Dependencies

1. **Backend Dependencies**:

   ```bash
   cd backend
   npm install
   ```

2. **Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

## Step 4: Start the Application

1. **Start Backend** (Terminal 1):

   ```bash
   cd backend
   npm run dev
   ```

   Backend will start on `http://localhost:5000`

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will start on `http://localhost:5173`

## Step 5: Verify Setup

1. **Check Backend**: Visit `http://localhost:5000/api/health` (if available)
2. **Check Frontend**: Visit `http://localhost:5173`
3. **Test Login**: Use default admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL service is running
- Check credentials in `.env` file
- Ensure database and user exist
- Check port number (5432 for PostgreSQL)

### Port Already in Use

- Change `PORT` in backend `.env` file
- Update `VITE_API_URL` in frontend `.env` file accordingly

### Node Modules Issues

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## API Testing

Import the provided Postman collection:

1. Open Postman
2. Import `Loan_Recovery_System_API.postman_collection.json`
3. Import `Loan_Recovery_System_Environment.postman_environment.json`
4. Set the environment variables
5. Start testing the APIs

## Default Users

The system comes with these default users:

### Admin User

- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`

### Agent User

- Email: `agent@example.com`
- Password: `agent123`
- Role: `agent`

### Customer User

- Email: `customer@example.com`
- Password: `customer123`
- Role: `customer`

## Next Steps

1. **Explore the Application**: Log in with different user roles
2. **Test Features**: Try loan applications, payments, and reports
3. **API Testing**: Use the Postman collection to test all endpoints
4. **Customization**: Modify the application as needed

## Future Enhancements

- **Docker Support**: Containerization for easy deployment
- **Production Deployment**: Automated deployment pipelines
- **Monitoring**: Application performance monitoring
- **CI/CD**: Continuous integration and deployment

---

**Need Help?** Check the main README.md for detailed documentation and troubleshooting guides.
