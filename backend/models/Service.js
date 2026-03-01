const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  duration: {
    type: Number,
    default: 30,
    min: 5,
  },
  category: {
    type: String,
    enum: ['Consultation', 'Procedure', 'Lab Test', 'Imaging', 'Surgery', 'Therapy', 'Other'],
    default: 'Consultation',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  icon: {
    type: String,
    default: '💊',
  },
  image: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
