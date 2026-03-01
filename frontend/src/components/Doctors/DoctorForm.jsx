import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function DoctorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    department: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    status: 'Available',
  });

  useEffect(() => {
    fetchDepartments();
    if (isEdit) fetchDoctor();
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const { data } = await API.get('/departments');
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments');
    }
  };

  const fetchDoctor = async () => {
    try {
      const { data } = await API.get(`/doctors/${id}`);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        specialization: data.specialization || '',
        department: data.department?._id || data.department || '',
        qualification: data.qualification || '',
        experience: data.experience || '',
        consultationFee: data.consultationFee || '',
        status: data.status || 'Available',
      });
    } catch (error) {
      toast.error('Failed to load doctor');
      navigate('/doctors');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.specialization || !formData.department || !formData.qualification) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/doctors/${id}`, formData);
        toast.success('Doctor updated successfully');
      } else {
        await API.post('/doctors', formData);
        toast.success('Doctor added successfully');
      }
      navigate('/doctors');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save doctor');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/doctors')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <FiArrowLeft size={16} /> Back to Doctors
      </button>

      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? 'Edit Doctor' : 'Add New Doctor'}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {isEdit ? 'Update doctor information' : 'Fill in the doctor details below'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="Dr. Full Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="doctor@hospital.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="Phone number" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                  <option value="Available">Available</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Specialization *</label>
                <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="form-input" placeholder="e.g. Cardiologist" />
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select name="department" value={formData.department} onChange={handleChange} className="form-select">
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Qualification *</label>
                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="form-input" placeholder="e.g. MD, DM Cardiology" />
              </div>
              <div className="form-group">
                <label className="form-label">Experience (years)</label>
                <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="form-input" placeholder="Years of experience" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Consultation Fee (₹)</label>
                <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} className="form-input" placeholder="Fee amount" min="0" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <span className="spinner"></span> : <FiSave size={16} />}
              {isEdit ? 'Update Doctor' : 'Add Doctor'}
            </button>
            <button type="button" onClick={() => navigate('/doctors')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
