import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPhone, FiMail, FiFilter, FiStar, FiLayers, FiUserPlus } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDoctors();
  }, [search, statusFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await API.get('/doctors', { params });
      setDoctors(data.doctors);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await API.delete(`/doctors/${id}`);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to delete doctor');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      Available: 'badge-green',
      'On Leave': 'badge-yellow',
      Busy: 'badge-red',
    };
    return map[status] || 'badge-gray';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-500">
            {total} doctor{total !== 1 ? 's' : ''} in the system
          </h3>
        </div>
        <Link to="/doctors/new" className="btn btn-primary">
          <FiPlus size={18} />
          Add Doctor
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctors by name, specialization, or email..."
              className="form-input pl-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select w-auto text-sm"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="On Leave">On Leave</option>
              <option value="Busy">Busy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent"></div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="card p-12 text-center">
          <FiUserPlus className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-lg font-medium text-slate-700">No doctors found</h3>
          <p className="text-slate-400 text-sm mt-1">
            {search || statusFilter ? 'Try adjusting your filters' : 'Start by adding your first doctor'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="card p-5 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-200">
                    {doctor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{doctor.name}</h3>
                    <p className="text-xs text-blue-600 font-medium">{doctor.specialization}</p>
                  </div>
                </div>
                <span className={`badge ${getStatusBadge(doctor.status)}`}>{doctor.status}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiLayers className="text-slate-400" size={14} />
                  <span>{doctor.department?.name || 'No Department'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiStar className="text-amber-400" size={14} />
                  <span>{doctor.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiPhone className="text-slate-400" size={14} />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiMail className="text-slate-400" size={14} />
                  <span className="truncate">{doctor.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Consultation Fee</p>
                  <p className="text-lg font-bold text-slate-800">₹{doctor.consultationFee}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/doctors/edit/${doctor._id}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <FiEdit2 size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(doctor._id, doctor.name)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
