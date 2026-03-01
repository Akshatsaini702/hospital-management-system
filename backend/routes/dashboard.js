const express = require('express');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalDepartments = await Department.countDocuments({ status: 'Active' });
    const totalAppointments = await Appointment.countDocuments();

    // Today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow },
    });

    const scheduledAppointments = await Appointment.countDocuments({ status: 'Scheduled' });
    const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'Cancelled' });

    // Active patients
    const activePatients = await Patient.countDocuments({ status: 'Active' });
    const criticalPatients = await Patient.countDocuments({ status: 'Critical' });

    // Available doctors
    const availableDoctors = await Doctor.countDocuments({ status: 'Available' });

    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name phone age gender')
      .populate({
        path: 'doctor',
        select: 'name specialization',
        populate: { path: 'department', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent patients
    const recentPatients = await Patient.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly appointment trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Appointment.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Department-wise doctor count
    const departmentStats = await Doctor.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: '$department' },
      {
        $project: {
          name: '$department.name',
          count: 1,
        },
      },
    ]);

    // Revenue stats
    const totalRevenue = await Appointment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$fee' } } },
    ]);

    // Service & Payment stats
    const totalServices = await Service.countDocuments({ status: 'Active' });
    const paymentSummary = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$totalAmount' },
          totalCollected: { $sum: '$paidAmount' },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalAppointments,
      todayAppointments,
      scheduledAppointments,
      completedAppointments,
      cancelledAppointments,
      activePatients,
      criticalPatients,
      availableDoctors,
      recentAppointments,
      recentPatients,
      monthlyTrend,
      departmentStats,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalServices,
      paymentSummary: paymentSummary[0] || { totalBilled: 0, totalCollected: 0, pendingPayments: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
