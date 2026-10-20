import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const createDirs = () => {
  const dirs = ['uploads', 'uploads/cin', 'uploads/documents'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirs();

// Storage strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    createDirs();
    if (file.fieldname === 'cinFront' || file.fieldname === 'cinBack') {
      cb(null, 'uploads/cin');
    } else {
      cb(null, 'uploads/documents');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = file.mimetype;

  if (allowedTypes.test(ext) || allowedTypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté. Formats acceptés : JPG, PNG, WEBP, PDF.'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  },
  fileFilter
});

// Middleware for CIN registration: accepts cinFront and cinBack
export const uploadCIN = upload.fields([
  { name: 'cinFront', maxCount: 1 },
  { name: 'cinBack', maxCount: 1 }
]);

// Middleware for generic document uploads
export const uploadDocuments = upload.array('documents', 5);
