import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFilter, FiTag, FiClock, FiDollarSign, FiPackage } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchServices();
  }, [search, categoryFilter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const { data } = await API.get('/services', { params });
      setServices(data);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete service "${name}"?`)) return;
    try {
      await API.delete(`/services/${id}`);
      toast.success('Service deleted');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-500">
            {services.length} service{services.length !== 1 ? 's' : ''} available
          </h3>
        </div>
        <Link to="/services/new" className="btn btn-primary">
          <FiPlus size={18} /> Add Service
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="form-input pl-9 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-400" size={16} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-select w-auto text-sm">
              <option value="">All Categories</option>
              <option value="Consultation">Consultation</option>
              <option value="Procedure">Procedure</option>
              <option value="Lab Test">Lab Test</option>
              <option value="Imaging">Imaging</option>
              <option value="Surgery">Surgery</option>
              <option value="Therapy">Therapy</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="card p-12 text-center">
          <FiPackage className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-lg font-medium text-slate-700">No services found</h3>
          <p className="text-slate-400 text-sm mt-1">Add your first hospital service</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div key={svc._id} className="card p-5 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl flex items-center justify-center text-xl">
                    {svc.icon || '💊'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{svc.name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${svc.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {svc.status}
                    </span>
                  </div>
                </div>
              </div>

              {svc.description && (
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{svc.description}</p>
              )}

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiTag className="text-slate-400" size={14} />
                  <span>{svc.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiClock className="text-slate-400" size={14} />
                  <span>{svc.duration} min</span>
                </div>
                {svc.doctor && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FiPackage className="text-slate-400" size={14} />
                    <span>{svc.doctor.name}</span>
                  </div>
                )}
                {svc.department && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FiPackage className="text-slate-400" size={14} />
                    <span>{svc.department.name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <FiDollarSign className="text-emerald-500" size={16} />
                  <span className="text-lg font-bold text-slate-800">₹{svc.price}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Link to={`/services/edit/${svc._id}`} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <FiEdit2 size={16} />
                  </Link>
                  <button onClick={() => handleDelete(svc._id, svc.name)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
