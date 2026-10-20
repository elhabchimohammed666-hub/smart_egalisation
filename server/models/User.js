import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'L\'adresse email est obligatoire'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Format d\'email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['citizen', 'manager', 'admin'],
    default: 'citizen',
    required: true
  },
  fullName: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true,
    default: 'Direction Générale'
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  citizenProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CitizenProfile'
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Password hash hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
