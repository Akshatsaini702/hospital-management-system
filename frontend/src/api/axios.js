import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('hospitalUser') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle 401 responses — skip auth endpoints so login/register errors are shown properly
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthRoute = url.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('hospitalUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
