const multer = require('multer');
const path = require('path');
const fs = require('fs');

let upload;
let cloudinary = null;

const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  return name && !name.includes('PLACEHOLDER') && name !== 'xxx';
};

if (isCloudinaryConfigured()) {
  try {
    const cloudinaryModule = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinaryModule.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    cloudinary = cloudinaryModule;

    const storage = new CloudinaryStorage({
      cloudinary: cloudinaryModule,
      params: {
        folder: 'safelle',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }]
      }
    });

    upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      }
    });

    console.log('Cloudinary storage initialized');
  } catch (e) {
    console.warn('[Upload] Cloudinary init failed:', e.message);
  }
}

// Fallback: use local disk storage if Cloudinary not configured
if (!upload) {
  console.warn('[Upload] Cloudinary not configured — using local disk storage fallback');

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });

  upload = multer({
    storage: localStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    }
  });
}

module.exports = { upload, cloudinary };
