import express from 'express';
import { getServices, getServiceById, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public / Citizens can view active services
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin service catalogue management
router.post('/', protect, restrictTo('admin'), createService);
router.put('/:id', protect, restrictTo('admin'), updateService);
router.delete('/:id', protect, restrictTo('admin'), deleteService);

export default router;
