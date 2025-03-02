const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @route   POST /api/relationships/doctor-patient
// @desc    Connect a doctor with a patient
// @access  Private
router.post('/doctor-patient', auth, async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    // Check if both doctor and patient exist
    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      return res.status(404).json({ msg: 'Doctor or Patient not found' });
    }

    // Check if relationship already exists
    if (doctor.patients.includes(patientId)) {
      return res.status(400).json({ msg: 'Relationship already exists' });
    }

    // Add patient to doctor's patients list
    doctor.patients.push(patientId);
    await doctor.save();

    // Add doctor to patient's doctors list
    patient.doctors.push(doctorId);
    await patient.save();

    res.json({ msg: 'Relationship established successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/relationships/doctor-patient
// @desc    Remove connection between a doctor and patient
// @access  Private
router.delete('/doctor-patient', auth, async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    // Check if both doctor and patient exist
    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      return res.status(404).json({ msg: 'Doctor or Patient not found' });
    }

    // Remove patient from doctor's patients list
    doctor.patients = doctor.patients.filter(
      (id) => id.toString() !== patientId
    );
    await doctor.save();

    // Remove doctor from patient's doctors list
    patient.doctors = patient.doctors.filter(
      (id) => id.toString() !== doctorId
    );
    await patient.save();

    res.json({ msg: 'Relationship removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/relationships/doctor/:doctorId/patients
// @desc    Get all patients for a specific doctor
// @access  Private
router.get('/doctor/:doctorId/patients', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId)
      .populate('patients', 'name email phone address dateOfBirth');

    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    res.json(doctor.patients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/relationships/patient/:patientId/doctors
// @desc    Get all doctors for a specific patient
// @access  Private
router.get('/patient/:patientId/doctors', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId)
      .populate('doctors', 'name email specialization registrationNumber');

    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found' });
    }

    res.json(patient.doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 