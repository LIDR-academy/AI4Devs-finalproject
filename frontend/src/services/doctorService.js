import api from "./api"
import { authService } from "./authService"


export const doctorService = {
  /**
   * Busca doctores usando filtros y paginación.
   * Los parámetros se envían como query params según Swagger:
   * - doctor_name: nombre del médico (mínimo 3 caracteres)
   * - specialty_id: ID de la especialidad
   * - state_id: ID del estado
   * - city_id: ID de la ciudad
   * - page: número de página
   * - limit: resultados por página
   * La respuesta incluye payload.results (array de doctores) y payload.pagination (objeto de paginación).
   */
  searchDoctors: async (searchParams) => {
    try {
      // Los parámetros se envían como query params según Swagger
      const response = await api.get("api/doctors/search", { params: searchParams })
      // La respuesta incluye: payload.results (array de doctores) y payload.pagination (objeto de paginación)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener perfil del doctor
  getDoctorProfile: async (doctorId) => {
    try {
      const response = await api.get(`/api/doctors/${doctorId}`)
      const data = response.data?.payload || {}

      // Validar si el usuario está autenticado
      const isAuthenticated = authService.isAuthenticated()

      // Leyenda para campos no disponibles
      const unavailableMsg = "No disponible por el momento" // Puedes internacionalizar desde el componente

      // Mapear campos sensibles según autenticación y disponibilidad
      return {
        ...response.data,
        payload: {
          ...data,
          email: isAuthenticated
            ? data.email || unavailableMsg
            : null,
          phone: isAuthenticated
            ? data.phone || unavailableMsg
            : null,
          address: isAuthenticated
            ? data.address || unavailableMsg
            : null,
          available: typeof data.available === "boolean"
            ? data.available
            : false,
        },
      }
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Registro de doctor
  registerDoctor: async (doctorData) => {
    try {
      const response = await api.post("/api/doctors/register", doctorData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Actualizar perfil del doctor
  updateDoctorProfile: async (doctorId, doctorData) => {
    try {
      const response = await api.put(`/api/doctors/${doctorId}`, doctorData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener disponibilidad del doctor
  getDoctorAvailability: async (doctorId) => {
    try {
      // Consumir el endpoint de disponibilidad según Swagger
      const response = await api.get(`/api/doctors/availability/${doctorId}`)
      // Retornar la respuesta estándar (payload es un array de horarios)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  /**
   * Obtener comentarios de pacientes sobre un especialista.
   * Solo accesible para usuarios autenticados.
   * @param {number|string} doctorId - ID del especialista
   * @param {object} params - { page, limit }
   * @returns {Promise<object>} - { results: [], pagination: {} }
   */
  getDoctorComments: async (doctorId, params = {}) => {
    try {
      const response = await api.get(`/api/doctors/${doctorId}/comments`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Actualizar disponibilidad del doctor
  updateDoctorAvailability: async (doctorId, availabilityData) => {
    try {
      // Corregir el endpoint según Swagger: POST /api/doctors/availability
      const response = await api.post(`/api/doctors/availability`, availabilityData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener citas del doctor
  getDoctorAppointments: async (doctorId, params = {}) => {
    try {
      // Enviar los filtros como query params
      const response = await api.get(`/api/doctors/appointments`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  /**
   * Actualiza el estado de una cita médica (confirmar/rechazar).
   * @param {number|string} appointmentId - ID de la cita
   * @param {object} params - { status: "confirmed" | "rejected" }
   * @returns {Promise<object>} - Respuesta del backend
   */
  updateAppointmentStatus: async (appointmentId, { status }) => {
    try {
      // PATCH /api/doctors/appointments/{id} con body { status }
      const response = await api.patch(`/api/doctors/appointments/${appointmentId}`, { status })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener especialidades médicas
  getMedicalSpecialties: async () => {
    try {
      const response = await api.get("/specialties")
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}
