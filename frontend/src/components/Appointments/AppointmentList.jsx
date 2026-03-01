import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiFilter, FiClock,
  FiCalendar, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await API.get('/appointments', { params });
      setAppointments(data.appointments);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await API.delete(`/appointments/${id}`);
      toast.success('Appointment deleted');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to delete appointment');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.put(`/appointments/${id}`, { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      Scheduled: 'badge-blue',
      Completed: 'badge-green',
      Cancelled: 'badge-red',
      'No Show': 'badge-yellow',
    };
    return map[status] || 'badge-gray';
  };

  const getTypeBadge = (type) => {
    const map = {
      Consultation: 'bg-blue-50 text-blue-700',
      'Follow-up': 'bg-violet-50 text-violet-700',
      Emergency: 'bg-red-50 text-red-700',
      Surgery: 'bg-orange-50 text-orange-700',
      'Lab Test': 'bg-teal-50 text-teal-700',
    };
    return map[type] || 'bg-slate-50 text-slate-700';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-500">
            {total} appointment{total !== 1 ? 's' : ''} total
          </h3>
        </div>
        <Link to="/appointments/new" className="btn btn-primary">
          <FiPlus size={18} />
          New Appointment
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !statusFilter ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {['Scheduled', 'Completed', 'Cancelled', 'No Show'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card p-12 text-center">
          <FiCalendar className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-lg font-medium text-slate-700">No appointments found</h3>
          <p className="text-slate-400 text-sm mt-1">
            {statusFilter ? 'Try adjusting your filter' : 'Schedule your first appointment'}
          </p>
          {!statusFilter && (
            <Link to="/appointments/new" className="btn btn-primary mt-4 inline-flex">
              <FiPlus size={16} /> Schedule Appointment
            </Link>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Fee</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt._id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">
                        {apt.patient?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">{apt.patient?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-400">
                          {apt.patient?.age}y, {apt.patient?.gender}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm font-medium text-slate-700">{apt.doctor?.name || 'N/A'}</p>
                    <p className="text-xs text-slate-400">{apt.doctor?.specialization}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <FiClock size={13} className="text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-700">
                          {new Date(apt.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-slate-400">{apt.time}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getTypeBadge(apt.type)}`}>
                      {apt.type}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm font-medium text-slate-700">
                      ₹{apt.fee || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      {apt.status === 'Scheduled' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'Completed')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Mark Completed"
                          >
                            <FiCheckCircle size={15} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'Cancelled')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Cancel"
                          >
                            <FiXCircle size={15} />
                          </button>
                        </>
                      )}
                      <Link
                        to={`/appointments/edit/${apt._id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(apt._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
