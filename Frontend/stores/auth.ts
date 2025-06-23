import { defineStore } from 'pinia'
import { authService } from '../services/api'

// Clave para el token de autenticación
const AUTH_TOKEN_KEY = process.env.AUTH_TOKEN_KEY || 'auth-token';

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'consultant' | 'client'
  avatar?: string
  position?: string
  department?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role,
    isAdmin: (state) => state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager',
    isConsultant: (state) => state.user?.role === 'consultant',
    isClient: (state) => state.user?.role === 'client'
  },

  actions: {
    async login(email: string, password: string, rememberMe: boolean = false) {
      this.loading = true
      try {
        // Realizar petición de login al backend
        const apiResponse = await authService.login(email, password, rememberMe)
        
        // Verificar si la respuesta tiene la estructura esperada con campo data
        if (!apiResponse || !apiResponse.data) {
          console.error('Estructura de respuesta inesperada:', apiResponse)
          return { success: false, error: 'Estructura de respuesta inesperada' }
        }
        
        const response = apiResponse.data
        
        // Mapear la respuesta al formato de usuario esperado
        const user: User = {
          id: response.userId,
          name: response.fullName,
          email: response.email,
          role: response.roles?.[0]?.toLowerCase() || 'client',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.fullName)}&background=0ea5e9&color=fff`,
          position: '',
          department: ''
        }

        this.user = user
        this.token = response.token
        this.isAuthenticated = true
        
        // Almacenar en localStorage con información adicional
        if (typeof window !== 'undefined') {
          // Asegurarse de que el token sea una cadena válida
          if (typeof this.token !== 'string' || !this.token) {
            console.error('Error: Token inválido o vacío', this.token)
            return { success: false, error: 'Token inválido recibido del servidor' }
          }
          
          localStorage.setItem(AUTH_TOKEN_KEY, this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          localStorage.setItem('token_expiration', response.expiration || '')
          console.log('Login exitoso, token guardado:', this.token.substring(0, 15) + '...')
          console.log('Clave usada para almacenar el token:', AUTH_TOKEN_KEY)
          
          // Verificar que el token se haya guardado correctamente
          const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
          if (storedToken !== this.token) {
            console.error('Error: El token no se guardó correctamente en localStorage')
            console.log('Token esperado (primeros 15):', this.token.substring(0, 15))
            console.log('Token almacenado (primeros 15):', storedToken ? storedToken.substring(0, 15) : 'null')
          } else {
            console.log('Token verificado correctamente en localStorage')
          }
        }
        
        return { success: true }
      } catch (error) {
        console.error('Error durante el login:', error)
        return { success: false, error: 'Credenciales inválidas' }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      // Verificar si hay datos de "Recordarme" antes de cerrar sesión
      const rememberMe = typeof window !== 'undefined' ? localStorage.getItem('remember_me') === 'true' : false
      const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('saved_email') : null
      
      try {
        // Intentar hacer logout en el backend
        // Ahora authService.logout() maneja internamente los errores y siempre devuelve un objeto
        const result = await authService.logout()
        
        if (result.localOnly) {
          console.log('Logout realizado solo localmente debido a error de conexión con el servidor')
        }
      } catch (error) {
        // Este bloque solo se ejecutará si hay un error crítico en authService.logout()
        // que no fue capturado internamente
        console.error('Error crítico al cerrar sesión:', error)
      }
      
      // Limpiar estado local independientemente del resultado
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      if (typeof window !== 'undefined') {
        // Eliminar datos de sesión
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem('user')
        localStorage.removeItem('token_expiration')
        
        // Si no hay que recordar los datos, eliminar también los datos de acceso
        if (!rememberMe) {
          localStorage.removeItem('remember_me')
          localStorage.removeItem('saved_email')
        }
      }
      
      return { 
        success: true,
        rememberMeActive: rememberMe,
        savedEmail: savedEmail
      }
    },

    async checkAuth() {
    console.log('Iniciando verificación de autenticación...')
    
    // Si no estamos en el navegador, no podemos verificar la autenticación
    if (typeof window === 'undefined') {
      console.log('No estamos en el navegador, no se puede verificar autenticación')
      return false
    }

    // Obtener token y usuario del localStorage
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const storedUser = localStorage.getItem('user')
    
    console.log('Clave usada para recuperar el token:', AUTH_TOKEN_KEY)
    console.log('Token encontrado en localStorage:', token ? `${token.substring(0, 15)}...` : 'null')
    
    // Si no hay token o usuario almacenado, no hay autenticación
    if (!token || !storedUser) {
      console.log('No se encontró token o usuario en localStorage')
      return false
    }

    // Establecer datos iniciales del usuario desde localStorage para evitar pantallas en blanco
    try {
      const parsedUser = JSON.parse(storedUser)
      this.user = parsedUser
      this.token = token
      this.isAuthenticated = true
      
      // Verificar si ya tenemos una verificación reciente (menos de 5 minutos)
      const lastVerification = localStorage.getItem('last_token_verification')
      if (lastVerification) {
        const lastVerificationTime = parseInt(lastVerification)
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000
        
        // Si verificamos el token hace menos de 5 minutos, no volvemos a verificar
        if (now - lastVerificationTime < fiveMinutes) {
          console.log('Usando verificación de token reciente')
          return true
        }
      }
      
      console.log('Token encontrado en localStorage, verificando con el servidor...')
    } catch (e) {
      console.warn('Error al parsear usuario almacenado:', e)
      return false
    }
    
    try {
      console.log('Verificando token con el servidor...')
      // Verificar si el token es válido con el backend
      const apiResponse = await authService.verifyToken()
      
      console.log('Respuesta recibida del servidor:', apiResponse)
      
      // Verificamos la estructura de la respuesta según lo que nos ha mostrado el usuario
      // La estructura correcta es: { data: {...}, statusCode: number, message: string }
      if (!apiResponse || typeof apiResponse !== 'object' || apiResponse.statusCode !== 200 || !apiResponse.data) {
        console.error('Estructura de respuesta inesperada:', apiResponse)
        await this.logout()
        return false
      }
      
      const userData = apiResponse.data
      
      // Verificamos que tengamos los datos mínimos necesarios
      if (!userData.userId || !userData.fullName || !userData.email) {
        console.error('Datos de usuario incompletos en la respuesta:', userData)
        await this.logout()
        return false
      }
      
      // Mapear la respuesta al formato de usuario esperado
      const user: User = {
        id: userData.userId,
        name: userData.fullName,
        email: userData.email,
        role: userData.roles?.[0]?.toLowerCase() || 'client',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName)}&background=0ea5e9&color=fff`,
        position: userData.position || '',
        department: userData.department || ''
      }
      
      // Actualizar datos del usuario
      this.user = user
      this.isAuthenticated = true
      
      // Actualizar localStorage con los datos más recientes y la marca de tiempo de verificación
      localStorage.setItem('user', JSON.stringify(this.user))
      localStorage.setItem('last_token_verification', Date.now().toString())
      
      console.log('Verificación de token exitosa')
      return true
    } catch (error) {
      // Si hay error en la verificación del token
      console.error('Error al verificar token:', error)
      
      // Registrar detalles adicionales para diagnóstico
      if (error?.response) {
        console.error('Detalles de la respuesta de error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        })
      } else if (error instanceof Error) {
        console.error('Error nativo:', error.message)
      }
      
      // Si el error es 401 o 403, hacer logout
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.warn('Error de autenticación detectado, cerrando sesión')
        await this.logout()
        return false
      }
      
      // Si es otro tipo de error (como de red), mantener la sesión local
      // para evitar desconexiones innecesarias cuando hay problemas de red
      console.warn('Error de red al verificar token, manteniendo sesión local')
      return true
    }
    },

    updateUser(userData: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...userData }
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(this.user))
        }
      }
    }
  }
})
