// routes/auth.js - Authentication routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const DoctorVerification = require('../models/DoctorVerification');
const verifyAadhaar = require('../utils/aadhaarVerify');
const verifyDoctorKey = require('../utils/doctorKeyVerify');
const { authenticateUser } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, userType, aadhaarNumber, doctorKey } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Verify credentials based on user type
    if (userType === 'patient') {
      if (!aadhaarNumber) {
        return res.status(400).json({ error: 'Aadhaar number is required for patient registration' });
      }
      
      // Check if Aadhaar is already registered
      const existingPatientWithAadhaar = await Patient.findOne({ aadhaarNumber });
      if (existingPatientWithAadhaar) {
        return res.status(400).json({ error: 'This Aadhaar number is already registered' });
      }
      
      // Verify Aadhaar
      const aadhaarVerification = await verifyAadhaar(aadhaarNumber);
      if (!aadhaarVerification.isValid) {
        return res.status(400).json({ error: 'Invalid Aadhaar number' });
      }
      
      // You can use verified details from Aadhaar if needed
      const verifiedName = aadhaarVerification.details.name;
      const verifiedGender = aadhaarVerification.details.gender;
      
    } else if (userType === 'doctor') {
      if (!doctorKey) {
        return res.status(400).json({ error: 'Doctor verification key is required' });
      }
      
      // Verify doctor key
      const keyVerification = await verifyDoctorKey(doctorKey);
      if (!keyVerification.isValid) {
        return res.status(400).json({ error: 'Invalid doctor verification key' });
      }
      
      // You can use verified details for doctor profile
      const verifiedSpecialization = keyVerification.details.specialization;
      const verifiedRegistrationNumber = keyVerification.details.registrationNumber;
      
      // Mark the key as used
      await DoctorVerification.findOneAndUpdate(
        { uniqueKey: doctorKey },
        { isUsed: true, usedBy: email, usedAt: new Date() }
      );
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      userType
    });
    
    await user.save();
    
    // Create profile based on user type
    if (userType === 'patient') {
      const patient = new Patient({
        userId: user._id,
        name,
        email,
        aadhaarNumber, // Store Aadhaar number
        aadhaarVerified: true,
        // Add more verified fields from Aadhaar if needed
        medicalHistory: []
      });
      await patient.save();
    } else if (userType === 'doctor') {
      const doctor = new Doctor({
        userId: user._id,
        name,
        email,
        specialization: keyVerification.details.specialization || req.body.specialization || '',
        registrationNumber: keyVerification.details.registrationNumber,
        verificationKey: doctorKey,
        verificationDate: new Date(),
        isVerified: true,
        patients: []
      });
      await doctor.save();
    }
    
    // Generate JWT token
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType
      }
    };
    
    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          message: 'User registered successfully',
          token
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType
      }
    };
    
    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
