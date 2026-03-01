import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPhone, FiMail, FiFilter } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPatients();
  }, [search, statusFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await API.get('/patients', { params });
      setPatients(data.patients);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete patient "${name}"?`)) return;
    try {
      await API.delete(`/patients/${id}`);
      toast.success('Patient deleted successfully');
      fetchPatients();
    } catch (error) {
      toast.error('Failed to delete patient');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      Active: 'badge-green',
      Discharged: 'badge-gray',
      Critical: 'badge-red',
    };
    return map[status] || 'badge-gray';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-500">
            {total} patient{total !== 1 ? 's' : ''} registered
          </h3>
        </div>
        <Link to="/patients/new" className="btn btn-primary">
          <FiPlus size={18} />
          Add Patient
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
              placeholder="Search patients by name, phone, or email..."
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
              <option value="Active">Active</option>
              <option value="Critical">Critical</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent"></div>
        </div>
      ) : patients.length === 0 ? (
        <div className="card p-12 text-center">
          <FiUsers className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-lg font-medium text-slate-700">No patients found</h3>
          <p className="text-slate-400 text-sm mt-1">
            {search || statusFilter ? 'Try adjusting your filters' : 'Start by adding your first patient'}
          </p>
          {!search && !statusFilter && (
            <Link to="/patients/new" className="btn btn-primary mt-4 inline-flex">
              <FiPlus size={16} /> Add First Patient
            </Link>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact</th>
                <th>Age / Gender</th>
                <th>Blood Group</th>
                <th>Status</th>
                <th>Registered</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{patient.name}</p>
                        {patient.address && (
                          <p className="text-xs text-slate-400 max-w-[200px] truncate">{patient.address}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <FiPhone size={12} className="text-slate-400" />
                        {patient.phone}
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <FiMail size={11} />
                          {patient.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-slate-700">{patient.age} yrs</span>
                    <span className="text-slate-400 mx-1">•</span>
                    <span className="text-sm text-slate-500">{patient.gender}</span>
                  </td>
                  <td>
                    <span className="text-sm font-medium text-slate-700">
                      {patient.bloodGroup || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-slate-500">
                      {new Date(patient.registeredDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/patients/edit/${patient._id}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(patient._id, patient.name)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
