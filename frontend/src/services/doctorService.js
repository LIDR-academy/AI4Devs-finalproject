import api from "./api"

export const doctorService = {
  // Buscar doctores
  searchDoctors: async (searchParams) => {
    try {
      const response = await api.get("/doctors/search", { params: searchParams })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener perfil del doctor
  getDoctorProfile: async (doctorId) => {
    try {
      const response = await api.get(`/doctors/${doctorId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Registro de doctor
  registerDoctor: async (doctorData) => {
    try {
      const response = await api.post("/doctors/register", doctorData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Actualizar perfil del doctor
  updateDoctorProfile: async (doctorId, doctorData) => {
    try {
      const response = await api.put(`/doctors/${doctorId}`, doctorData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener disponibilidad del doctor
  getDoctorAvailability: async (doctorId) => {
    try {
      const response = await api.get(`/doctors/${doctorId}/availability`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Actualizar disponibilidad del doctor
  updateDoctorAvailability: async (doctorId, availabilityData) => {
    try {
      const response = await api.put(`/doctors/${doctorId}/availability`, availabilityData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener citas del doctor
  getDoctorAppointments: async (doctorId) => {
    try {
      const response = await api.get(`/doctors/${doctorId}/appointments`)
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
