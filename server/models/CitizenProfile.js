import mongoose from 'mongoose';

const citizenProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  cin: {
    type: String,
    required: [true, 'Le numéro de CIN est obligatoire'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  arabicFullName: {
    type: String,
    trim: true,
    default: ''
  },
  dateOfBirth: {
    type: String,
    required: true
  },
  placeOfBirth: {
    type: String,
    trim: true,
    default: 'Maroc'
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    default: 'M'
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  validUntil: {
    type: String,
    required: true
  },
  nationality: {
    type: String,
    default: 'Marocaine'
  },
  cinFrontImage: {
    type: String,
    required: true
  },
  cinBackImage: {
    type: String,
    required: true
  },
  ocrRawData: {
    frontText: String,
    backText: String,
    qualityScore: Number,
    extractedConfidence: Number,
    extractedFields: mongoose.Schema.Types.Mixed,
    processedAt: Date
  },
  validationStatus: {
    type: String,
    enum: ['pending', 'validated', 'rejected'],
    default: 'validated'
  },
  validatedAt: {
    type: Date,
    default: Date.now
  },
  phone: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('CitizenProfile', citizenProfileSchema);
