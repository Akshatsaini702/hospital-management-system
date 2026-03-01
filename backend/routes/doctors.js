const express = require('express');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/doctors - Get all doctors
router.get('/', protect, async (req, res) => {
  try {
    const { search, status, department, page = 1, limit = 50 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (department) query.department = department;

    const doctors = await Doctor.find(query)
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Doctor.countDocuments(query);

    res.json({
      doctors,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/doctors/:id - Get single doctor
router.get('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('department', 'name');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/doctors - Create doctor
router.post('/', protect, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    const populated = await doctor.populate('department', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/doctors/:id - Update doctor
router.put('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('department', 'name');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/doctors/:id - Delete doctor
router.delete('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
