import express from 'express';
import { registerCitizen, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadCIN } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', uploadCIN, registerCitizen);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
