import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Accessible by Admin & Manager
router.get('/stats', protect, restrictTo('admin', 'manager'), getDashboardStats);

export default router;
