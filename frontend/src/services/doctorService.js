import api from "./api"

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
      return response.data
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
      const response = await api.get(`/api/doctors/${doctorId}/availability`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Actualizar disponibilidad del doctor
  updateDoctorAvailability: async (doctorId, availabilityData) => {
    try {
      const response = await api.put(`/api/doctors/${doctorId}/availability`, availabilityData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener citas del doctor
  getDoctorAppointments: async (doctorId) => {
    try {
      const response = await api.get(`/api/doctors/${doctorId}/appointments`)
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
