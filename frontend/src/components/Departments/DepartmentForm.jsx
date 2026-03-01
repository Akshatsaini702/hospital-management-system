import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const ICONS = ['🏥', '❤️', '🧠', '🦴', '👶', '🧴', '👁️', '👂', '🩺', '🎗️', '💉', '🔬', '🫁', '🦷', '💊'];

export default function DepartmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headDoctor: '',
    status: 'Active',
    icon: '🏥',
  });

  useEffect(() => {
    if (isEdit) fetchDepartment();
  }, [id]);

  const fetchDepartment = async () => {
    try {
      const { data } = await API.get(`/departments/${id}`);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        headDoctor: data.headDoctor || '',
        status: data.status || 'Active',
        icon: data.icon || '🏥',
      });
    } catch (error) {
      toast.error('Failed to load department');
      navigate('/departments');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Department name is required');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/departments/${id}`, formData);
        toast.success('Department updated successfully');
      } else {
        await API.post('/departments', formData);
        toast.success('Department created successfully');
      }
      navigate('/departments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save department');
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
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/departments')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <FiArrowLeft size={16} /> Back to Departments
      </button>

      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? 'Edit Department' : 'Add New Department'}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {isEdit ? 'Update department information' : 'Create a new department'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all ${
                    formData.icon === icon
                      ? 'bg-blue-100 ring-2 ring-blue-500 scale-110'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="e.g. Cardiology" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows="3" placeholder="Brief description of the department" />
          </div>

          <div className="form-group">
            <label className="form-label">Head Doctor</label>
            <input type="text" name="headDoctor" value={formData.headDoctor} onChange={handleChange} className="form-input" placeholder="Name of the head doctor" />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="form-select">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <span className="spinner"></span> : <FiSave size={16} />}
              {isEdit ? 'Update Department' : 'Create Department'}
            </button>
            <button type="button" onClick={() => navigate('/departments')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
