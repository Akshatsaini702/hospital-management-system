import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiStar, FiDollarSign, FiArrowRight, FiMapPin, FiAward } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const statusColors = {
  Available: 'bg-emerald-100 text-emerald-700',
  Busy: 'bg-amber-100 text-amber-700',
  'On Leave': 'bg-red-100 text-red-700',
};

const avatarGradients = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
];

export default function DoctorCatalog() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await API.get('/bookings/doctors-catalog');
      setDoctors(data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    d.department?.name?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-slate-800">Our Doctors</h1>
          <p className="text-slate-500 text-sm mt-1">Book a consultation with our experienced specialists</p>
        </div>
        <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 py-2 gap-2 w-full sm:w-72">
          <FiSearch className="text-slate-400" size={16} />
          <input
            type="text" placeholder="Search by name, specialization..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full text-sm bg-transparent outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FiStar className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doctor, i) => (
            <div
              key={doctor._id}
              className="card p-5 group cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => doctor.status === 'Available' && navigate(`/book-doctor/${doctor._id}`)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0`}>
                  {doctor.name?.charAt(0) || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                    {doctor.name}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
                  {doctor.department?.name && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <FiMapPin size={10} /> {doctor.department.name}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[doctor.status] || 'bg-slate-100 text-slate-600'}`}>
                  {doctor.status}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <FiAward size={12} className="text-amber-500" />
                    {doctor.experience}y exp
                  </span>
                  <span className="flex items-center gap-1">
                    {doctor.qualification?.split(',')[0]}
                  </span>
                </div>
                <p className="text-lg font-bold text-emerald-600">₹{doctor.consultationFee}</p>
              </div>

              {doctor.availability?.days?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                    const fullDay = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }[day];
                    const isAvailable = doctor.availability.days.includes(fullDay);
                    return (
                      <span key={day} className={`text-[10px] px-1.5 py-0.5 rounded ${isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                        {day}
                      </span>
                    );
                  })}
                </div>
              )}

              {doctor.status === 'Available' && (
                <button className="mt-4 w-full btn btn-primary text-xs py-2">
                  Book Consultation <FiArrowRight size={14} />
                </button>
              )}
              {doctor.status !== 'Available' && (
                <p className="mt-4 text-center text-xs text-slate-400 py-2">Currently Unavailable</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
