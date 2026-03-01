const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/mailer');

const router = express.Router();

// All time slots (30-min intervals, skip lunch 13:00-14:00)
const ALL_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM',
];

// GET /api/bookings/services-catalog — public list of active services (patients)
router.get('/services-catalog', protect, async (req, res) => {
  try {
    const services = await Service.find({ status: 'Active' })
      .populate('department', 'name')
      .sort({ name: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings/doctors-catalog — list available doctors
router.get('/doctors-catalog', protect, async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: { $ne: 'On Leave' } })
      .populate('department', 'name')
      .sort({ name: 1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings/slots?date=YYYY-MM-DD&type=service|consultation&targetId=xxx
router.get('/slots', protect, async (req, res) => {
  try {
    const { date, type, targetId } = req.query;
    if (!date || !type || !targetId) {
      return res.status(400).json({ message: 'date, type, and targetId are required' });
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Check if the date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dayStart < today) {
      return res.json(ALL_SLOTS.map(s => ({ time: s, available: false })));
    }

    // If consultation, check doctor's available days
    if (type === 'consultation') {
      const doctor = await Doctor.findById(targetId);
      if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

      const dayName = dayStart.toLocaleDateString('en-US', { weekday: 'long' });
      if (!doctor.availability?.days?.includes(dayName)) {
        return res.json(ALL_SLOTS.map(s => ({ time: s, available: false })));
      }
    }

    const query = {
      date: { $gte: dayStart, $lte: dayEnd },
      type,
      status: { $nin: ['cancelled'] },
    };
    if (type === 'service') query.service = targetId;
    else query.doctor = targetId;

    const booked = await Booking.find(query).select('timeSlot');
    const bookedSlots = new Set(booked.map(b => b.timeSlot));

    // If today, mark past time slots as unavailable
    const now = new Date();
    const isToday = dayStart.toDateString() === now.toDateString();

    const slots = ALL_SLOTS.map(slot => {
      let available = !bookedSlots.has(slot);

      if (isToday && available) {
        const [time, period] = slot.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        const slotTime = new Date(now);
        slotTime.setHours(h, m, 0, 0);
        if (slotTime <= now) available = false;
      }

      return { time: slot, available };
    });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/bookings — create a new booking
router.post('/', protect, async (req, res) => {
  try {
    const { type, serviceId, doctorId, date, timeSlot, patientName, patientPhone, patientEmail, notes } = req.body;

    if (!type || !date || !timeSlot) {
      return res.status(400).json({ message: 'type, date, and timeSlot are required' });
    }

    let amount = 0;
    let serviceRef = null;
    let doctorRef = null;

    if (type === 'service') {
      if (!serviceId) return res.status(400).json({ message: 'serviceId is required for service booking' });
      const service = await Service.findById(serviceId);
      if (!service) return res.status(404).json({ message: 'Service not found' });
      amount = service.price;
      serviceRef = service._id;
    } else if (type === 'consultation') {
      if (!doctorId) return res.status(400).json({ message: 'doctorId is required for consultation booking' });
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
      amount = doctor.consultationFee;
      doctorRef = doctor._id;
    }

    // Check if slot is already booked
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existingQuery = {
      date: { $gte: dayStart, $lte: dayEnd },
      timeSlot,
      type,
      status: { $nin: ['cancelled'] },
    };
    if (type === 'service') existingQuery.service = serviceRef;
    else existingQuery.doctor = doctorRef;

    const existing = await Booking.findOne(existingQuery);
    if (existing) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      type,
      service: serviceRef,
      doctor: doctorRef,
      date: dayStart,
      timeSlot,
      amount,
      patientName: patientName || req.user.name,
      patientPhone: patientPhone || req.user.phone || '',
      patientEmail: patientEmail || req.user.email,
      notes: notes || '',
    });

    const populated = await booking.populate([
      { path: 'service', select: 'name price image category' },
      { path: 'doctor', select: 'name specialization consultationFee image', populate: { path: 'department', select: 'name' } },
      { path: 'user', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/bookings/:id/pay — process payment for a booking
router.post('/:id/pay', protect, async (req, res) => {
  try {
    const { paymentMethod, upiId, cardNumber, cardExpiry, cardCvv, cardName } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    // Simulate payment processing
    const txnId = 'TXN' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();

    booking.paymentMethod = paymentMethod;
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.transactionId = txnId;

    if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
      booking.cardLast4 = cardNumber ? cardNumber.slice(-4) : '';
    }

    await booking.save();

    // Send confirmation email
    const emailTo = booking.patientEmail || req.user.email;
    if (emailTo) {
      const dateStr = new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      await sendEmail({
        to: emailTo,
        subject: 'Booking Confirmed - Mediflix+',
        text: `Hi ${booking.patientName}, your booking on ${dateStr} at ${booking.timeSlot} is confirmed. Transaction ID: ${txnId}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
            <h2 style="color:#2563eb;">Booking Confirmed! ✅</h2>
            <p>Hi <strong>${booking.patientName}</strong>,</p>
            <p>Your ${booking.type === 'service' ? 'service' : 'doctor consultation'} booking has been confirmed.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;">Date</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600;">${dateStr}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;">Time</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600;">${booking.timeSlot}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;">Amount Paid</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600;">₹${booking.amount}</td></tr>
              <tr><td style="padding:8px;color:#64748b;">Transaction ID</td><td style="padding:8px;font-weight:600;">${txnId}</td></tr>
            </table>
            <p style="color:#64748b;font-size:13px;">Thank you for choosing Mediflix+!</p>
          </div>
        `,
      });
    }

    const populated = await booking.populate([
      { path: 'service', select: 'name price image category' },
      { path: 'doctor', select: 'name specialization consultationFee image', populate: { path: 'department', select: 'name' } },
      { path: 'user', select: 'name email' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings/my — patient's own bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('service', 'name price image category')
      .populate({ path: 'doctor', select: 'name specialization consultationFee image', populate: { path: 'department', select: 'name' } })
      .sort({ date: -1, createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings — all bookings (admin/receptionist)
router.get('/', protect, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    // If patient role, only show own bookings
    if (req.user.role === 'patient') {
      query.user = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'name price image category')
      .populate({ path: 'doctor', select: 'name specialization consultationFee image', populate: { path: 'department', select: 'name' } })
      .populate('user', 'name email role')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);
    res.json({ bookings, total, totalPages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings/:id — single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'name price image category description')
      .populate({ path: 'doctor', select: 'name specialization consultationFee image qualification', populate: { path: 'department', select: 'name' } })
      .populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/bookings/:id — update booking status (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('service', 'name price image category')
      .populate({ path: 'doctor', select: 'name specialization consultationFee image', populate: { path: 'department', select: 'name' } })
      .populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/bookings/send-reminders — send email reminders for upcoming bookings
router.post('/send-reminders', protect, async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const upcoming = await Booking.find({
      date: { $gte: tomorrow, $lt: dayAfter },
      status: 'confirmed',
      reminderSent: false,
    }).populate('service', 'name').populate('doctor', 'name specialization');

    let sent = 0;
    for (const booking of upcoming) {
      const email = booking.patientEmail;
      if (!email) continue;

      const dateStr = new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      const what = booking.type === 'service'
        ? booking.service?.name || 'Service'
        : `Consultation with ${booking.doctor?.name || 'Doctor'}`;

      await sendEmail({
        to: email,
        subject: 'Appointment Reminder - Mediflix+',
        text: `Hi ${booking.patientName}, reminder: your ${what} is tomorrow (${dateStr}) at ${booking.timeSlot}. Please arrive 10 minutes early.`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
            <h2 style="color:#2563eb;">Appointment Reminder ⏰</h2>
            <p>Hi <strong>${booking.patientName}</strong>,</p>
            <p>This is a friendly reminder that your appointment is <strong>tomorrow</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;">Appointment</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600;">${what}</td></tr>
              <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;">Date</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-weight:600;">${dateStr}</td></tr>
              <tr><td style="padding:8px;color:#64748b;">Time</td><td style="padding:8px;font-weight:600;">${booking.timeSlot}</td></tr>
            </table>
            <p style="color:#64748b;font-size:13px;">Please arrive 10 minutes before your scheduled time. Thank you for choosing Mediflix+!</p>
          </div>
        `,
      });

      booking.reminderSent = true;
      await booking.save();
      sent++;
    }

    res.json({ message: `Reminders sent to ${sent} patient(s)`, sent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings/stats/overview — dashboard stats for bookings
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const query = req.user.role === 'patient' ? { user: req.user._id } : {};

    const totalBookings = await Booking.countDocuments(query);
    const confirmed = await Booking.countDocuments({ ...query, status: 'confirmed' });
    const pending = await Booking.countDocuments({ ...query, status: 'pending' });
    const completed = await Booking.countDocuments({ ...query, status: 'completed' });
    const cancelled = await Booking.countDocuments({ ...query, status: 'cancelled' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      ...query,
      date: { $gte: today, $lt: tomorrow },
      status: { $nin: ['cancelled'] },
    });

    // Upcoming bookings (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingBookings = await Booking.find({
      ...query,
      date: { $gte: today, $lt: nextWeek },
      status: { $in: ['confirmed', 'pending'] },
    })
      .populate('service', 'name image')
      .populate('doctor', 'name specialization image')
      .sort({ date: 1, timeSlot: 1 })
      .limit(10);

    const revenueAgg = await Booking.aggregate([
      { $match: { ...query, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      totalBookings,
      confirmed,
      pending,
      completed,
      cancelled,
      todayBookings,
      upcomingBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
