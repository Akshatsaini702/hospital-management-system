import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hospitalUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('hospitalUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('hospitalUser', JSON.stringify(data));
    return data;
  };

  const requestLoginOtp = async (email) => {
    const { data } = await API.post('/auth/login-otp/request', { email });
    return data;
  };

  const verifyLoginOtp = async (email, otp) => {
    const { data } = await API.post('/auth/login-otp/verify', { email, otp });
    setUser(data);
    localStorage.setItem('hospitalUser', JSON.stringify(data));
    return data;
  };

  const register = async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    setUser(data);
    localStorage.setItem('hospitalUser', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hospitalUser');
  };

  const googleLogin = async (credential, role) => {
    const { data } = await API.post('/auth/google', { credential, role });
    setUser(data);
    localStorage.setItem('hospitalUser', JSON.stringify(data));
    return data;
  };

  const requestPhoneOtp = async (phone) => {
    const { data } = await API.post('/auth/phone-otp/request', { phone });
    return data;
  };

  const verifyPhoneOtp = async (phone, otp, role) => {
    const { data } = await API.post('/auth/phone-otp/verify', { phone, otp, role });
    setUser(data);
    localStorage.setItem('hospitalUser', JSON.stringify(data));
    return data;
  };

  const updateProfile = async (userData) => {
    const { data } = await API.put('/auth/profile', userData);
    setUser(data);
    localStorage.setItem('hospitalUser', JSON.stringify(data));
    return data;
  };

  const requestForgotPasswordOtp = async (email) => {
    const { data } = await API.post('/auth/forgot-password/request', { email });
    return data;
  };

  const resetPasswordWithOtp = async (email, otp, newPassword) => {
    const { data } = await API.post('/auth/forgot-password/verify', { email, otp, newPassword });
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const { data } = await API.post('/auth/change-password', { currentPassword, newPassword });
    return data;
  };

  const requestEmailChangeOtp = async (newEmail, password) => {
    const { data } = await API.post('/auth/change-email/request', { newEmail, password });
    return data;
  };

  const verifyEmailChangeOtp = async (otp) => {
    const { data } = await API.post('/auth/change-email/verify', { otp });
    setUser(data);
    localStorage.setItem('hospitalUser', JSON.stringify(data));
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        googleLogin,
        requestLoginOtp,
        verifyLoginOtp,
        requestPhoneOtp,
        verifyPhoneOtp,
        register,
        logout,
        updateProfile,
        requestForgotPasswordOtp,
        resetPasswordWithOtp,
        changePassword,
        requestEmailChangeOtp,
        verifyEmailChangeOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
