import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_BASE_URL || 'http://localhost:4000') + '/api',
});

// Attach auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;