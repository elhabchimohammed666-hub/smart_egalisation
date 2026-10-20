import express from 'express';
import { getStaffList, createStaff, updateStaff, toggleStaffStatus } from '../controllers/staffController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Only admin can manage staff accounts
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', getStaffList);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.patch('/:id/toggle-status', toggleStaffStatus);

export default router;
