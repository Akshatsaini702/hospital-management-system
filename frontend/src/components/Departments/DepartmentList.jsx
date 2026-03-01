import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiLayers, FiUser } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, [search]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      const { data } = await API.get('/departments', { params });
      setDepartments(data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" department?`)) return;
    try {
      await API.delete(`/departments/${id}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-500">
            {departments.length} department{departments.length !== 1 ? 's' : ''} in the system
          </h3>
        </div>
        <Link to="/departments/new" className="btn btn-primary">
          <FiPlus size={18} />
          Add Department
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="form-input pl-9 text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent"></div>
        </div>
      ) : departments.length === 0 ? (
        <div className="card p-12 text-center">
          <FiLayers className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-lg font-medium text-slate-700">No departments found</h3>
          <p className="text-slate-400 text-sm mt-1">
            {search ? 'Try a different search term' : 'Start by creating your first department'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="card p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 ${
                dept.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
              } opacity-5 rounded-bl-full`} />

              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{dept.icon || '🏥'}</span>
                <span className={`badge ${dept.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>
                  {dept.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-slate-800 mb-1">{dept.name}</h3>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                {dept.description || 'No description'}
              </p>

              {dept.headDoctor && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <FiUser size={14} className="text-slate-400" />
                  <span>Head: {dept.headDoctor}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-100">
                <Link
                  to={`/departments/edit/${dept._id}`}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <FiEdit2 size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(dept._id, dept.name)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
