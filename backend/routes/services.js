const express = require('express');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/services
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, status, doctor, department } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;
    if (doctor) query.doctor = doctor;
    if (department) query.department = department;

    const services = await Service.find(query)
      .populate('department', 'name')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/services/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('department', 'name')
      .populate('doctor', 'name specialization');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/services
router.post('/', protect, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    const populated = await service.populate([
      { path: 'department', select: 'name' },
      { path: 'doctor', select: 'name specialization' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/services/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('department', 'name')
      .populate('doctor', 'name specialization');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/services/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
