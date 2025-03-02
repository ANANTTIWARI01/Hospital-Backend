// config/db.js - Database connection
const mongoose = require('mongoose');
const config = require('./default');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;

// config/default.js - Configuration variables
module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare-platform',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_for_development',
  jwtExpiration: '24h'
};
