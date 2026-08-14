import axios from 'axios';

// Get base URL from environment or default fallback
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Normalize URL: Ensure baseURL always ends with '/api'
const baseURL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/+$/, '')}/api`;

const API = axios.create({
  baseURL
});

// Request interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('watchparty_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
