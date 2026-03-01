import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiHeart, FiArrowRight, FiX, FiLinkedin } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'patient', label: 'Patient', desc: 'Book services & consultations', icon: '🧑‍🦰' },
  { value: 'receptionist', label: 'Staff', desc: 'Manage appointments & records', icon: '🏥' },
  { value: 'admin', label: 'Admin', desc: 'Full system administration', icon: '👨‍💼' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loginMode, setLoginMode] = useState('password'); // password | otp
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Role selection modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);

  const { login, googleLogin, requestLoginOtp, verifyLoginOtp } = useAuth();

  // Load saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem('mediflix_saved_login');
    if (saved) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
        if (savedEmail) setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
        setRememberMe(true);
      } catch { /* ignore */ }
    }
  }, []);

  const saveCredentials = () => {
    if (rememberMe && email) {
      localStorage.setItem('mediflix_saved_login', JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem('mediflix_saved_login');
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }
    setLoading(true);
    try {
      const data = await requestLoginOtp(email);
      setOtpSent(true);
      toast.success('OTP sent to your email');
      if (data?.devOtp) toast.success(`Dev OTP: ${data.devOtp}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) { toast.error('Email is required'); return; }
    if (loginMode === 'password' && !password) { toast.error('Please enter your password'); return; }
    if (loginMode === 'otp' && !otp) { toast.error('Please enter OTP'); return; }

    setLoading(true);
    try {
      if (loginMode === 'password') {
        await login(email, password);
        saveCredentials();
      } else {
        await verifyLoginOtp(email, otp);
      }
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    setPendingGoogleCredential(credentialResponse.credential);
    setShowRoleModal(true);
  };

  const handleRoleConfirm = async () => {
    setShowRoleModal(false);
    setLoading(true);
    try {
      if (pendingGoogleCredential) {
        await googleLogin(pendingGoogleCredential, selectedRole);
        setPendingGoogleCredential(null);
        toast.success('Welcome!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 xl:p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
              <FiHeart className="text-white text-2xl" />
            </div>
            <h1 className="text-white text-3xl font-bold tracking-tight">Mediflix+</h1>
          </div>
          <p className="text-blue-200 text-sm mt-1">Hospital Management System</p>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-white text-4xl font-bold leading-tight">
            Managing Healthcare<br />
            <span className="text-cyan-300">Made Simple</span>
          </h2>
          <p className="text-blue-200 text-lg max-w-md leading-relaxed">
            Streamline your hospital operations with our comprehensive management system.
            Track patients, manage appointments, and coordinate care efficiently.
          </p>

          <div className="flex gap-8">
            {[
              { num: '500+', label: 'Patients' },
              { num: '50+', label: 'Doctors' },
              { num: '10K+', label: 'Appointments' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-white text-2xl font-bold">{stat.num}</p>
                <p className="text-blue-300 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-sm relative z-10">
          &copy; 2026 Mediflix+. All rights reserved.
          <br />
          <span className="text-xs text-blue-400">Designed by <span className="font-semibold text-cyan-300">Akshat</span></span>
        </p>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
              <FiHeart className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-slate-800 text-xl font-bold leading-tight">Mediflix+</h1>
              <p className="text-xs text-slate-500 truncate">Hospital Management</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-2xl p-6 sm:p-8">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">Welcome back</h2>
            <p className="text-slate-500 mt-1 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Login mode tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => { setLoginMode('password'); setOtp(''); }}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                loginMode === 'password' ? 'bg-white text-slate-800 shadow' : 'text-slate-500'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('otp'); setPassword(''); }}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                loginMode === 'otp' ? 'bg-white text-slate-800 shadow' : 'text-slate-500'
              }`}
            >
              Email OTP
            </button>
          </div>

          {/* Quick login hint */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5">
            <p className="text-xs text-blue-700 font-medium mb-1">Demo Credentials</p>
            <p className="text-xs text-blue-600">Admin: admin@hospital.com / admin123</p>
            <p className="text-xs text-blue-600">Staff: reception@hospital.com / reception123</p>
            <p className="text-xs text-blue-600">Patient: patient@hospital.com / patient123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Password mode */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="flex items-center gap-2.5 border border-slate-300 rounded-xl bg-white px-3.5 py-2.5 transition-all duration-200 hover:border-slate-400 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500">
                  <FiMail className="text-slate-400 shrink-0" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm bg-transparent outline-none placeholder:text-slate-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

            {loginMode === 'password' && (
              <>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="flex items-center gap-2.5 border border-slate-300 rounded-xl bg-white px-3.5 py-2.5 transition-all duration-200 hover:border-slate-400 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500">
                    <FiLock className="text-slate-400 shrink-0" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-sm bg-transparent outline-none placeholder:text-slate-400"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 shrink-0"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me + Forgot Password row */}
                <div className="flex items-center justify-between -mt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => {
                        setRememberMe(e.target.checked);
                        if (!e.target.checked) localStorage.removeItem('mediflix_saved_login');
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-500">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
              </>
            )}

            {loginMode === 'otp' && (
              <div className="form-group">
                <label className="form-label">One-Time Password</label>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="form-input"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="px-3 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  {loginMode === 'password' ? 'Sign In' : 'Verify OTP'}
                  <FiArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-slate-400 font-medium">or continue with</span></div>
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-In failed')}
              theme="outline"
              size="large"
              width="360"
              text="signin_with"
              shape="pill"
            />
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Create Account
            </Link>
          </p>

          </div>{/* end card */}
        </div>
      </div>

      {/* Role selection modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Choose your role</h3>
                <p className="text-xs text-slate-500 mt-0.5">How would you like to log in?</p>
              </div>
              <button
                onClick={() => { setShowRoleModal(false); setPendingGoogleCredential(null); setPendingPhoneLogin(null); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setSelectedRole(r.value)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                    selectedRole === r.value
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <p className={`font-semibold text-sm ${selectedRole === r.value ? 'text-blue-700' : 'text-slate-700'}`}>{r.label}</p>
                    <p className="text-xs text-slate-400">{r.desc}</p>
                  </div>
                  {selectedRole === r.value && (
                    <div className="ml-auto w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleRoleConfirm}
              disabled={loading}
              className="btn btn-primary w-full py-3 mt-5 text-sm"
            >
              {loading ? <span className="spinner"></span> : <>Continue as {ROLES.find(r => r.value === selectedRole)?.label} <FiArrowRight size={16} /></>}
            </button>
          </div>
        </div>
      )}

      {/* LinkedIn floating button */}
      <a
        href="https://www.linkedin.com/in/akshatsaini05/"
        target="_blank"
        rel="noopener noreferrer"
        title="Connect on LinkedIn"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#0A66C2] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 hover:bg-[#004182] hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 ease-out"
      >
        <FiLinkedin size={22} />
      </a>
    </div>
  );
}
