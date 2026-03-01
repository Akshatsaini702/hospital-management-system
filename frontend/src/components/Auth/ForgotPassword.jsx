import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { requestForgotPasswordOtp, resetPasswordWithOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const data = await requestForgotPasswordOtp(email);
      setOtpSent(true);
      toast.success('Reset OTP sent to your email');
      if (data?.devOtp) {
        toast.success(`Dev OTP: ${data.devOtp}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email || !otp || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp(email, otp, newPassword);
      toast.success('Password updated. Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FiHeart className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Reset Password</h1>
            <p className="text-xs text-slate-500">Recover your Mediflix+ account</p>
          </div>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input pl-10"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">OTP</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="form-input"
                placeholder="Enter OTP"
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {otpSent ? 'Resend' : 'Send OTP'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input pl-10"
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input pl-10"
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
            {loading ? <span className="spinner"></span> : <>Reset Password <FiArrowRight size={16} /></>}
          </button>
        </form>

        <p className="text-sm text-center text-slate-500 mt-5">
          Back to{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
