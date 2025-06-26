/**
 * Servicio para gestionar los tipos de KPI
 */
import { apiClient } from './api';

// Interfaz para el tipo de KPI
export interface TipoKPI {
  id?: number;
  nombre: string;
  descripcion?: string;
  unidad?: string;
  formato?: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

// Interfaz para la respuesta de la API
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

// Servicio para gestionar los tipos de KPI
export const tipoKPIService = {
  /**
   * Obtiene todos los tipos de KPI
   * @returns Lista de tipos de KPI
   */
  async getAll(forceRefresh: boolean = false): Promise<TipoKPI[]> {
    try {
      // Añadir parámetro para evitar caché si se solicita
      const endpoint = forceRefresh 
        ? `/v1/TiposKPI?_nocache=${new Date().getTime()}` 
        : '/v1/TiposKPI';
      
      console.log(`Llamando a la API para obtener tipos de KPI desde: ${endpoint}`);
      
      const response = await apiClient.get<ApiResponse<TipoKPI[]> | TipoKPI[]>(endpoint);
      
      // Imprimir la respuesta completa para depuración
      console.log('Respuesta completa de la API:', response);
      
      // Si response es undefined o null
      if (!response) {
        console.log('La respuesta de la API es undefined o null, devolviendo array vacío');
        return [];
      }
      
      // La API está devolviendo los datos directamente sin estar en una propiedad 'data'
      if (Array.isArray(response)) {
        console.log('La API devolvió un array directamente:', response);
        return response;
      }
      
      // Si response tiene una propiedad data que es un array
      if (response.data && Array.isArray(response.data)) {
        console.log('La API devolvió un objeto con propiedad data que es un array:', response.data);
        return response.data;
      }
      
      // Si response.data tiene una propiedad data que es un array
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('La API devolvió un objeto anidado con propiedad data:', response.data.data);
        return response.data.data;
      }
      
      // Si llegamos aquí, la respuesta tiene un formato inesperado
      console.warn('La respuesta de la API tiene un formato inesperado:', response);
      return [];
    } catch (error: any) {
      // Detectar específicamente errores de conexión y propagarlos
      if (error.message && (
          error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('Network Error') ||
          error.message.includes('ERR_CONNECTION_REFUSED')
      )) {
        console.warn('Error de conexión detectado en tipoKPIService.getAll:', error.message);
        throw error;
      }
      
      // Propagar errores de autenticación (401)
      if (error.response && error.response.status === 401) {
        console.warn('Error de autenticación en tipoKPIService.getAll');
        throw error;
      }
      
      console.error('Error al obtener todos los tipos de KPI:', error);
      throw error;
    }
  },

  /**
   * Obtiene un tipo de KPI por su ID
   * @param id - ID del tipo de KPI
   * @returns Tipo de KPI
   */
  async getById(id: number): Promise<TipoKPI> {
    try {
      console.log(`Obteniendo tipo de KPI con ID ${id}`);
      const response = await apiClient.get<ApiResponse<TipoKPI> | TipoKPI>(`/v1/TiposKPI/${id}`);
      
      console.log(`Respuesta completa para tipo de KPI ID ${id}:`, response);
      
      // Si la respuesta es directamente el objeto esperado
      if (response && typeof response === 'object' && !Array.isArray(response) && response.id) {
        console.log(`Respuesta directa con ID ${id}:`, response);
        return response as TipoKPI;
      }
      
      // Si la respuesta es un objeto pero no tiene ID, podría ser un wrapper
      if (response && typeof response === 'object') {
        // Caso 1: La API devuelve un objeto con propiedad data
        if (response.data && typeof response.data === 'object') {
          if (response.data.id) {
            console.log(`Respuesta con data.id ${id}:`, response.data);
            return response.data as TipoKPI;
          } else if (Array.isArray(response.data) && response.data.length > 0) {
            // Si data es un array, buscar el elemento con el ID correcto
            const item = response.data.find(item => item.id === id);
            if (item) {
              console.log(`Encontrado elemento con ID ${id} en array:`, item);
              return item as TipoKPI;
            }
          }
        }
        
        // Caso 2: La respuesta es el objeto directo pero sin wrapper
        if (response.id === id) {
          console.log(`Respuesta directa con ID ${id}:`, response);
          return response as TipoKPI;
        }
      }
      
      // Si llegamos aquí, intentamos una última vez con una estructura conocida
      const tipoKPI: TipoKPI = {
        id: id,
        nombre: '',
        descripcion: '',
        unidad: '',
        formato: '',
        activo: true,
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
      };
      
      console.warn(`No se pudo extraer correctamente el tipo de KPI con ID ${id}, devolviendo estructura básica`);
      return tipoKPI;
    } catch (error) {
      console.error(`Error al obtener tipo de KPI con ID ${id}:`, error);
      
      // Devolver un objeto con la estructura correcta pero vacío
      return {
        id: id,
        nombre: '',
        descripcion: '',
        unidad: '',
        formato: '',
        activo: true,
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
      } as TipoKPI;
    }
  },

