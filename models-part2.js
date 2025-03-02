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

// models/AccessLog.js - Access log model
const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  accessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessType: {
    type: String,
    enum: ['view', 'download', 'share', 'revoke'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  }
});

module.exports = mongoose.model('AccessLog', accessLogSchema);

// models/DoctorVerification.js - Doctor verification model
const mongoose = require('mongoose');

const doctorVerificationSchema = new mongoose.Schema({
  uniqueKey: {
    type: String,
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true
  },
  issuedTo: {
    type: String
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: String
  },
  usedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
});

module.exports = mongoose.model('DoctorVerification', doctorVerificationSchema);
