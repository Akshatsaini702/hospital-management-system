import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiTag, FiUser, FiDollarSign, FiFilter, FiCreditCard } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const paymentColors = {
  unpaid: 'bg-red-50 text-red-600',
  paid: 'bg-emerald-50 text-emerald-600',
  refunded: 'bg-slate-100 text-slate-600',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/bookings/my');
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">{bookings.length} total bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <FiFilter size={14} className="text-slate-400" />
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FiCalendar className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 mb-4">No bookings found</p>
          <div className="flex gap-3 justify-center">
            <Link to="/browse-services" className="btn btn-primary text-sm">Book a Service</Link>
            <Link to="/browse-doctors" className="btn btn-secondary text-sm">Book Consultation</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(booking => (
            <div key={booking._id} className="card p-4 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  booking.type === 'service' ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  {booking.type === 'service'
                    ? <FiTag className="text-purple-600" size={20} />
                    : <FiUser className="text-blue-600" size={20} />
                  }
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800">
                      {booking.type === 'service' ? booking.service?.name : booking.doctor?.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${paymentColors[booking.paymentStatus]}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FiCalendar size={11} />
                      {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock size={11} />
                      {booking.timeSlot}
                    </span>
                    <span className="capitalize text-slate-400">{booking.type}</span>
                    {booking.doctor?.specialization && (
                      <span className="text-slate-400">{booking.doctor.specialization}</span>
                    )}
                  </div>
                </div>

                {/* Price and action */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-lg font-bold text-slate-800">₹{booking.amount}</span>
                  {booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled' && (
                    <Link to={`/payment/${booking._id}`} className="btn btn-primary text-xs py-2 px-3">
                      <FiCreditCard size={12} /> Pay Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
