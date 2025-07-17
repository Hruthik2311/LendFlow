# Error Handling Implementation

This document outlines the comprehensive error handling system implemented in the Loan Recovery System.

## Overview

The error handling system provides:

- Centralized error management
- Consistent error responses
- Input validation
- Proper HTTP status codes
- Detailed error logging
- User-friendly error messages
- Frontend error boundaries

## Backend Error Handling

### 1. Custom Error Classes (`backend/src/utils/errorHandler.js`)

```javascript
// Custom error classes for different scenarios
- AppError: Base error class
- ValidationError: Input validation errors (400)
- AuthenticationError: Authentication failures (401)
- AuthorizationError: Permission denied (403)
- NotFoundError: Resource not found (404)
- ConflictError: Resource conflicts (409)
```

### 2. Global Error Handler

The global error handler (`globalErrorHandler`) catches all errors and:

- Logs detailed error information
- Formats error responses consistently
- Handles Sequelize errors automatically
- Provides different detail levels for development/production

### 3. Async Error Wrapper

The `asyncHandler` wrapper eliminates the need for try-catch blocks in controllers:

```javascript
// Before
exports.createLoan = async (req, res) => {
  try {
    // controller logic
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// After
exports.createLoan = asyncHandler(async (req, res) => {
  // controller logic - errors automatically caught
});
```

### 4. Input Validation (`backend/src/middleware/validation.js`)

Comprehensive validation for:

- Email format validation
- Phone number validation
- Amount validation (positive numbers)
- Interest rate validation (0-100%)
- Loan term validation (1-360 months)
- Role validation
- Password strength validation

### 5. Authentication Middleware

Enhanced auth middleware with:

- Detailed error messages for different JWT errors
- Role-based access control
- Proper error handling for missing/invalid tokens

## Frontend Error Handling

### 1. API Utility (`frontend/src/utils/api.js`)

Centralized API handling with:

- Automatic token management
- Consistent error response parsing
- Network error handling
- HTTP status code handling

### 2. Error Handlers

```javascript
// Error handler for components
handleApiError(error, setError) {
  // Handles different error types
  // Auto-logout on 401
  // User-friendly messages
}

// Success handler
handleApiSuccess(message, setSuccess) {
  // Shows success messages
  // Auto-clears after 3 seconds
}
```

### 3. Error Boundary (`frontend/src/components/ErrorBoundary.jsx`)

React error boundary that:

- Catches JavaScript errors in components
- Shows user-friendly error UI
- Provides development error details
- Allows recovery options

## Error Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "validationErrors": [
      {
        "field": "email",
        "message": "Valid email is required",
        "value": "invalid-email"
      }
    ]
  }
}
```

## Logging

### Winston Logger (`backend/src/utils/logger.js`)

- Structured JSON logging
- File-based logging (error.log, combined.log)
- Console logging in development
- Request/response logging
- Error tracking with context

### Log Levels

- `error`: Application errors
- `warn`: Security events
- `info`: Business events, requests
- `debug`: Detailed debugging info

## Usage Examples

### Backend Controller

```javascript
const {
  asyncHandler,
  ValidationError,
  NotFoundError,
} = require("../utils/errorHandler");

exports.createLoan = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (amount <= 0) {
    throw new ValidationError("Loan amount must be greater than 0");
  }

  const customer = await Customer.findByPk(customerId);
  if (!customer) {
    throw new NotFoundError("Customer not found");
  }

  // ... rest of logic
});
```

### Frontend Component

```javascript
import { api, handleApiError, handleApiSuccess } from "../utils/api";

const handleSubmit = async () => {
  try {
    const data = await api.createLoan(loanData);
    handleApiSuccess("Loan created successfully", setSuccess);
  } catch (error) {
    handleApiError(error, setError);
  }
};
```

## Environment Variables

```bash
# Error handling configuration
NODE_ENV=development  # Affects error detail level
LOG_LEVEL=info        # Winston log level
JWT_SECRET=your_secret # JWT signing secret
```

## Testing Error Handling

### Test Invalid Input

```bash
# Test validation
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "123"}'
```

### Test Authentication

```bash
# Test without token
curl http://localhost:5000/api/loans

# Test with invalid token
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:5000/api/loans
```

### Test Authorization

```bash
# Test customer accessing admin route
curl -H "Authorization: Bearer customer-token" \
  http://localhost:5000/api/loans/1/assign-agent
```

## Best Practices

1. **Always use asyncHandler** for controller methods
2. **Validate input** before processing
3. **Use specific error classes** for different scenarios
4. **Log errors** with sufficient context
5. **Provide user-friendly messages** in frontend
6. **Handle network errors** gracefully
7. **Use proper HTTP status codes**
8. **Test error scenarios** thoroughly

## Monitoring

The system provides:

- Request/response logging
- Error tracking with stack traces
- Performance monitoring (request duration)
- Security event logging
- Business event tracking

## Future Enhancements

1. **Error Reporting Service**: Integrate with services like Sentry
2. **Rate Limiting**: Add rate limiting middleware
3. **Request Validation**: Add Joi schema validation
4. **Error Analytics**: Track error patterns and frequencies
5. **Automated Alerts**: Set up alerts for critical errors
