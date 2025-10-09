//import { log } from "console"
import api from "./api"

export const authService = {
  // Login de usuario (paciente/médico)
  login: async (credentials) => {
    try {
      // Determina el endpoint según el tipo de usuario
      const endpoint = credentials.isDoctor
        ? "/api/auth/login/doctor" // Flujo para médicos (preparado, no implementado)
        : "/api/auth/login/patient" // Endpoint para pacientes

      const payload = {
        email: credentials.email,
        password: credentials.password,
      }

      // Realiza la petición al endpoint correspondiente
      const response = await api.post(endpoint, payload)

      // Extrae el token desde el payload y almacénalo
      if (response.data?.payload?.token) {
        localStorage.setItem("authToken", response.data.payload.token)
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Logout de usuario
  logout: async () => {
    try {
      //await api.post("/api/auth/logout")
      localStorage.removeItem("authToken")
      return true
    } catch (error) {
      // Limpiar token local aunque falle la petición
      localStorage.removeItem("authToken")
      throw error.response?.data || error.message
    }
  },

  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await api.post("/api/auth/register", userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Registro de paciente
  registerPatient: async (patientData) => {
    try {
      console.log("Enviando datos al endpoint:", patientData); // Depuración
      const response = await api.post("/api/auth/register/patient", patientData);
      console.log("Respuesta recibida:", response.data); // Depuración
      return response.data;
    } catch (error) {
      console.error("Error en registro:", error); // Depuración
      throw error.response?.data || { message: error.message };
    }
  },

  registerDoctor: async (doctorData) => {
    try {
      console.log("Enviando datos al endpoint de doctor:", doctorData); // Depuración
      const response = await api.post("/api/auth/register/doctor", doctorData);
      console.log("Respuesta recibida:", response.data); // Depuración
      return response.data;
    } catch (error) {
      console.error("Error en registro de doctor:", error); // Depuración
      throw error.response?.data || { message: error.message };
    }
  },

  // Verificar token actual
  verifyToken: async () => {
    try {
      const response = await api.get("/api/auth/verify")
      return response.data
    } catch (error) {
      localStorage.removeItem("authToken")
      throw error.response?.data || error.message
    }
  },

  // Obtener perfil del usuario actual
  getCurrentUser: async () => {
    try {
      const response = await api.get("/api/auth/profile")
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}
