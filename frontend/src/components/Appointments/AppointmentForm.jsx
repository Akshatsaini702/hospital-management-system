import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function AppointmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'Consultation',
    status: 'Scheduled',
    notes: '',
    fee: '',
  });

  useEffect(() => {
    fetchDropdowns();
    if (isEdit) fetchAppointment();
  }, [id]);

  const fetchDropdowns = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        API.get('/patients'),
        API.get('/doctors'),
      ]);
      setPatients(patientsRes.data.patients);
      setDoctors(doctorsRes.data.doctors);
    } catch (error) {
      console.error('Failed to load dropdown data');
    }
  };

  const fetchAppointment = async () => {
    try {
      const { data } = await API.get(`/appointments/${id}`);
      setFormData({
        patient: data.patient?._id || '',
        doctor: data.doctor?._id || '',
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
        time: data.time || '09:00',
        type: data.type || 'Consultation',
        status: data.status || 'Scheduled',
        notes: data.notes || '',
        fee: data.fee || '',
      });
    } catch (error) {
      toast.error('Failed to load appointment');
      navigate('/appointments');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-fill fee from selected doctor
    if (name === 'doctor' && value) {
      const selectedDoctor = doctors.find((d) => d._id === value);
      if (selectedDoctor?.consultationFee) {
        setFormData((prev) => ({ ...prev, doctor: value, fee: selectedDoctor.consultationFee }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient || !formData.doctor || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/appointments/${id}`, formData);
        toast.success('Appointment updated successfully');
      } else {
        await API.post('/appointments', formData);
        toast.success('Appointment scheduled successfully');
      }
      navigate('/appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save appointment');
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
        onClick={() => navigate('/appointments')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <FiArrowLeft size={16} /> Back to Appointments
      </button>

      <div className="card">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {isEdit ? 'Update appointment details' : 'Fill in the appointment details below'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select name="patient" value={formData.patient} onChange={handleChange} className="form-select">
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {p.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor *</label>
                <select name="doctor" value={formData.doctor} onChange={handleChange} className="form-select">
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} — {d.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="form-select">
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Lab Test">Lab Test</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No Show">No Show</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fee (₹)</label>
                <input type="number" name="fee" value={formData.fee} onChange={handleChange} className="form-input" placeholder="Consultation fee" min="0" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="form-textarea" rows="3" placeholder="Reason for visit, symptoms, or any notes..." />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <span className="spinner"></span> : <FiSave size={16} />}
              {isEdit ? 'Update Appointment' : 'Schedule Appointment'}
            </button>
            <button type="button" onClick={() => navigate('/appointments')} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
