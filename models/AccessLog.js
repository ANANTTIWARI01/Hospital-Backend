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