  /**
   * Crea un nuevo tipo de KPI
   * @param tipoKPI - Datos del tipo de KPI
   * @returns Tipo de KPI creado
   */
  async create(tipoKPI: TipoKPI): Promise<TipoKPI> {
    try {
      console.log('Enviando datos para crear tipo de KPI:', tipoKPI);
      
      // El apiClient.post devuelve directamente el objeto parseado del JSON, no { data: ... }
      const response = await apiClient.post<TipoKPI>('/v1/TiposKPI', tipoKPI);
      
      // Log completo de la respuesta para debugging
      console.log('Respuesta recibida del apiClient.post:', response);
      console.log('Tipo de response:', typeof response);
      console.log('response es null?:', response === null);
      console.log('response es undefined?:', response === undefined);
      
      // Verificar si response está vacío
      if (!response) {
        console.error('Response del apiClient es null o undefined');
        throw new Error('No se recibió respuesta del servidor');
      }
      
      if (response === null || response === undefined) {
        console.error('Response es null o undefined');
        throw new Error('La respuesta del servidor está vacía');
      }
      
      // El apiClient ya nos devuelve el objeto directamente
      if (typeof response === 'object' && !Array.isArray(response)) {
        // Verificar si tiene las propiedades de un TipoKPI
        if (response.hasOwnProperty('nombre') || response.hasOwnProperty('id')) {
          console.log('Response es un TipoKPI válido:', response);
          return response as TipoKPI;
        }
        
        // Si es un wrapper API response con data
        if (response.hasOwnProperty('data') && response.data) {
          console.log('Response es un wrapper con data:', response.data);
          return response.data as TipoKPI;
        }
      }
      
      // Si llegamos aquí, intentemos usar la respuesta tal como está
      console.warn('Formato de respuesta no reconocido, intentando usar response:', response);
      
      // Verificar si al menos tiene alguna propiedad esperada
      if (response && (response.nombre || response.id)) {
        console.log('Response parece ser un TipoKPI válido, usándolo directamente');
        return response as TipoKPI;
      }
      
      // Si nada funciona, lanzar error con información detallada
      console.error('Formato de respuesta completamente inesperado:', {
        response,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : 'N/A'
      });
      throw new Error(`Formato de respuesta inesperado del servidor. Tipo: ${typeof response}`);
    } catch (error) {
      console.error('Error completo al crear tipo de KPI:', error);
      
      // Si es un error de red, mantener el mensaje original
      if (error.message && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Network Error') ||
        error.message.includes('ERR_CONNECTION_REFUSED')
      )) {
        throw error;
      }
      
      // Para otros errores, incluir más información
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      throw error;
    }
  },

  /**
   * Actualiza un tipo de KPI existente
   * @param id - ID del tipo de KPI
   * @param tipoKPI - Datos actualizados del tipo de KPI
   * @returns Tipo de KPI actualizado
   */
  async update(id: number, tipoKPI: TipoKPI): Promise<TipoKPI> {
    try {
      console.log(`Enviando actualización para tipo de KPI ID ${id}:`, tipoKPI);
      
      // Guardar una copia de los datos enviados para usarla como respuesta si es necesario
      const datosEnviados = { ...tipoKPI, id };
      
      // El apiClient.put devuelve directamente el objeto parseado del JSON, igual que post
      const response = await apiClient.put<TipoKPI>(`/v1/TiposKPI/${id}`, tipoKPI);
      
      console.log(`Respuesta de actualización para ID ${id}:`, response);
      console.log('Tipo de response:', typeof response);
      
      // Si la respuesta es un objeto vacío (común en respuestas 204 No Content)
      if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
        console.log(`Respuesta vacía (posiblemente 204 No Content), usando datos enviados como respuesta`);
        return datosEnviados;
      }
      
      // El apiClient ya nos devuelve el objeto directamente
      if (typeof response === 'object' && !Array.isArray(response)) {
        // Verificar si tiene las propiedades de un TipoKPI
        if (response.hasOwnProperty('nombre') || response.hasOwnProperty('id')) {
          console.log('Response de update es un TipoKPI válido:', response);
          return response as TipoKPI;
        }
        
        // Si es un wrapper API response con data
        if (response.hasOwnProperty('data') && response.data) {
          console.log('Response de update es un wrapper con data:', response.data);
          return response.data as TipoKPI;
        }
      }
      
      // Si llegamos aquí, usar datos enviados como fallback
      console.warn('Formato de respuesta no reconocido en update, usando datos enviados:', datosEnviados);
      return datosEnviados;
      
    } catch (error) {
      console.error('Error al actualizar tipo de KPI:', error);
      
      // Si es un error de red, lanzarlo directamente
      if (error.message && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Network Error') ||
        error.message.includes('ERR_CONNECTION_REFUSED')
      )) {
        throw error;
      }
      
      // Para errores de autenticación
      if (error.response && error.response.status === 401) {
        throw error;
      }
      
      // Para otros errores, incluir más información
      if (error.response) {
        console.error('Error response en update:', error.response);
        console.error('Error response data en update:', error.response.data);
        console.error('Error response status en update:', error.response.status);
      }
      
      throw error;
    }
  },

  /**
   * Elimina un tipo de KPI
   * @param id - ID del tipo de KPI
   * @returns Resultado de la operación
   */
  async delete(id: number): Promise<boolean> {
    try {
      console.log(`Iniciando eliminación del tipo de KPI con ID ${id}`);
      
      // Realizar la petición DELETE
      const response = await apiClient.delete<ApiResponse<boolean> | boolean>(`/v1/TiposKPI/${id}`);
      
      console.log(`Respuesta completa de eliminación para ID ${id}:`, response);
      
      // Caso 1: Respuesta 204 No Content (éxito sin contenido)
      if (!response || Object.keys(response).length === 0 || response.data === undefined || response.data === null) {
        console.log(`Eliminación exitosa (204 No Content) para ID ${id}`);
        return true;
      }
      
      // Caso 2: La API devuelve un booleano directamente
      if (typeof response.data === 'boolean') {
        console.log(`La API devolvió un booleano para ID ${id}:`, response.data);
        return response.data;
      }
      
      // Caso 3: La API devuelve un objeto con propiedad data que es un booleano
      if (response.data && typeof response.data.data === 'boolean') {
        console.log(`La API devolvió un objeto con data booleana para ID ${id}:`, response.data.data);
        return response.data.data;
      }
      
      // Caso 4: La API devuelve un objeto con statusCode
      if (response.data && typeof response.data.statusCode === 'number') {
        const success = response.data.statusCode >= 200 && response.data.statusCode < 300;
        console.log(`La API devolvió statusCode ${response.data.statusCode} para ID ${id}, resultado: ${success ? 'éxito' : 'fallo'}`);
        return success;
      }
      
      // Caso 5: La respuesta es un objeto sin formato esperado pero existe (asumimos éxito)
      if (response && typeof response === 'object') {
        console.log(`Respuesta de eliminación para ID ${id} es un objeto sin formato esperado, asumiendo éxito`);
        return true;
      }
      
      // Si llegamos aquí, la respuesta tiene un formato totalmente inesperado
      console.warn(`La respuesta de eliminación para ID ${id} tiene un formato inesperado:`, response);
      return true;
    } catch (error: any) {
      console.error(`Error al eliminar tipo de KPI con ID ${id}:`, error);
      
      // Si es un error 401, propagarlo para que sea manejado por el interceptor global
      if (error.response && error.response.status === 401) {
        throw error;
      }
      
      // Para otros errores, lanzar una excepción con mensaje descriptivo
      throw new Error(error.message || `Error al eliminar el tipo de KPI con ID ${id}`);
    }
  }
};