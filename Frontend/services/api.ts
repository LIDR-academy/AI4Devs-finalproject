/**
 * Servicio para manejar las llamadas a la API del backend
 */

// URL base de la API - Obtener de variables de entorno o usar valor por defecto
const API_BASE_URL = process.env.API_BASE_URL || "https://localhost:44378/api";

// Clave para el token de autenticación
const AUTH_TOKEN_KEY = process.env.AUTH_TOKEN_KEY || "auth-token";

/**
 * Cliente HTTP para realizar peticiones a la API
 */
export const apiClient = {
  /**
   * Realiza una petición a la API
   * @param endpoint - Endpoint de la API
   * @param options - Opciones de la petición
   * @returns Respuesta de la API
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Configuración por defecto
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Añadir token de autenticación si existe
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log(`Enviando solicitud autenticada a: ${endpoint}`);
      console.log(`Token (primeros 20 caracteres): ${token.substring(0, 20)}...`);
    } else {
      console.warn(`Solicitud sin token a: ${endpoint}`);
    }

    // Configurar las opciones para incluir cookies
    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Importante: incluir cookies en las solicitudes
    };

    // Realizar la petición
    try {
      console.log(`Enviando solicitud a: ${url}`, { method: options.method || 'GET' });
      const response = await fetch(url, requestOptions);
      console.log(`Respuesta recibida de ${endpoint}: Status ${response.status}`);

      // Verificar si la respuesta es correcta
      if (!response.ok) {
        // Intentar obtener datos del error
        let errorData;
        let responseText = '';
        
        try {
          // Primero intentamos leer el texto de la respuesta
          responseText = await response.text();
          console.log(`Respuesta de error en texto: ${responseText}`);
          
          // Si hay contenido, intentamos parsearlo como JSON
          if (responseText && responseText.trim()) {
            errorData = JSON.parse(responseText);
            console.error(`Error detallado de ${endpoint}:`, errorData);
          } else {
            // Si la respuesta está vacía, creamos un objeto de error genérico
            errorData = {
              message: `Error ${response.status}: ${response.statusText}`,
              statusCode: response.status,
              emptyResponse: true
            };
            console.warn(`Respuesta vacía en error de ${endpoint}`);
          }
        } catch (parseError) {
          // Si no podemos parsear como JSON, usamos el texto como mensaje
          errorData = {
            message: responseText || `Error ${response.status}: ${response.statusText}`,
            statusCode: response.status,
            parseError: true
          };
          console.error(`No se pudo parsear respuesta de error de ${endpoint}:`, parseError);
        }
        
        // Si el error es 401, registrar información detallada
        if (response.status === 401) {
          console.warn('Error de autenticación 401 detectado');
          console.warn('Headers de respuesta:', Object.fromEntries(response.headers.entries()));
          console.warn('URL completa:', url);
          // No eliminamos el token aquí para evitar ciclos, lo manejamos en el store
          
          // Para errores 401, devolvemos un objeto con estructura esperada
          // para evitar errores al procesar la respuesta
          const error: any = new Error(errorData.message || `Error de autenticación`);
          error.response = {
            status: 401,
            data: {
              statusCode: 401,
              message: errorData.message || "Usuario no autenticado",
              data: null
            }
          };
          throw error;
        }
        
        // Para otros errores, lanzamos un error con la información disponible
        const error: any = new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
        error.response = {
          status: response.status,
          data: errorData
        };
        throw error;
      }

      // Para respuestas exitosas, verificamos si hay contenido
      let data;
      const contentType = response.headers.get('content-type');
      
      // Si la respuesta está vacía o no es JSON, manejamos el caso especial
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (!text) {
          console.warn(`Respuesta vacía de ${endpoint}, devolviendo objeto vacío`);
          return {} as T; // Devolvemos un objeto vacío como fallback
        }
        
        try {
          // Intentamos parsear como JSON aunque el Content-Type no lo indique
          data = JSON.parse(text);
        } catch (e) {
          console.warn(`Respuesta no es JSON válido: ${text}`);
          return { raw: text } as unknown as T;
        }
      } else {
        // Respuesta normal JSON
        data = await response.json();
      }
      
      console.log(`Datos recibidos de ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`Error en solicitud a ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Realiza una petición GET
   * @param endpoint - Endpoint de la API
   * @param options - Opciones de la petición
   * @returns Respuesta de la API
   */
  get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  },

  /**
   * Realiza una petición POST
   * @param endpoint - Endpoint de la API
   * @param data - Datos a enviar
   * @param options - Opciones de la petición
   * @returns Respuesta de la API
   */
  post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Realiza una petición PUT
   * @param endpoint - Endpoint de la API
   * @param data - Datos a enviar
   * @param options - Opciones de la petición
   * @returns Respuesta de la API
   */
  put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Realiza una petición DELETE
   * @param endpoint - Endpoint de la API
   * @param options - Opciones de la petición
   * @returns Respuesta de la API
   */
  delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  },
};

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Inicia sesión con email y contraseña
   * @param email - Email o nombre de usuario
   * @param password - Contraseña del usuario
   * @param rememberMe - Indicador para recordar la sesión
   * @returns Respuesta con token y datos del usuario
   */
  async login(email: string, password: string, rememberMe: boolean = false) {
    return apiClient.post<{
      data: {
        token: string;
        refreshToken: string;
        expiration: string;
        userId: string;
        email: string;
        fullName: string;
        roles: string[];
        permissions: string[];
      };
      statusCode: number;
      message: string;
    }>("/v1/Auth/login", {
      usernameOrEmail: email,
      password,
      rememberMe,
    });
  },

  /**
   * Cierra la sesión del usuario
   */
  async logout() {
    try {
      // Llamamos al endpoint correcto que ya existe en el backend
      // La ruta correcta es /v1/Auth/logout (con A mayúscula)
      await apiClient.post("/v1/Auth/logout");
      return { success: true };
    } catch (error) {
      console.warn("Error al cerrar sesión en el servidor:", error);
      // Manejamos posibles errores de red o problemas temporales
      return { success: true, localOnly: true };
    }
  },

  /**
   * Verifica si el token es válido
   * @returns Datos del usuario si el token es válido
   */
  async verifyToken() {
    return apiClient.get<{
      data: {
        userId: string;
        fullName: string;
        email: string;
        roles: string[];
        permissions: string[];
      };
      statusCode: number;
      message: string;
    }>("/v1/Auth/me"); // Endpoint correcto con Auth con A mayúscula
  },
};
