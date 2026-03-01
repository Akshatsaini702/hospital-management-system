const express = require('express');
const Department = require('../models/Department');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/departments - Get all departments
router.get('/', protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (status) query.status = status;

    const departments = await Department.find(query).sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/departments/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/departments - Create department
router.post('/', protect, async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json(department);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Department with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/departments/:id - Update department
router.put('/:id', protect, async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/departments/:id - Delete department
router.delete('/:id', protect, async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json({ message: 'Department removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
