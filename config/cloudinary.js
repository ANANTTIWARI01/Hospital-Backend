const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hospital-documents', // The folder in cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], // Allowed file formats
    transformation: [{ quality: 'auto' }], // Basic optimization
  },
});

// Create multer upload middleware
const upload = multer({ storage: storage });

module.exports = {
  cloudinary,
  upload
}; 