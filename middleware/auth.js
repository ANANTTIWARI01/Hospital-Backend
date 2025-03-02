// middleware/auth.js - Authentication middleware
const jwt = require('jsonwebtoken');
const config = require('../config/default');

// JWT Authentication Middleware
const authenticateUser = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
  };
};

// Admin authorization middleware
const authenticateAdmin = [
  authenticateUser,
  (req, res, next) => {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  }
];

module.exports = { authenticateUser, authorize, authenticateAdmin };

