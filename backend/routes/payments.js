const express = require('express');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/payments
router.get('/', protect, async (req, res) => {
  try {
    const { status, patient, method, page = 1, limit = 50 } = req.query;
    let query = {};

    if (status) query.paymentStatus = status;
    if (patient) query.patient = patient;
    if (method) query.paymentMethod = method;

    const payments = await Payment.find(query)
      .populate('patient', 'name phone email')
      .populate('appointment')
      .populate('items.service', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    // Aggregate totals
    const aggregated = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paidAmount' },
          totalPending: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, '$totalAmount', 0],
            },
          },
          totalBilled: { $sum: '$totalAmount' },
        },
      },
    ]);

    res.json({
      payments,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      summary: aggregated[0] || { totalRevenue: 0, totalPending: 0, totalBilled: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/payments/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('patient', 'name phone email age gender')
      .populate({
        path: 'appointment',
        populate: [
          { path: 'doctor', select: 'name specialization' },
          { path: 'patient', select: 'name' },
        ],
      })
      .populate('items.service', 'name price');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments
router.post('/', protect, async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    const populated = await payment.populate([
      { path: 'patient', select: 'name phone email' },
      { path: 'appointment' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/payments/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'name phone email')
      .populate('appointment');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/:id/pay — record a payment
router.post('/:id/pay', protect, async (req, res) => {
  try {
    const { amount, method, transactionId } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.paidAmount = (payment.paidAmount || 0) + Number(amount);
    if (method) payment.paymentMethod = method;
    if (transactionId) payment.transactionId = transactionId;

    if (payment.paidAmount >= payment.totalAmount) {
      payment.paymentStatus = 'Paid';
      payment.paidAt = new Date();
    } else if (payment.paidAmount > 0) {
      payment.paymentStatus = 'Partial';
    }

    await payment.save();
    const populated = await payment.populate([
      { path: 'patient', select: 'name phone email' },
      { path: 'appointment' },
    ]);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/payments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
