import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiHeart, FiArrowRight, FiLinkedin } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-700 p-8 xl:p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-400 rounded-full blur-3xl"></div>
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
            Join Our<br />
            <span className="text-cyan-300">Healthcare Team</span>
          </h2>
          <p className="text-blue-200 text-lg max-w-md">
            Create your account and start managing hospital operations with ease.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🔒', label: 'Secure Access' },
              { icon: '📊', label: 'Analytics' },
              { icon: '📋', label: 'Record Management' },
              { icon: '⚡', label: 'Real-time Updates' },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-2 text-blue-100">
                <span className="text-lg">{feature.icon}</span>
                <span className="text-sm">{feature.label}</span>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
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
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">Create Account</h2>
            <p className="text-slate-500 mt-1 text-sm">Fill in the details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="patient">Patient</option>
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="6+ characters"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm *</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Repeat"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPass"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="rounded border-slate-300"
              />
              <label htmlFor="showPass" className="text-sm text-slate-600 cursor-pointer">
                Show passwords
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  Create Account
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
              onSuccess={async (credentialResponse) => {
                try {
                  await googleLogin(credentialResponse.credential);
                  toast.success('Account created with Google!');
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Google sign-in failed');
                }
              }}
              onError={() => toast.error('Google Sign-In failed')}
              theme="outline"
              size="large"
              width="360"
              text="signup_with"
              shape="pill"
            />
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Sign In
            </Link>
          </p>

          </div>{/* end card */}
        </div>
      </div>

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
