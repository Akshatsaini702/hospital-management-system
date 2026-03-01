const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['service', 'consultation'],
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Credit Card', 'Debit Card', ''],
    default: '',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  transactionId: {
    type: String,
    default: '',
  },
  cardLast4: {
    type: String,
    default: '',
  },
  patientName: {
    type: String,
    default: '',
  },
  patientPhone: {
    type: String,
    default: '',
  },
  patientEmail: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Index for efficient slot queries
bookingSchema.index({ date: 1, type: 1, service: 1, status: 1 });
bookingSchema.index({ date: 1, type: 1, doctor: 1, status: 1 });
bookingSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
