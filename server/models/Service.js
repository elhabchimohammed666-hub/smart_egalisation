import mongoose from 'mongoose';

const requiredDocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isRequired: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du service est obligatoire'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    default: 'État Civil & Citoyenneté'
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire']
  },
  requiredDocuments: [requiredDocumentSchema],
  instructions: {
    type: String,
    default: 'Veuillez préparer les pièces requises scannées au format PDF, JPG ou PNG avant de soumettre votre demande.'
  },
  processingTimeDays: {
    type: Number,
    default: 2,
    min: 1
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('Service', serviceSchema);
