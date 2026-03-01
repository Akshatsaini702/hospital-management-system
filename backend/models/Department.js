const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  headDoctor: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  icon: {
    type: String,
    default: '🏥',
  },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
