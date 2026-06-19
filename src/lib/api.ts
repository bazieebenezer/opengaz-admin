import axios from 'axios';

const api = axios.create({
  baseURL: 'https://opengaz-backend.onrender.com/api',
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
