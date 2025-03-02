// config/default.js - Configuration variables
module.exports = {
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare-platform',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_for_development',
    jwtExpiration: '24h'
  };
  