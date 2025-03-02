// routes/documents.js - Document management routes
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { authenticateUser } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Document = require('../models/Document');
const User = require('../models/User');
const AccessLog = require('../models/AccessLog');

// @route   POST /api/documents/upload
// @desc    Upload a document
// @access  Private
router.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const newDocument = new Document({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      category: req.body.category || 'other'
    });
    
    await newDocument.save();
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: newDocument._id,
        filename: newDocument.originalName,
        category: newDocument.category,
        uploadDate: newDocument.uploadDate
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/documents
// @desc    Get all documents for current user
// @access  Private
router.get('/', authenticateUser, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id })
      .select('_id originalName category uploadDate size sharedWith')
      .sort({ uploadDate: -1 });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/documents/shared
// @desc    Get documents shared with current user
// @access  Private
router.get('/shared', authenticateUser, async (req, res) => {
  try {
    const sharedDocuments = await Document.find({
      'sharedWith.userId': req.user.id,
      'sharedWith.accessExpires': { $gt: new Date() }
    })
    .select('_id originalName category uploadDate size userId')
    .populate('userId', 'name email')
    .sort({ uploadDate: -1 });
    
    res.json(sharedDocuments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/documents/:id
// @desc    Get a single document by ID
// @access  Private
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check authorization
    const isOwner = document.userId.toString() === req.user.id;
    const isSharedWithUser = document.sharedWith.some(share => 
      share.userId.toString() === req.user.id && 
      (!share.accessExpires || new Date(share.accessExpires) > new Date())
    );
    
    if (!isOwner && !isSharedWithUser) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Log access
    const accessLog = new AccessLog({
      documentId: document._id,
      accessedBy: req.user.id,
      accessType: 'view',
      ipAddress: req.ip
    });
    await accessLog.save();
    
    // Stream file to client
    const filePath = path.resolve(document.path);
    if (fs.existsSync(filePath)) {
      res.set({
        'Content-Type': document.mimetype,
        'Content-Disposition': `inline; filename="${document.originalName}"`
      });
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: 'File not found on server' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/documents/:id/share
// @desc    Share a document with another user
// @access  Private
router.post('/:id/share', authenticateUser, async (req, res) => {
  try {
    const { recipientEmail, expiryDays } = req.body;
    if (!recipientEmail) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }
    
    // Find document
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Verify ownership
    if (document.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the document owner can share it' });
    }
    
    // Find recipient
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    
    // Calculate expiry date
    const accessExpires = expiryDays ? new Date(new Date().getTime() + expiryDays * 24 * 60 * 60 * 1000) : null;
    
    // Check if already shared with this user
    const alreadySharedIndex = document.sharedWith.findIndex(
      share => share.userId.toString() === recipient._id.toString()
    );
    
    if (alreadySharedIndex !== -1) {
      // Update existing share
      document.sharedWith[alreadySharedIndex].accessGranted = new Date();
      document.sharedWith[alreadySharedIndex].accessExpires = accessExpires;
    } else {
      // Add new share
      document.sharedWith.push({
        userId: recipient._id,
        accessGranted: new Date(),
        accessExpires
      });
    }
    
    await document.save();
    
    // Log sharing
    const accessLog = new AccessLog({
      documentId: document._id,
      accessedBy: req.user.id,
      accessType: 'share',
      ipAddress: req.ip
    });
    await accessLog.save();
    
    res.json({ 
      message: 'Document shared successfully',
      sharedWith: recipient.email,
      expiresAt: accessExpires
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/documents/:id/share/:userId
// @desc    Revoke access to a document
// @access  Private
router.delete('/:id/share/:userId', authenticateUser, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Verify ownership
    if (document.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the document owner can revoke access' });
    }
    
    // Remove user from shared list
    document.sharedWith = document.sharedWith.filter(
      share => share.userId.toString() !== req.params.userId
    );
    
    await document.save();
    
    // Log revocation
    const accessLog = new AccessLog({
      documentId: document._id,
      accessedBy: req.user.id,
      accessType: 'revoke',
      ipAddress: req.ip
    });
    await accessLog.save();
    
    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Verify ownership
    if (document.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the document owner can delete it' });
    }
    
    // Delete physical file
    fs.unlink(document.path, async (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
      
      // Delete document record regardless of file deletion success
      await Document.findByIdAndDelete(req.params.id);
      
      // Delete associated access logs
      await AccessLog.deleteMany({ documentId: req.params.id });
      
      res.json({ message: 'Document deleted successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
