import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('psm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (response) => {
    // Unwrap the standardized { success, statusCode, message, data } envelope
    // so consumers receive the inner `data` payload directly (e.g. { items, pagination }).
    const payload = response.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return payload.data;
    }
    return payload;
  },
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data || {
      success: false,
      message: error.message || 'Network error',
    };

    if (status === 401) {
      localStorage.removeItem('psm_token');
      localStorage.removeItem('psm_user');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject({
      status,
      message: payload.message || 'Something went wrong',
      details: payload.details || null,
      raw: payload,
    });
  }
);

export default api;
