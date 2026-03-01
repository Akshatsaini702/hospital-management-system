const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
    default: null,
  },
  googleId: {
    type: String,
    default: null,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['admin', 'receptionist', 'doctor', 'patient'],
    default: 'receptionist',
  },
  phone: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  otpCodeHash: {
    type: String,
    default: null,
  },
  otpExpiresAt: {
    type: Date,
    default: null,
  },
  otpPurpose: {
    type: String,
    enum: ['login', 'forgot-password', 'email-change'],
    default: null,
  },
  pendingEmail: {
    type: String,
    default: null,
    lowercase: true,
    trim: true,
  },
  welcomeEmailSentAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
