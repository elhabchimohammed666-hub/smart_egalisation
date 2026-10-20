import mongoose from 'mongoose';

const statusHistoryEntrySchema = new mongoose.Schema({
  previousStatus: {
    type: String,
    required: true
  },
  newStatus: {
    type: String,
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  changedByName: {
    type: String,
    default: 'Système'
  },
  changedByRole: {
    type: String,
    enum: ['citizen', 'manager', 'admin', 'system'],
    default: 'system'
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  internalStaffNote: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: true });

const uploadedDocSchema = new mongoose.Schema({
  documentName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String
  },
  fileSize: {
    type: Number
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'requested', 'replaced'],
    default: 'submitted'
  },
  notes: String
}, { _id: true });

const requestSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  status: {
    type: String,
    enum: [
      'Draft',
      'Submitted',
      'Under Review',
      'Action Required',
      'Approved',
      'Ready for Collection',
      'Issued',
      'Rejected',
      'Cancelled'
    ],
    default: 'Draft',
    index: true
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  documents: [uploadedDocSchema],
  actionRequiredReason: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  collectionToken: {
    type: String,
    default: ''
  },
  statusHistory: [statusHistoryEntrySchema],
  submissionDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  estimatedCompletionDate: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Request', requestSchema);
