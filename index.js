// server.js - Main entry point
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/relationships', require('./routes/relationships'));
app.use('/api/admin', require('./routes/admin'));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
