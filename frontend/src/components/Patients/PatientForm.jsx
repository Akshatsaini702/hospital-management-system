import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Male',
    bloodGroup: '',
    address: '',
    medicalHistory: '',
    status: 'Active',
    emergencyContact: {
      name: '',
      phone: '',
      relation: '',
    },
  });

  useEffect(() => {
    if (isEdit) {
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      const { data } = await API.get(`/patients/${id}`);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        age: data.age || '',
        gender: data.gender || 'Male',
        bloodGroup: data.bloodGroup || '',
        address: data.address || '',
        medicalHistory: data.medicalHistory || '',
        status: data.status || 'Active',
        emergencyContact: {
          name: data.emergencyContact?.name || '',
          phone: data.emergencyContact?.phone || '',
          relation: data.emergencyContact?.relation || '',
        },
      });
    } catch (error) {
      toast.error('Failed to load patient');
      navigate('/patients');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency_')) {
      const field = name.replace('emergency_', '');
      setFormData({
        ...formData,
        emergencyContact: { ...formData.emergencyContact, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.age || !formData.gender) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/patients/${id}`, formData);
        toast.success('Patient updated successfully');
      } else {
        await API.post('/patients', formData);
        toast.success('Patient added successfully');
      }
      navigate('/patients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save patient');
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
        onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <FiArrowLeft size={16} /> Back to Patients
      </button>

      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? 'Edit Patient' : 'Register New Patient'}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {isEdit ? 'Update patient information' : 'Fill in the patient details below'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="Patient name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="Email address" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="Phone number" />
              </div>
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="form-input" placeholder="Age" min="0" max="150" />
              </div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="form-select">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="form-select">
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                  <option value="Active">Active</option>
                  <option value="Critical">Critical</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address & Medical */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Additional Details</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-input" placeholder="Full address" />
              </div>
              <div className="form-group">
                <label className="form-label">Medical History</label>
                <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} className="form-textarea" rows="3" placeholder="Any past medical conditions, allergies, surgeries..." />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Contact Name</label>
                <input type="text" name="emergency_name" value={formData.emergencyContact.name} onChange={handleChange} className="form-input" placeholder="Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input type="text" name="emergency_phone" value={formData.emergencyContact.phone} onChange={handleChange} className="form-input" placeholder="Phone" />
              </div>
              <div className="form-group">
                <label className="form-label">Relation</label>
                <input type="text" name="emergency_relation" value={formData.emergencyContact.relation} onChange={handleChange} className="form-input" placeholder="e.g. Spouse, Parent" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <span className="spinner"></span> : <FiSave size={16} />}
              {isEdit ? 'Update Patient' : 'Register Patient'}
            </button>
            <button type="button" onClick={() => navigate('/patients')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
