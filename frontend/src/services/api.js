import axios from "axios"

console.log(`NEXT_PUBLIC_API_BASE_URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}`);

// Configuración base de axios
const api = axios.create({
  //baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3010",
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
