import api from "./api"

export const patientService = {
  // Registro de paciente
  registerPatient: async (patientData) => {
    try {
      const response = await api.post("/patients/register", patientData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener perfil del paciente
  getPatientProfile: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Actualizar perfil del paciente
  updatePatientProfile: async (patientId, patientData) => {
    try {
      const response = await api.put(`/patients/${patientId}`, patientData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Obtener citas del paciente
  getPatientAppointments: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/appointments`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Agendar nueva cita
  bookAppointment: async (appointmentData) => {
    try {
      const response = await api.post("/api/appointments", appointmentData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Cancelar cita
  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

/**
 * Filtra doctores según los criterios seleccionados por el usuario.
 * Incluye filtro de especialidad, estado, municipio, rango de precio, disponibilidad, género y valoración mínima.
 * El filtro de valoración mínima solo se aplica si el usuario está autenticado.
 */
export const filterDoctors = (doctors, filters) => {
  return doctors.filter((doctor) => {
    // Specialty filter
    if (filters.specialty && doctor.specialty !== filters.specialty) {
      return false
    }

    // State filter
    if (filters.state && doctor.location.state !== filters.state) {
      return false
    }

    // Municipality filter
    if (filters.municipality && doctor.location.municipality !== filters.municipality) {
      return false
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange
      if (doctor.price < min || doctor.price > max) {
        return false
      }
    }

    // Availability filter
    if (filters.availability === "available" && !doctor.isAvailable) {
      return false
    }

    // Gender filter
    if (filters.gender && doctor.gender !== filters.gender) {
      return false
    }

    // Valoración mínima
    if (filters.minRating && doctor.rating < filters.minRating) {
      return false
    }

    return true
  })
}