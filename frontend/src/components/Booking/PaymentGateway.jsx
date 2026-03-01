import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCreditCard, FiSmartphone, FiShield, FiLock, FiCheck, FiArrowLeft } from 'react-icons/fi';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function PaymentGateway() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [success, setSuccess] = useState(false);

  // UPI
  const [upiId, setUpiId] = useState('');

  // Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => { fetchBooking(); }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data } = await API.get(`/bookings/${bookingId}`);
      if (data.paymentStatus === 'paid') {
        setBooking(data);
        setSuccess(true);
      } else {
        setBooking(data);
      }
    } catch (error) {
      toast.error('Booking not found');
      navigate('/my-bookings');
    } finally { setLoading(false); }
  };

  const formatCardNumber = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    return cleaned;
  };

  const validatePayment = () => {
    if (paymentMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID (e.g., name@upi)');
        return false;
      }
    } else {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 13 || cleanCard.length > 16) {
        toast.error('Please enter a valid card number');
        return false;
      }
      if (!cardName.trim()) {
        toast.error('Please enter cardholder name');
        return false;
      }
      const [mm, yy] = cardExpiry.split('/');
      if (!mm || !yy || parseInt(mm) < 1 || parseInt(mm) > 12) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return false;
      }
    }
    return true;
  };

  const handlePay = async () => {
    if (!validatePayment()) return;

    setProcessing(true);
    try {
      const payload = {
        paymentMethod,
        upiId: paymentMethod === 'UPI' ? upiId : undefined,
        cardNumber: paymentMethod !== 'UPI' ? cardNumber.replace(/\s/g, '') : undefined,
        cardExpiry: paymentMethod !== 'UPI' ? cardExpiry : undefined,
        cardCvv: paymentMethod !== 'UPI' ? cardCvv : undefined,
        cardName: paymentMethod !== 'UPI' ? cardName : undefined,
      };

      const { data } = await API.post(`/bookings/${bookingId}/pay`, payload);
      setBooking(data);
      setSuccess(true);
      toast.success('Payment successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally { setProcessing(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-8 h-8 border-3 border-blue-600 border-t-transparent mx-auto"></div></div>;
  if (!booking) return null;

  // SUCCESS VIEW
  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="card p-8 text-center space-y-5">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <FiCheck className="text-emerald-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h1>
          <p className="text-slate-500">Your payment has been processed successfully.</p>

          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Booking Type</span>
              <span className="font-medium text-slate-800 capitalize">{booking.type}</span>
            </div>
            {booking.service && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Service</span>
                <span className="font-medium text-slate-800">{booking.service.name}</span>
              </div>
            )}
            {booking.doctor && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Doctor</span>
                <span className="font-medium text-slate-800">{booking.doctor.name}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Date</span>
              <span className="font-medium text-slate-800">
                {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Time</span>
              <span className="font-medium text-slate-800">{booking.timeSlot}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-bold text-emerald-600">₹{booking.amount}</span>
            </div>
            {booking.transactionId && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono text-xs text-slate-600">{booking.transactionId}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">A confirmation email has been sent to your registered email address.</p>

          <div className="flex gap-3">
            <button onClick={() => navigate('/my-bookings')} className="btn btn-secondary flex-1">
              My Bookings
            </button>
            <button onClick={() => navigate('/browse-services')} className="btn btn-primary flex-1">
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PAYMENT FORM VIEW
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium">
        <FiArrowLeft size={16} /> Back
      </button>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FiCreditCard className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Payment</h1>
            <p className="text-slate-500 text-sm">Complete your booking payment</p>
          </div>
        </div>

        {/* Booking summary */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{booking.type === 'service' ? 'Service' : 'Doctor'}</span>
            <span className="font-medium text-slate-800">{booking.service?.name || booking.doctor?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Date & Time</span>
            <span className="font-medium text-slate-800">
              {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {booking.timeSlot}
            </span>
          </div>
          <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
            <span className="font-semibold text-slate-700">Total Amount</span>
            <span className="text-xl font-bold text-blue-600">₹{booking.amount}</span>
          </div>
        </div>

        {/* Payment method tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl mb-6">
          {['UPI', 'Credit Card', 'Debit Card'].map(method => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`px-2 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                paymentMethod === method ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {method === 'UPI' ? <FiSmartphone size={14} /> : <FiCreditCard size={14} />}
              {method}
            </button>
          ))}
        </div>

        {/* Payment form */}
        <div className="space-y-4">
          {paymentMethod === 'UPI' ? (
            <div className="form-group">
              <label className="form-label">UPI ID</label>
              <input
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="form-input"
              />
              <p className="text-xs text-slate-400 mt-1">Enter your UPI ID (e.g., name@paytm, name@gpay, name@ybl)</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="form-input"
                  />
                  <FiCreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Name on card"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="form-input"
                    />
                    <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handlePay}
          disabled={processing}
          className="btn btn-primary w-full py-3.5 text-base mt-6"
        >
          {processing ? (
            <span className="spinner"></span>
          ) : (
            <>
              <FiShield size={18} />
              Pay ₹{booking.amount}
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
          <FiLock size={12} />
          <span>Your payment information is secured with 256-bit encryption</span>
        </div>
      </div>
    </div>
  );
}
