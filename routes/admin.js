const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const DoctorVerification = require('../models/DoctorVerification');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', [auth, isAdmin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/verify-doctor/:id
// @desc    Verify a doctor's registration
// @access  Admin
router.put('/verify-doctor/:id', [auth, isAdmin], async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    doctor.isVerified = true;
    doctor.verificationDate = Date.now();
    await doctor.save();

    // Create verification record
    await DoctorVerification.create({
      doctorId: doctor._id,
      verifiedBy: req.user.id,
      verificationDate: Date.now()
    });

    res.json({ msg: 'Doctor verified successfully', doctor });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/statistics
// @desc    Get system statistics
// @access  Admin
router.get('/statistics', [auth, isAdmin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const verifiedDoctors = await Doctor.countDocuments({ isVerified: true });
    const unverifiedDoctors = await Doctor.countDocuments({ isVerified: false });

    res.json({
      totalUsers,
      totalDoctors,
      totalPatients,
      verifiedDoctors,
      unverifiedDoctors
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/user/:id
// @desc    Delete a user and associated doctor/patient profile
// @access  Admin
router.delete('/user/:id', [auth, isAdmin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Remove associated profile based on user type
    if (user.userType === 'doctor') {
      await Doctor.findOneAndDelete({ userId: user._id });
    } else if (user.userType === 'patient') {
      await Patient.findOneAndDelete({ userId: user._id });
    }

    // Remove user
    await user.remove();

    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/pending-verifications
// @desc    Get all pending doctor verifications
// @access  Admin
router.get('/pending-verifications', [auth, isAdmin], async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ isVerified: false })
      .populate('userId', 'name email');
    res.json(pendingDoctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 