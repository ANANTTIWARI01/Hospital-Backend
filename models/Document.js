// models/Document.js - Document model
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['prescription', 'labReport', 'medicalHistory', 'other'],
    default: 'other'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessGranted: {
      type: Date,
      default: Date.now
    },
    accessExpires: {
      type: Date
    }
  }]
});

module.exports = mongoose.model('Document', documentSchema);