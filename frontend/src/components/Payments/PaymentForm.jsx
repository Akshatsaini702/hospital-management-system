import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiPlus, FiTrash2, FiDollarSign } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const emptyItem = { description: '', amount: '', service: '' };

export default function PaymentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);

  const [formData, setFormData] = useState({
    patient: '',
    appointment: '',
    items: [{ ...emptyItem }],
    tax: '0',
    discount: '0',
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    notes: '',
  });

  // Pay modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [payTxnId, setPayTxnId] = useState('');

  useEffect(() => {
    fetchDropdowns();
    if (isEdit) fetchPayment();
  }, [id]);

  const fetchDropdowns = async () => {
    try {
      const [patRes, svcRes] = await Promise.all([
        API.get('/patients'),
        API.get('/services'),
      ]);
      setPatients(patRes.data.patients || patRes.data);
      setServices(svcRes.data);
    } catch (error) {
      console.error('Failed to load dropdowns');
    }
  };

  const fetchAppointments = async (patientId) => {
    if (!patientId) { setAppointments([]); return; }
    try {
      const { data } = await API.get(`/appointments?patient=${patientId}`);
      setAppointments(data.appointments || data);
    } catch (error) {
      setAppointments([]);
    }
  };

  const fetchPayment = async () => {
    try {
      const { data } = await API.get(`/payments/${id}`);
      setFormData({
        patient: data.patient?._id || data.patient || '',
        appointment: data.appointment?._id || data.appointment || '',
        items: data.items?.length ? data.items.map(i => ({ description: i.description || '', amount: i.amount || '', service: i.service?._id || i.service || '' })) : [{ ...emptyItem }],
        tax: data.tax || '0',
        discount: data.discount || '0',
        paymentMethod: data.paymentMethod || 'Cash',
        paymentStatus: data.paymentStatus || 'Pending',
        notes: data.notes || '',
      });
      if (data.patient?._id || data.patient) fetchAppointments(data.patient?._id || data.patient);
    } catch (error) {
      toast.error('Failed to load payment');
      navigate('/payments');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'patient') fetchAppointments(value);
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    items[index] = { ...items[index], [field]: value };

    // Auto-fill from service selection
    if (field === 'service' && value) {
      const svc = services.find(s => s._id === value);
      if (svc) {
        items[index].description = svc.name;
        items[index].amount = svc.price;
      }
    }
    setFormData(prev => ({ ...prev, items }));
  };

  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalAmount = subtotal + (parseFloat(formData.tax) || 0) - (parseFloat(formData.discount) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient || formData.items.length === 0) {
      toast.error('Patient and at least one item are required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        items: formData.items.filter(i => i.description && i.amount).map(i => ({
          description: i.description,
          amount: parseFloat(i.amount),
          ...(i.service ? { service: i.service } : {}),
        })),
        tax: parseFloat(formData.tax) || 0,
        discount: parseFloat(formData.discount) || 0,
      };
      if (!payload.appointment) delete payload.appointment;

      if (isEdit) {
        await API.put(`/payments/${id}`, payload);
        toast.success('Payment updated');
      } else {
        await API.post('/payments', payload);
        toast.success('Invoice created');
      }
      navigate('/payments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) { toast.error('Enter a valid amount'); return; }
    try {
      await API.post(`/payments/${id}/pay`, {
        amount: parseFloat(payAmount),
        method: payMethod,
        transactionId: payTxnId || undefined,
      });
      toast.success('Payment recorded');
      setShowPayModal(false);
      fetchPayment();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
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
      <button onClick={() => navigate('/payments')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
        <FiArrowLeft size={16} /> Back to Payments
      </button>

      <div className="card">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{isEdit ? 'Update billing details' : 'Generate a new billing invoice'}</p>
          </div>
          {isEdit && formData.paymentStatus !== 'Paid' && formData.paymentStatus !== 'Cancelled' && (
            <button onClick={() => setShowPayModal(true)} className="btn btn-primary">
              <FiDollarSign size={16} /> Record Payment
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient + Appointment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Patient *</label>
              <select name="patient" value={formData.patient} onChange={handleChange} className="form-select">
                <option value="">Select patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Appointment (optional)</label>
              <select name="appointment" value={formData.appointment} onChange={handleChange} className="form-select">
                <option value="">None</option>
                {appointments.map(a => <option key={a._id} value={a._id}>{new Date(a.date).toLocaleDateString()} — {a.doctor?.name || a.type}</option>)}
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <label className="form-label mb-2">Line Items</label>
            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1">
                    {idx === 0 && <span className="text-xs text-slate-400">Service</span>}
                    <select value={item.service} onChange={(e) => handleItemChange(idx, 'service', e.target.value)} className="form-select text-sm">
                      <option value="">Manual entry</option>
                      {services.map(s => <option key={s._id} value={s._id}>{s.name} — ₹{s.price}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    {idx === 0 && <span className="text-xs text-slate-400">Description</span>}
                    <input type="text" value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} placeholder="Description" className="form-input text-sm" />
                  </div>
                  <div className="w-32">
                    {idx === 0 && <span className="text-xs text-slate-400">Amount</span>}
                    <input type="number" value={item.amount} onChange={(e) => handleItemChange(idx, 'amount', e.target.value)} placeholder="0" className="form-input text-sm text-right" />
                  </div>
                  <button type="button" onClick={() => removeItem(idx)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors mb-0.5" disabled={formData.items.length <= 1}>
                    <FiTrash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <FiPlus size={14} /> Add Item
            </button>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Tax (₹)</label>
                <input type="number" name="tax" value={formData.tax} onChange={handleChange} className="form-input" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Discount (₹)</label>
                <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="form-input" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Total</label>
                <div className="h-10 flex items-center text-xl font-bold text-slate-800">₹{totalAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Payment Method + Status + Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="form-select">
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Insurance">Insurance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="form-select">
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
                <option value="Refunded">Refunded</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} className="form-textarea" rows="2" placeholder="Additional notes" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <span className="spinner"></span> : <FiSave size={16} />}
              {isEdit ? 'Update Invoice' : 'Create Invoice'}
            </button>
            <button type="button" onClick={() => navigate('/payments')} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>

      {/* Record Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Record Payment</h3>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="form-input" placeholder="0" min="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Method</label>
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="form-select">
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Insurance">Insurance</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Transaction ID (optional)</label>
              <input type="text" value={payTxnId} onChange={(e) => setPayTxnId(e.target.value)} className="form-input" placeholder="e.g. TXN123456" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleRecordPayment} className="btn btn-primary flex-1"><FiDollarSign size={16} /> Pay</button>
              <button onClick={() => setShowPayModal(false)} className="btn btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
