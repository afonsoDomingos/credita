const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
  // Garantir que a pasta local 'uploads' existe
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Fallback para armazenamento em disco local
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const multerUpload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de ficheiro não permitido. Apenas JPG, PNG e PDF são aceites.'), false);
    }
  }
});

// Wrapper para interceptar o upload e gerar o link web acessível quando for local
const customUpload = {
  single: (fieldName) => {
    const originalMiddleware = multerUpload.single(fieldName);
    return (req, res, next) => {
      originalMiddleware(req, res, (err) => {
        if (err) return next(err);
        if (req.file && !isCloudinaryConfigured) {
          // Construir a URL pública para o ficheiro local
          const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
          req.file.path = `${baseUrl}/uploads/${req.file.filename}`;
        }
        next();
      });
    };
  }
};

module.exports = { cloudinary, upload: customUpload };
