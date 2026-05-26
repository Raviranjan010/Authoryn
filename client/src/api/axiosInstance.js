import axios from 'axios';

const api = axios.create({
  baseURL: '', // Uses relative paths, relies on Vite proxy in development
});

// Request interceptor to add Authorization token dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
