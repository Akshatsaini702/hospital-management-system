import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFilter, FiDollarSign, FiCreditCard, FiFileText, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const statusColor = {
  Pending: 'bg-amber-100 text-amber-700',
  Partial: 'bg-blue-100 text-blue-700',
  Paid: 'bg-emerald-100 text-emerald-700',
  Refunded: 'bg-purple-100 text-purple-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalBilled: 0, totalCollected: 0, pendingAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.paymentStatus = statusFilter;
      const { data } = await API.get('/payments', { params });
      setPayments(data.payments || data);
      if (data.summary) setSummary(data.summary);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await API.delete(`/payments/${id}`);
      toast.success('Payment deleted');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Billed</p>
              <p className="text-xl font-bold text-slate-800">₹{summary.totalBilled?.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Collected</p>
              <p className="text-xl font-bold text-emerald-700">₹{summary.totalCollected?.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
              <FiClock className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending</p>
              <p className="text-xl font-bold text-amber-700">₹{summary.pendingAmount?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-sm font-medium text-slate-500">{payments.length} payment record{payments.length !== 1 ? 's' : ''}</h3>
        <Link to="/payments/new" className="btn btn-primary">
          <FiPlus size={18} /> New Invoice
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by invoice or patient..." className="form-input pl-9 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-400" size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select w-auto text-sm">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Refunded">Refunded</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="card p-12 text-center">
          <FiCreditCard className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-lg font-medium text-slate-700">No payments found</h3>
          <p className="text-slate-400 text-sm mt-1">Create your first invoice</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FiFileText className="text-slate-400" size={14} />
                      <span className="font-mono text-xs font-medium text-slate-700">{p.invoiceNumber || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{p.patient?.name || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">₹{p.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-medium">₹{p.paidAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-slate-500">{p.paymentMethod || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[p.paymentStatus] || 'bg-slate-100 text-slate-500'}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/payments/edit/${p._id}`} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <FiEdit2 size={15} />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
