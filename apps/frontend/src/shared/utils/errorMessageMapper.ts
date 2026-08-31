import { ApiError } from '../http/apiClient.js';

export interface UserFriendlyError {
  title: string;
  message: string;
  isSessionExpired?: boolean;
}

/**
 * Mapeador Centralizado de Mensajes de Error para Usuarios.
 * Convierte excepciones HTTP, RFC 7807 y fallos de red en mensajes en español
 * claros, empáticos y orientados a la acción para la interfaz táctil.
 */
export function mapToUserFriendlyError(error: unknown): UserFriendlyError {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return {
          title: 'Sesión Expirada',
          message: 'Tu sesión ha caducado por seguridad. Por favor, ingresa tu PIN nuevamente para continuar.',
          isSessionExpired: true,
        };
      case 403:
        return {
          title: 'Acceso Denegado',
          message:
            typeof error.message === 'string' && error.message.length > 3 && !error.message.startsWith('Error HTTP')
              ? error.message
              : 'No tienes los permisos necesarios para realizar esta operación.',
        };

      case 404:
        return {
          title: 'Recurso No Encontrado',
          message: 'El registro solicitado no fue encontrado o fue removido.',
        };
      case 409:
        return {
          title: 'Conflicto de Registro',
          message:
            typeof error.message === 'string' && error.message.length > 3 && !error.message.startsWith('Error HTTP')
              ? error.message
              : 'La operación entra en conflicto con información previamente registrada.',
        };
      case 422:
        return {
          title: 'Datos Inválidos',
          message:
            typeof error.message === 'string' && error.message.length > 3 && !error.message.startsWith('Error HTTP')
              ? error.message
              : 'Verifica los campos ingresados e intenta nuevamente.',
        };
      case 429:
        return {
          title: 'Límite de Intentos',
          message: 'Has realizado demasiados intentos. Por favor, aguarda unos segundos antes de reintentar.',
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          title: 'Servicio Incomunicado',
          message: 'Inconveniente temporal en el servidor. Por favor, reintenta en unos instantes.',
        };
      default:
        break;
    }

    if (error.message && typeof error.message === 'string' && !error.message.startsWith('Error HTTP')) {
      return {
        title: 'Atención',
        message: error.message,
      };
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('network')) {
      return {
        title: 'Sin Conexión',
        message: 'Sin conexión con el servidor. Verifica la red local e intenta de nuevo.',
      };
    }

    if (error.message && !error.message.startsWith('Error HTTP')) {
      return {
        title: 'Atención',
        message: error.message,
      };
    }
  }

  return {
    title: 'Atención',
    message: 'Ocurrió un problema al procesar la solicitud.',
  };
}
