// models/Document.js - Document model
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String
  }],
  isPrivate: {
    type: Boolean,
    default: true
  }
});

// Add index for better query performance
documentSchema.index({ patientId: 1, doctorId: 1 });

module.exports = mongoose.model('Document', documentSchema);