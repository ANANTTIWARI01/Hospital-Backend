// models/User.js - User model
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);

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
