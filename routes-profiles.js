// routes/profiles.js - User profile routes
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @route   GET /api/profiles
// @desc    Get current user's profile
// @access  Private
router.get('/', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    let profile;
    if (req.user.userType === 'patient') {
      profile = await Patient.findOne({ userId: req.user.id });
    } else if (req.user.userType === 'doctor') {
      profile = await Doctor.findOne({ userId: req.user.id });
    }
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({
      user,
      profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/profiles
// @desc    Update current user's profile
// @access  Private
router.put('/', authenticateUser, async (req, res) => {
  try {
    const updateFields = {};
    
    // Fields that can be updated
    const allowedUserFields = ['name', 'email'];
    const allowedPatientFields = ['phone', 'address', 'dateOfBirth', 'emergencyContact'];
    const allowedDoctorFields = ['phone', 'address', 'specialization', 'qualification', 'experience'];
    
    // Update user fields
    allowedUserFields.forEach(field => {
      if (req.body[field] !== undefined)