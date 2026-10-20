import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mo9ata3a_smart',
  jwtSecret: process.env.JWT_SECRET || 'mo9ata3a_smart_super_secret_jwt_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  ocrConfidenceThreshold: 60, // Minimum OCR confidence score
  cinRegex: /^[A-Z]{1,2}[0-9]{5,7}$/i
};
