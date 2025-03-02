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
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Update user document if there are fields to update
    if (Object.keys(updateFields).length > 0) {
      await User.findByIdAndUpdate(req.user.id, updateFields, { new: true });
    }

    // Update profile specific fields
    const profileFields = {};
    const allowedFields = req.user.userType === 'patient' ? allowedPatientFields : allowedDoctorFields;

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        profileFields[field] = req.body[field];
      }
    });

    let profile;
    if (req.user.userType === 'patient') {
      profile = await Patient.findOneAndUpdate(
        { userId: req.user.id },
        profileFields,
        { new: true, upsert: true }
      );
    } else if (req.user.userType === 'doctor') {
      profile = await Doctor.findOneAndUpdate(
        { userId: req.user.id },
        profileFields,
        { new: true, upsert: true }
      );
    }

    // Get updated user data
    const user = await User.findById(req.user.id).select('-password');

    res.json({
      user,
      profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/profiles
// @desc    Delete user profile
// @access  Private
router.delete('/', authenticateUser, async (req, res) => {
  try {
    // Delete profile based on user type
    if (req.user.userType === 'patient') {
      await Patient.findOneAndDelete({ userId: req.user.id });
    } else if (req.user.userType === 'doctor') {
      await Doctor.findOneAndDelete({ userId: req.user.id });
    }

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'User and profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;