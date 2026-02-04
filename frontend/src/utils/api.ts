import axios, { AxiosInstance, AxiosError } from 'axios';

// En desarrollo, usar el proxy de Vite (relativo) para evitar problemas de CORS
// En producción, usar la URL absoluta configurada en VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para CORS con cookies/credentials
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Solo redirigir a login si NO estamos en la página de login
    // y el error es 401 (no autenticado)
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
