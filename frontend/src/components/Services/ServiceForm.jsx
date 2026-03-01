import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    doctor: '',
    price: '',
    duration: '30',
    category: 'Consultation',
    status: 'Active',
    icon: '💊',
  });

  useEffect(() => {
    fetchDropdowns();
    if (isEdit) fetchService();
  }, [id]);

  const fetchDropdowns = async () => {
    try {
      const [deptRes, docRes] = await Promise.all([
        API.get('/departments'),
        API.get('/doctors'),
      ]);
      setDepartments(deptRes.data);
      setDoctors(docRes.data.doctors || docRes.data);
    } catch (error) {
      console.error('Failed to load dropdowns');
    }
  };

  const fetchService = async () => {
    try {
      const { data } = await API.get(`/services/${id}`);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        department: data.department?._id || data.department || '',
        doctor: data.doctor?._id || data.doctor || '',
        price: data.price || '',
        duration: data.duration || '30',
        category: data.category || 'Consultation',
        status: data.status || 'Active',
        icon: data.icon || '💊',
      });
    } catch (error) {
      toast.error('Failed to load service');
      navigate('/services');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.department) delete payload.department;
      if (!payload.doctor) delete payload.doctor;

      if (isEdit) {
        await API.put(`/services/${id}`, payload);
        toast.success('Service updated');
      } else {
        await API.post('/services', payload);
        toast.success('Service created');
      }
      navigate('/services');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save service');
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
      <button onClick={() => navigate('/services')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <FiArrowLeft size={16} /> Back to Services
      </button>

      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{isEdit ? 'Edit Service' : 'Add New Service'}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{isEdit ? 'Update service details' : 'Create a new hospital service'}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group md:col-span-2">
              <label className="form-label">Service Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="e.g. Blood Test, X-Ray" />
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows="2" placeholder="Brief description of this service" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                <option value="Consultation">Consultation</option>
                <option value="Procedure">Procedure</option>
                <option value="Lab Test">Lab Test</option>
                <option value="Imaging">Imaging</option>
                <option value="Surgery">Surgery</option>
                <option value="Therapy">Therapy</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-input" placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="form-input" placeholder="30" min="5" />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} className="form-select">
                <option value="">None</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Doctor (optional)</label>
              <select name="doctor" value={formData.doctor} onChange={handleChange} className="form-select">
                <option value="">None</option>
                {doctors.map((d) => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Icon (emoji)</label>
              <input type="text" name="icon" value={formData.icon} onChange={handleChange} className="form-input" maxLength="4" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <span className="spinner"></span> : <FiSave size={16} />}
              {isEdit ? 'Update Service' : 'Create Service'}
            </button>
            <button type="button" onClick={() => navigate('/services')} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
