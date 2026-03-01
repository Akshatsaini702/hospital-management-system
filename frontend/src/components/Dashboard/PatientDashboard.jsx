import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar, FiClock, FiTag, FiUser, FiCheckCircle,
  FiAlertCircle, FiDollarSign, FiArrowRight, FiActivity,
  FiPlus, FiTrendingUp
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/bookings/stats/overview');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: FiCalendar, bg: 'bg-blue-50', color: 'text-blue-600' },
    { title: 'Confirmed', value: stats?.confirmed || 0, icon: FiCheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { title: 'Pending', value: stats?.pending || 0, icon: FiClock, bg: 'bg-amber-50', color: 'text-amber-600' },
    { title: 'Completed', value: stats?.completed || 0, icon: FiTrendingUp, bg: 'bg-violet-50', color: 'text-violet-600' },
    { title: "Today's Appointments", value: stats?.todayBookings || 0, icon: FiActivity, bg: 'bg-rose-50', color: 'text-rose-600' },
    { title: 'Total Spent', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, bg: 'bg-teal-50', color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-blue-200 mt-1 text-sm">Manage your health appointments and bookings from one place.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/browse-services" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors">
              <FiTag size={14} /> Book a Service
            </Link>
            <Link to="/browse-doctors" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors">
              <FiUser size={14} /> Consult a Doctor
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className="card p-4">
            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
              <card.icon className={card.color} size={18} />
            </div>
            <p className="text-xl font-bold text-slate-800">{card.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/browse-services" className="card p-5 group hover:shadow-md transition-all hover:border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <FiTag className="text-purple-600" size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">Medical Services</h3>
              <p className="text-xs text-slate-500 mt-0.5">Blood tests, X-ray, ECG & more</p>
            </div>
            <FiArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
          </div>
        </Link>

        <Link to="/browse-doctors" className="card p-5 group hover:shadow-md transition-all hover:border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <FiUser className="text-blue-600" size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">Doctor Consultation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Book with top specialists</p>
            </div>
            <FiArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
          </div>
        </Link>

        <Link to="/my-bookings" className="card p-5 group hover:shadow-md transition-all hover:border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                <FiCalendar className="text-emerald-600" size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">My Bookings</h3>
              <p className="text-xs text-slate-500 mt-0.5">View all your appointments</p>
            </div>
            <FiArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
          </div>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800">Upcoming Appointments</h3>
            <p className="text-xs text-slate-400 mt-0.5">Next 7 days</p>
          </div>
          <Link to="/my-bookings" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All <FiArrowRight size={12} />
          </Link>
        </div>

        {stats?.upcomingBookings?.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {stats.upcomingBookings.map(booking => (
              <div key={booking._id} className="flex items-center gap-4 p-4 hover:bg-blue-50/30 transition-colors">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  booking.type === 'service' ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  {booking.type === 'service'
                    ? <FiTag className="text-purple-600" size={18} />
                    : <FiUser className="text-blue-600" size={18} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 text-sm truncate">
                    {booking.type === 'service' ? booking.service?.name : booking.doctor?.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <FiCalendar size={10} />
                      {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock size={10} />
                      {booking.timeSlot}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColors[booking.status]}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FiCalendar className="mx-auto text-slate-300 mb-2" size={36} />
            <p className="text-slate-400 text-sm">No upcoming appointments</p>
            <Link to="/browse-services" className="text-sm text-blue-600 font-medium mt-2 inline-block">
              Book an appointment →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
