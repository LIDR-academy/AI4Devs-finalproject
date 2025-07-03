import { defineStore } from "pinia";
import { authService } from "../services/api";

// Clave para el token de autenticación
const AUTH_TOKEN_KEY = process.env.NUXT_PUBLIC_AUTH_TOKEN_KEY || "auth-token";

// Definición de tipos para roles de usuario
type UserRole = 'admin' | 'manager' | 'consultant' | 'client';

// Interfaz para el usuario autenticado
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  position: string;
  department: string;
}

// Interfaz para la respuesta de autenticación
interface AuthResponse {
  token: string;
  refreshToken: string;
  expiration: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  position?: string;
  department?: string;
  statusCode?: number;
  message?: string;
}

// Interfaz para respuestas de la API
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
  message?: string;
}

// Interfaz para la respuesta de login
interface LoginResponse {
  token: string;
  refreshToken: string;
  expiration: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  position?: string;
  department?: string;
}

// Interfaz para el perfil de usuario
interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
  position?: string;
  department?: string;
  statusCode?: number;
  message?: string;
}

// Interfaz para errores de la API
interface ApiError extends Error {
  response?: {
    status: number;
    data: any;
    statusText: string;
    headers: any;
  };
  request?: any;
  config: any;
  isAxiosError: boolean;
  toJSON: () => object;
  message: string;
  status?: number;
  statusText?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  }),

  getters: {
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role,
    isAdmin: (state) => state.user?.role === "admin",
    isManager: (state) => state.user?.role === "manager",
    isConsultant: (state) => state.user?.role === "consultant",
    isClient: (state) => state.user?.role === "client",
    authTokenKey: () => AUTH_TOKEN_KEY,
  },

  actions: {
    async login(email: string, password: string, rememberMe: boolean = false) {
      this.loading = true;
      try {
        // Realizar petición de login al backend
        const apiResponse = await authService.login(email, password, rememberMe);

        // Verificar si la respuesta tiene la estructura esperada con campo data
        if (!apiResponse || !apiResponse.data) {
          const errorMsg = apiResponse?.message || "Estructura de respuesta inesperada";
          console.error("Error en la respuesta del servidor:", errorMsg, apiResponse);
          return { success: false, error: errorMsg };
        }

        const response = apiResponse.data;
        
        // Verificar si hay un error en la respuesta (la API podría devolver el error en la propiedad 'message')
        if (response && typeof response === 'object' && 'message' in response && 
            (response as any).message?.includes('error')) {
          console.error("Error en la respuesta del servidor:", response);
          return { 
            success: false, 
            error: (response as any).message || "Error en el servidor. Por favor, inténtalo de nuevo." 
          };
        }

        // Mapear la respuesta al formato de usuario esperado
        const role = response.roles?.[0]?.toLowerCase();
        const validRoles = ["admin", "manager", "consultant", "client"] as const;
        const userRole = validRoles.includes(role as any) ? role as typeof validRoles[number] : "client";
        
        const user: User = {
          id: response.userId,
          name: response.fullName,
          email: response.email,
          role: userRole,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(response.fullName)}&background=0ea5e9&color=fff`,
          position: (response as any).position || "",
          department: (response as any).department || "",
        };

        this.user = user;
        this.token = response.token;
        this.isAuthenticated = true;

        // Almacenar en localStorage con información adicional
        if (typeof window !== "undefined") {
          // Asegurarse de que el token sea una cadena válida
          if (typeof this.token !== "string" || !this.token) {
            const errorMsg = "Token inválido recibido del servidor";
            console.error(errorMsg, this.token);
            return { success: false, error: errorMsg };
          }

          const authTokenKey = this.authTokenKey;

          try {
            localStorage.setItem(authTokenKey, this.token);
            localStorage.setItem("user", JSON.stringify(this.user));
            localStorage.setItem("token_expiration", response.expiration || "");
            console.log("Login exitoso, token guardado:", this.token.substring(0, 15) + "...");

            // Verificar que el token se haya guardado correctamente
            const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
            if (storedToken !== this.token) {
              console.warn("El token no se guardó correctamente en localStorage");
              console.log("Token esperado (primeros 15):", this.token.substring(0, 15));
              console.log("Token almacenado (primeros 15):", storedToken ? storedToken.substring(0, 15) : "null");
            } else {
              console.log("Token verificado correctamente en localStorage");
            }
          } catch (storageError) {
            console.error("Error al guardar en localStorage:", storageError);
            return { 
              success: false, 
              error: "Error al guardar los datos de sesión. Por favor, inténtalo de nuevo." 
            };
          }
        }

        return { success: true };
      } catch (error) {
        console.error("Error durante el login:", error);
        
        // Extraer el mensaje de error del error
        let errorMessage = "Error al iniciar sesión. Por favor, verifica tus credenciales.";
        
        if (error?.response?.data) {
          // Intentar obtener el mensaje de diferentes propiedades comunes
          errorMessage = error.response.data.message || 
                        error.response.data.Message || 
                        JSON.stringify(error.response.data);
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Filtrar mensajes de error comunes
        if (errorMessage.toLowerCase().includes('usuario') || 
            errorMessage.toLowerCase().includes('contraseña') ||
            errorMessage.toLowerCase().includes('password') ||
            errorMessage.toLowerCase().includes('credenciales')) {
          errorMessage = "Usuario o contraseña incorrectos. Por favor, verifica tus credenciales.";
        }
        
        return { success: false, error: errorMessage };
      } finally {
        this.loading = false;
      }
    },

    async logout(): Promise<{ success: boolean; rememberMeActive: boolean; savedEmail: string | null }> {
      const rememberMe = typeof window !== 'undefined' ? localStorage.getItem('remember_me') === 'true' : false;
      const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('saved_email') : null;
      
      try {
        const result = await authService.logout();
        
        if (result && 'localOnly' in result && result.localOnly) {
          console.log('Logout realizado solo localmente debido a error de conexión con el servidor');
        }
      } catch (error) {
        console.error('Error crítico al cerrar sesión:', error);
      } finally {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        
        if (typeof window !== 'undefined') {
          try {
            // Usar el getter para obtener la clave del token
            const authTokenKey = this.authTokenKey;
            
            localStorage.removeItem(authTokenKey);
            localStorage.removeItem('user');
            localStorage.removeItem('token_expiration');
            
            if (!rememberMe) {
              localStorage.removeItem('remember_me');
              localStorage.removeItem('saved_email');
            }
          } catch (storageError) {
            console.error('Error al limpiar el almacenamiento local:', storageError);
          }
        }
      }
      
      return { 
        success: true,
        rememberMeActive: rememberMe,
        savedEmail: savedEmail
      };
    },

    async checkAuth(): Promise<boolean> {
      console.log('Iniciando verificación de autenticación...')
      
      if (typeof window === 'undefined') {
        console.log('No estamos en el navegador, no se puede verificar autenticación')
        return false
      }

      // Usar el getter para obtener la clave del token
      const authTokenKey = this.authTokenKey
      const token = localStorage.getItem(authTokenKey)
      const storedUser = localStorage.getItem('user')
      
      console.log('Clave usada para recuperar el token:', authTokenKey)
      console.log('Token encontrado en localStorage:', token ? `${token.substring(0, 15)}...` : 'null')
      
      if (!token || !storedUser) {
        console.log('No se encontró token o usuario en localStorage')
        return false
      }

      try {
        const parsedUser = JSON.parse(storedUser)
        this.user = parsedUser
        this.token = token
        this.isAuthenticated = true
        
        const lastVerification = localStorage.getItem('last_token_verification')
        if (lastVerification) {
          const lastVerificationTime = parseInt(lastVerification, 10)
          const now = Date.now()
          const fiveMinutes = 5 * 60 * 1000
          
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
        const apiResponse = await authService.verifyToken()
        
        console.log('Respuesta recibida del servidor:', apiResponse)
        
        if (!apiResponse || typeof apiResponse !== 'object' || !apiResponse.data) {
          console.error('Estructura de respuesta inesperada:', apiResponse)
          await this.logout()
          return false
        }
        
        const responseData = apiResponse.data as any
        
        if (!responseData.userId || !responseData.fullName || !responseData.email) {
          console.error('Datos de usuario incompletos en la respuesta:', responseData)
          await this.logout()
          return false
        }
        
        // Validar el rol del usuario
        const role = responseData.roles?.[0]?.toLowerCase()
        const validRoles = ['admin', 'manager', 'consultant', 'client'] as const
        const userRole = validRoles.includes(role as any) ? role as typeof validRoles[number] : 'client'
        
        const user: User = {
          id: responseData.userId,
          name: responseData.fullName,
          email: responseData.email,
          role: userRole,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(responseData.fullName)}&background=0ea5e9&color=fff`,
          position: responseData.position || '',
          department: responseData.department || ''
        }
        
        this.user = user
        this.isAuthenticated = true
        
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('last_token_verification', Date.now().toString())
        
        console.log('Verificación de token exitosa')
        return true
      } catch (error: unknown) {
        const err = error as ApiError
        console.error('Error al verificar token:', err)
        
        if (err.response) {
          console.error('Detalles de la respuesta de error:', {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data
          })
        } else if (err instanceof Error) {
          console.error('Error nativo:', err.message)
        }
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn('Error de autenticación detectado, cerrando sesión')
          await this.logout()
          return false
        }
        
        console.warn('Error de red al verificar token, manteniendo sesión local')
        return true
      }
    },

    async updateUser(userData: Partial<User>): Promise<void> {
      if (this.user) {
        // Asegurarse de que el rol sea válido
        if (userData.role) {
          const validRoles = ['admin', 'manager', 'consultant', 'client'] as const
          if (!validRoles.includes(userData.role as any)) {
            console.warn(`Rol no válido: ${userData.role}. Estableciendo a 'client' por defecto.`)
            userData.role = 'client'
          }
        }
        
        // Actualizar solo las propiedades proporcionadas
        const updatedUser: User = { ...this.user }
        
        if (userData.name !== undefined) updatedUser.name = userData.name
        if (userData.email !== undefined) updatedUser.email = userData.email
        if (userData.role !== undefined) updatedUser.role = userData.role as UserRole
        if (userData.avatar !== undefined) updatedUser.avatar = userData.avatar
        if (userData.position !== undefined) updatedUser.position = userData.position
        if (userData.department !== undefined) updatedUser.department = userData.department
        
        this.user = updatedUser
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(this.user))
        }
      }
    },
  },
});
