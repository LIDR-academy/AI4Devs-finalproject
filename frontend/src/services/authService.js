import api from "./api"

export const authService = {
  // Login de usuario
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials)
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token)
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Logout de usuario
  logout: async () => {
    try {
      await api.post("/auth/logout")
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
      const response = await api.post("/auth/register", userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Verificar token actual
  verifyToken: async () => {
    try {
      const response = await api.get("/auth/verify")
      return response.data
    } catch (error) {
      localStorage.removeItem("authToken")
      throw error.response?.data || error.message
    }
  },

  // Obtener perfil del usuario actual
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/profile")
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}
