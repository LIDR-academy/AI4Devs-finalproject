/**
 * types/notivue.ts
 * Definición de tipos para el sistema de notificaciones personalizado
 */

/**
 * Interfaz para una notificación individual
 */
export interface Notification {
  /**
   * Identificador único de la notificación
   */
  id: number;
  
  /**
   * Tipo de notificación
   */
  type: 'success' | 'error' | 'info' | 'warning';
  
  /**
   * Contenido de la notificación
   */
  content: string;
  
  /**
   * Fecha y hora de creación
   */
  timestamp: Date;
}

/**
 * Interfaz para el sistema de notificaciones
 */
export interface NotificationsInterface {
  /**
   * Lista de notificaciones activas
   */
  list: Notification[];
  
  /**
   * Añade una nueva notificación
   * @param type Tipo de notificación
   * @param content Contenido de la notificación
   * @param duration Duración en milisegundos (0 para no auto-eliminar)
   * @returns ID de la notificación creada
   */
  add: (type: 'success' | 'error' | 'info' | 'warning', content: string, duration?: number) => number;
  
  /**
   * Elimina una notificación por su ID
   * @param id ID de la notificación a eliminar
   */
  remove: (id: number) => void;
  
  /**
   * Elimina todas las notificaciones
   */
  clear: () => void;
}

/**
 * Interfaz para el sistema de toast
 */
export interface ToastInterface {
  /**
   * Muestra una notificación de éxito
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales (duration para especificar duración)
   * @returns ID de la notificación creada
   */
  success: (message: string, options?: Record<string, any>) => number;

  /**
   * Muestra una notificación de error
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales (duration para especificar duración)
   * @returns ID de la notificación creada
   */
  error: (message: string, options?: Record<string, any>) => number;

  /**
   * Muestra una notificación informativa
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales (duration para especificar duración)
   * @returns ID de la notificación creada
   */
  info: (message: string, options?: Record<string, any>) => number;

  /**
   * Muestra una notificación de advertencia
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales (duration para especificar duración)
   * @returns ID de la notificación creada
   */
  warning: (message: string, options?: Record<string, any>) => number;
}
