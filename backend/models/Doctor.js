const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required'],
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
  },
  experience: {
    type: Number,
    default: 0,
  },
  consultationFee: {
    type: Number,
    default: 500,
  },
  availability: {
    days: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    startTime: {
      type: String,
      default: '09:00',
    },
    endTime: {
      type: String,
      default: '17:00',
    },
  },
  status: {
    type: String,
    enum: ['Available', 'On Leave', 'Busy'],
    default: 'Available',
  },
  image: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
