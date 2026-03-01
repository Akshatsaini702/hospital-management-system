import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiUserPlus, FiCalendar, FiLayers, FiActivity,
  FiArrowUpRight, FiClock, FiAlertCircle, FiCheckCircle,
  FiTrendingUp, FiDollarSign, FiPlus, FiTag, FiCreditCard
} from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/dashboard/stats');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: FiUsers,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/patients',
      subtitle: `${stats?.activePatients || 0} active`,
    },
    {
      title: 'Total Doctors',
      value: stats?.totalDoctors || 0,
      icon: FiUserPlus,
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      link: '/doctors',
      subtitle: `${stats?.availableDoctors || 0} available`,
    },
    {
      title: "Today's Appointments",
      value: stats?.todayAppointments || 0,
      icon: FiCalendar,
      color: 'violet',
      gradient: 'from-violet-500 to-violet-600',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
      link: '/appointments',
      subtitle: `${stats?.scheduledAppointments || 0} scheduled`,
    },
    {
      title: 'Departments',
      value: stats?.totalDepartments || 0,
      icon: FiLayers,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      link: '/departments',
      subtitle: 'Active departments',
    },
    {
      title: 'Services',
      value: stats?.totalServices || 0,
      icon: FiTag,
      color: 'rose',
      gradient: 'from-rose-500 to-pink-500',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-600',
      link: '/services',
      subtitle: 'Hospital services',
    },
  ];

  const summaryCards = [
    {
      title: 'Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Completed',
      value: stats?.completedAppointments || 0,
      icon: FiCheckCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Cancelled',
      value: stats?.cancelledAppointments || 0,
      icon: FiAlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      title: 'Critical',
      value: stats?.criticalPatients || 0,
      icon: FiActivity,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      title: 'Billed',
      value: `₹${(stats?.paymentSummary?.totalBilled || 0).toLocaleString()}`,
      icon: FiCreditCard,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      title: 'Collected',
      value: `₹${(stats?.paymentSummary?.totalCollected || 0).toLocaleString()}`,
      icon: FiCheckCircle,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
  ];

  const getStatusBadge = (status) => {
    const map = {
      Scheduled: 'badge-blue',
      Completed: 'badge-green',
      Cancelled: 'badge-red',
      'No Show': 'badge-yellow',
    };
    return map[status] || 'badge-gray';
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/patients/new" className="btn btn-primary text-xs py-2 px-3">
          <FiPlus size={14} /> New Patient
        </Link>
        <Link to="/appointments/new" className="btn btn-success text-xs py-2 px-3">
          <FiPlus size={14} /> New Appointment
        </Link>
        <Link to="/doctors/new" className="btn btn-secondary text-xs py-2 px-3">
          <FiPlus size={14} /> New Doctor
        </Link>
        <Link to="/services/new" className="btn btn-secondary text-xs py-2 px-3">
          <FiPlus size={14} /> New Service
        </Link>
        <Link to="/payments/new" className="btn btn-secondary text-xs py-2 px-3">
          <FiPlus size={14} /> New Invoice
        </Link>
      </div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <Link
            key={i}
            to={card.link}
            className="card p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-5 rounded-bl-full`} />
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 ${card.bgLight} rounded-xl flex items-center justify-center`}>
                <card.icon className={card.textColor} size={22} />
              </div>
              <FiArrowUpRight className="text-slate-300 group-hover:text-slate-500 transition-colors" size={18} />
            </div>
            <p className="text-3xl font-bold text-slate-800 tracking-tight">{card.value}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">{card.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.subtitle}</p>
          </Link>
        ))}
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card, i) => (
          <div key={i} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <card.icon className={card.color} size={18} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{card.value}</p>
              <p className="text-xs text-slate-500">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800">Recent Appointments</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest appointment activity</p>
            </div>
            <Link to="/appointments" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <FiArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentAppointments?.slice(0, 7).map((apt) => (
                  <tr key={apt._id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">
                          {apt.patient?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 text-sm">{apt.patient?.name || 'N/A'}</p>
                          <p className="text-xs text-slate-400">{apt.patient?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-slate-700">{apt.doctor?.name || 'N/A'}</p>
                      <p className="text-xs text-slate-400">{apt.doctor?.specialization}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <FiClock size={12} className="text-slate-400" />
                        <span className="text-sm">
                          {new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-xs text-slate-400">{apt.time}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!stats?.recentAppointments || stats.recentAppointments.length === 0) && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No appointments yet
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Patients */}
          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-800">New Patients</h3>
                <p className="text-xs text-slate-400 mt-0.5">Recently registered</p>
              </div>
              <Link to="/patients" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View All <FiArrowUpRight size={12} />
              </Link>
            </div>
            <div className="p-3">
              {stats?.recentPatients?.map((patient) => (
                <div key={patient._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600">
                    {patient.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{patient.name}</p>
                    <p className="text-xs text-slate-400">
                      {patient.age}y, {patient.gender} • {patient.bloodGroup || 'N/A'}
                    </p>
                  </div>
                  <span className={`badge ${
                    patient.status === 'Active' ? 'badge-green' :
                    patient.status === 'Critical' ? 'badge-red' : 'badge-gray'
                  } text-[10px]`}>
                    {patient.status}
                  </span>
                </div>
              ))}
              {(!stats?.recentPatients || stats.recentPatients.length === 0) && (
                <div className="text-center py-6 text-slate-400 text-sm">No patients yet</div>
              )}
            </div>
          </div>

          {/* Department Stats */}
          <div className="card">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Department Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Doctors per department</p>
            </div>
            <div className="p-3">
              {stats?.departmentStats?.map((dept, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-700">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, (dept.count / Math.max(...stats.departmentStats.map(d => d.count))) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500 w-6 text-right">{dept.count}</span>
                  </div>
                </div>
              ))}
              {(!stats?.departmentStats || stats.departmentStats.length === 0) && (
                <div className="text-center py-6 text-slate-400 text-sm">No data yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
