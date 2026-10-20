import express from 'express';
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  submitMissingDocuments,
  confirmCollection
} from '../controllers/requestController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadDocuments } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

// Citizen routes
router.post('/', restrictTo('citizen'), uploadDocuments, createRequest);
router.get('/my', restrictTo('citizen'), getMyRequests);
router.post('/:id/documents', restrictTo('citizen'), uploadDocuments, submitMissingDocuments);

// Staff routes (Admin & Manager)
router.get('/', restrictTo('admin', 'manager'), getAllRequests);
router.patch('/:id/status', restrictTo('admin', 'manager'), updateRequestStatus);
router.post('/:id/confirm-collection', restrictTo('admin', 'manager'), confirmCollection);

// Shared route (Citizens can access their own, Staff can access any)
router.get('/:id', getRequestById);

export default router;
