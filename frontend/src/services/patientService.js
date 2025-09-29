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
      const response = await api.post("/appointments", appointmentData)
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
