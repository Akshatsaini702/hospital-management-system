import { useState } from 'react';
import { FiKey, FiMail, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AccountSecurity() {
  const { user, changePassword, requestEmailChangeOtp, verifyEmailChangeOtp } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
    otp: '',
  });

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      toast.error('Please fill all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoadingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleRequestEmailOtp = async (e) => {
    e.preventDefault();

    if (!emailForm.newEmail || !emailForm.password) {
      toast.error('Enter new email and current password');
      return;
    }

    setLoadingEmail(true);
    try {
      const data = await requestEmailChangeOtp(emailForm.newEmail, emailForm.password);
      setEmailOtpSent(true);
      toast.success('OTP sent to your new email');
      if (data?.devOtp) {
        toast.success(`Dev OTP: ${data.devOtp}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();

    if (!emailForm.otp) {
      toast.error('Enter OTP to verify email');
      return;
    }

    setLoadingEmail(true);
    try {
      await verifyEmailChangeOtp(emailForm.otp);
      toast.success('Email updated successfully');
      setEmailForm({ newEmail: '', password: '', otp: '' });
      setEmailOtpSent(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account Security</h1>
        <p className="text-sm text-slate-500 mt-1">Manage login credentials for {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiKey className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loadingPassword}>
              {loadingPassword ? <span className="spinner"></span> : 'Update Password'}
            </button>
          </form>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiMail className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Change Email</h2>
          </div>

          <form onSubmit={handleRequestEmailOtp} className="space-y-4 mb-4">
            <div className="form-group">
              <label className="form-label">Current Email</label>
              <input type="email" className="form-input bg-slate-100" value={user?.email || ''} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">New Email</label>
              <input
                type="email"
                className="form-input"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm((prev) => ({ ...prev, newEmail: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={emailForm.password}
                onChange={(e) => setEmailForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loadingEmail}>
              {loadingEmail ? <span className="spinner"></span> : 'Send Verification OTP'}
            </button>
          </form>

          {emailOtpSent && (
            <form onSubmit={handleVerifyEmailOtp} className="space-y-4 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FiShield />
                Enter the OTP sent to your new email.
              </div>
              <div className="form-group">
                <label className="form-label">OTP</label>
                <input
                  type="text"
                  className="form-input"
                  value={emailForm.otp}
                  maxLength={6}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                />
              </div>
              <button type="submit" className="btn btn-success w-full" disabled={loadingEmail}>
                {loadingEmail ? <span className="spinner"></span> : 'Verify and Update Email'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
