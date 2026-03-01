const express = require('express');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/appointments - Get all appointments
router.get('/', protect, async (req, res) => {
  try {
    const { status, doctor, patient, date, page = 1, limit = 50 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (doctor) query.doctor = doctor;
    if (patient) query.patient = patient;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name phone age gender')
      .populate({
        path: 'doctor',
        select: 'name specialization phone',
        populate: { path: 'department', select: 'name' },
      })
      .sort({ date: -1, time: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/appointments/:id - Get single appointment
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'department', select: 'name' },
      });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/appointments - Create appointment
router.post('/', protect, async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    const populated = await appointment.populate([
      { path: 'patient', select: 'name phone age gender' },
      { path: 'doctor', select: 'name specialization phone', populate: { path: 'department', select: 'name' } },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/appointments/:id - Update appointment
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'name phone age gender')
      .populate({
        path: 'doctor',
        select: 'name specialization phone',
        populate: { path: 'department', select: 'name' },
      });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
