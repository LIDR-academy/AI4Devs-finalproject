import axios from "axios"

// Determinar si estamos en el navegador (cliente) o en el servidor
const isBrowser = typeof window !== 'undefined';

// URL base para peticiones del navegador (cliente)
const clientBaseURL = isBrowser 
  ? `http://${window.location.hostname}:3010` // Usa el mismo hostname pero puerto 3010
  : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3010";

console.log(`NEXT_PUBLIC_API_BASE_URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}`);
console.log(`Using API baseURL: ${clientBaseURL}`);

// Configuración base de axios
const api = axios.create({
  baseURL: clientBaseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para requests - agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para responses - manejo de errores globales
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("authToken")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
