import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiDollarSign, FiArrowRight, FiSearch, FiTag } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const categoryColors = {
  'Lab Test': 'bg-purple-100 text-purple-700',
  'Procedure': 'bg-blue-100 text-blue-700',
  'Imaging': 'bg-cyan-100 text-cyan-700',
  'Consultation': 'bg-emerald-100 text-emerald-700',
  'Surgery': 'bg-red-100 text-red-700',
  'Therapy': 'bg-amber-100 text-amber-700',
  'Other': 'bg-slate-100 text-slate-700',
};

export default function ServiceCatalog() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await API.get('/bookings/services-catalog');
      setServices(data);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Services</h1>
          <p className="text-slate-500 text-sm mt-1">Browse and book our healthcare services</p>
        </div>
        <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 py-2 gap-2 w-full sm:w-72">
          <FiSearch className="text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm bg-transparent outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FiTag className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500">No services found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(service => (
            <div
              key={service._id}
              className="card overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(`/book-service/${service._id}`)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    {service.icon || '💊'}
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${categoryColors[service.category] || categoryColors.Other}`}>
                    {service.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-lg font-bold text-slate-800">₹{service.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                    {service.name}
                  </h3>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                  {service.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <FiClock size={12} />
                      {service.duration} min
                    </span>
                    {service.department?.name && (
                      <span className="flex items-center gap-1">
                        {service.department.name}
                      </span>
                    )}
                  </div>
                  <button className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    Book Now <FiArrowRight size={14} />
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
