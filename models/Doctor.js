// models/Doctor.js - Doctor model
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  specialization: {
    type: String
  },
  registrationNumber: {
    type: String,
    required: true
  },
  verificationKey: {
    type: String
  },
  verificationDate: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  qualification: {
    type: String
  },
  experience: {
    type: Number
  },
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }]
});

module.exports = mongoose.model('Doctor', doctorSchema);