/**
 * composables/useToast.ts
 * Composable para usar Notivue en toda la aplicación
 */

import { push } from 'notivue'

export interface ToastOptions {
  duration?: number
  title?: string
  position?: string
}

/**
 * Composable que proporciona una interfaz consistente para mostrar notificaciones
 * usando Notivue como backend
 */
export function useToast() {
  
  /**
   * Muestra una notificación de éxito
   */
  const success = (message: string, options: ToastOptions = {}) => {
    return push.success({
      title: options.title || 'Éxito',
      message,
      duration: options.duration || 5000
    })
  }

  /**
   * Muestra una notificación de error
   */
  const error = (message: string, options: ToastOptions = {}) => {
    return push.error({
      title: options.title || 'Error',
      message,
      duration: options.duration || 8000 // Errores duran más tiempo
    })
  }

  /**
   * Muestra una notificación informativa
   */
  const info = (message: string, options: ToastOptions = {}) => {
    return push.info({
      title: options.title || 'Información',
      message,
      duration: options.duration || 5000
    })
  }

  /**
   * Muestra una notificación de advertencia
   */
  const warning = (message: string, options: ToastOptions = {}) => {
    return push.warning({
      title: options.title || 'Advertencia',
      message,
      duration: options.duration || 6000
    })
  }

  /**
   * Muestra una notificación de promesa (loading -> success/error)
   */
  const promise = async <T>(
    promiseOrFunction: Promise<T> | (() => Promise<T>),
    options: {
      loading?: string
      success?: string | ((data: T) => string)
      error?: string | ((error: any) => string)
    } = {}
  ) => {
    return push.promise(
      typeof promiseOrFunction === 'function' ? promiseOrFunction() : promiseOrFunction,
      {
        loading: { message: options.loading || 'Cargando...' },
        success: (data) => ({
          message: typeof options.success === 'function' 
            ? options.success(data) 
            : options.success || 'Operación completada'
        }),
        error: (error) => ({
          message: typeof options.error === 'function' 
            ? options.error(error) 
            : options.error || 'Error en la operación'
        })
      }
    )
  }

  /**
   * Limpia todas las notificaciones
   */
  const clear = () => {
    // Notivue no tiene un método clear directo, pero podemos usar el store
    // Por ahora, esta función está disponible para compatibilidad futura
    console.warn('clear() no está implementado en notivue')
  }

  return {
    success,
    error,
    info,
    warning,
    promise,
    clear
  }
}