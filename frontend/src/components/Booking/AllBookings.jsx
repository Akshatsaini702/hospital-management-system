import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { FiCalendar, FiUser, FiClock, FiDollarSign, FiFilter, FiSearch } from 'react-icons/fi';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/bookings');
      // API returns { bookings: [...], total, totalPages, currentPage }
      setBookings(res.data.bookings || res.data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/bookings/${id}`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error('Failed to update booking');
    }
  };

  const sendReminders = async () => {
    try {
      const res = await axios.post('/bookings/send-reminders');
      toast.success(res.data.message || 'Reminders sent!');
    } catch (err) {
      toast.error('Failed to send reminders');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const paymentColors = {
    unpaid: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700',
    refunded: 'bg-gray-100 text-gray-700',
  };

  const filtered = bookings.filter((b) => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch =
      !search ||
      (b.patientName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.patientEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.service?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.doctor?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Bookings</h1>
          <p className="text-slate-500 mt-1">Manage all service & consultation bookings</p>
        </div>
        <button
          onClick={sendReminders}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          📧 Send Reminders
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient, service, or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-800">{bookings.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{bookings.filter((b) => b.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600">{bookings.filter((b) => b.status === 'confirmed').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{bookings.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + (b.amount || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <FiCalendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No bookings found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Service / Doctor</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date & Time</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Payment</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{booking.patientName || 'N/A'}</div>
                      <div className="text-xs text-slate-400">{booking.patientEmail || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        booking.type === 'service' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {booking.type === 'service' ? '🔬 Service' : '👨‍⚕️ Consultation'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">
                        {booking.type === 'service' ? booking.service?.name : booking.doctor?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">
                        {new Date(booking.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-slate-400">{booking.timeSlot}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">₹{booking.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${paymentColors[booking.paymentStatus]}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(booking._id, 'confirmed')}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateStatus(booking._id, 'cancelled')}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(booking._id, 'completed')}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBookings;
