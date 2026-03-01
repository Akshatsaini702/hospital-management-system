const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required'],
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required'],
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required'],
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required'],
  },
  type: {
    type: String,
    enum: ['Consultation', 'Follow-up', 'Emergency', 'Surgery', 'Lab Test'],
    default: 'Consultation',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
    default: 'Scheduled',
  },
  notes: {
    type: String,
    default: '',
  },
  prescription: {
    type: String,
    default: '',
  },
  fee: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
