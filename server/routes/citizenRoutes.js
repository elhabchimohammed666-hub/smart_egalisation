import express from 'express';
import { getMyProfile, updateContactInfo, getCitizenRegistry, getCitizenDetails } from '../controllers/citizenController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Citizen private profile
router.get('/profile', protect, restrictTo('citizen'), getMyProfile);
router.put('/profile/contact', protect, restrictTo('citizen'), updateContactInfo);

// Administrative workspace registry (Admin & Manager)
router.get('/registry', protect, restrictTo('admin', 'manager'), getCitizenRegistry);
router.get('/registry/:id', protect, restrictTo('admin', 'manager'), getCitizenDetails);

export default router;
