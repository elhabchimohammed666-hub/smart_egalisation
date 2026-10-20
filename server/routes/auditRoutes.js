import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Only Admin can view audit records
router.get('/', protect, restrictTo('admin'), getAuditLogs);

export default router;
