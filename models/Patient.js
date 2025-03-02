// models/Patient.js - Patient model
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
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
  aadhaarNumber: {
    type: String,
    required: true,
    unique: true
  },
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }]
});

module.exports = mongoose.model('Patient', patientSchema);