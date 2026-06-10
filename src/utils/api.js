import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://tiara-grimy-luckless.ngrok-free.dev/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fingroup_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fingroup_token');
      localStorage.removeItem('fingroup_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
