const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('../utils/errorHandler');

module.exports = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];
  
  return (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      
      if (!authHeader) {
        throw new AuthenticationError('Authorization header is required');
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        throw new AuthenticationError('Bearer token is required');
      }
      
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            throw new AuthenticationError('Token has expired');
          } else if (err.name === 'JsonWebTokenError') {
            throw new AuthenticationError('Invalid token format');
          } else {
            throw new AuthenticationError('Token verification failed');
          }
        }
        
        if (roles.length > 0 && !roles.includes(user.role)) {
          throw new AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`);
        }
        
        req.user = user;
        next();
      });
    } catch (error) {
      next(error);
    }
  };
};
