const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'SEU_CLOUD_NAME';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

let storage;

if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'etako_uploads',
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
    }
  });
} else {
  // Fallback to prevent crashes if Cloudinary is not configured
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, require('os').tmpdir())
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  });
}

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
