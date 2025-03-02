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

// middleware/upload.js - File upload middleware
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user.id;
    const dir = `./uploads/${userId}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept pdfs, images, and common document formats
  const allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, and documents are allowed.'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload;
