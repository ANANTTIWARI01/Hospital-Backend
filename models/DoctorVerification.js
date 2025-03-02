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
