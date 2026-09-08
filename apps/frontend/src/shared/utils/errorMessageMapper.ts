import { ApiError } from '../http/apiClient.js';

export interface UserFriendlyError {
  title: string;
  message: string;
  isSessionExpired?: boolean;
}

/** El `detail` RFC 7807 del backend si es sustantivo; si no, el fallback genérico. */
function preferServerMessage(error: ApiError, fallback: string): string {
  const m = error.message;
  return typeof m === 'string' && m.length > 3 && !m.startsWith('Error HTTP') ? m : fallback;
}

const SERVER_UNREACHABLE: UserFriendlyError = {
  title: 'Servicio Incomunicado',
  message: 'Inconveniente temporal en el servidor. Por favor, reintenta en unos instantes.',
};

const GENERIC_ATTENTION: UserFriendlyError = {
  title: 'Atención',
  message: 'Ocurrió un problema al procesar la solicitud.',
};

const HTTP_STATUS_MAP: Record<number, (error: ApiError) => UserFriendlyError> = {
  401: () => ({
    title: 'Sesión Expirada',
    message: 'Tu sesión ha caducado por seguridad. Por favor, ingresa tu PIN nuevamente para continuar.',
    isSessionExpired: true,
  }),
  403: (error) => ({
    title: 'Acceso Denegado',
    message: preferServerMessage(error, 'No tienes los permisos necesarios para realizar esta operación.'),
  }),
  404: () => ({
    title: 'Recurso No Encontrado',
    message: 'El registro solicitado no fue encontrado o fue removido.',
  }),
  409: (error) => ({
    title: 'Conflicto de Registro',
    message: preferServerMessage(error, 'La operación entra en conflicto con información previamente registrada.'),
  }),
  422: (error) => ({
    title: 'Datos Inválidos',
    message: preferServerMessage(error, 'Verifica los campos ingresados e intenta nuevamente.'),
  }),
  // El backend (rateLimiter.ts) devuelve el tiempo real de reintento en `detail`
  // ("Reintente en N segundos."); se propaga tal cual en vez de un genérico "unos
  // segundos" que engañaba cuando la ventana es de 15 min.
  429: (error) => ({
    title: 'Límite de Intentos',
    message: preferServerMessage(error, 'Has realizado demasiadas peticiones. Aguarda un momento antes de reintentar.'),
  }),
  500: () => SERVER_UNREACHABLE,
  502: () => SERVER_UNREACHABLE,
  503: () => SERVER_UNREACHABLE,
  504: () => SERVER_UNREACHABLE,
};

function usableMessage(message: string): boolean {
  return message.length > 0 && !message.startsWith('Error HTTP');
}

function isNetworkFailure(message: string): boolean {
  return /fetch|network/i.test(message);
}

/** Rama para un `Error` genérico que no es `ApiError` (fallo de red, error de JS suelto). */
function mapPlainError(error: Error): UserFriendlyError {
  if (isNetworkFailure(error.message)) {
    return { title: 'Sin Conexión', message: 'Sin conexión con el servidor. Verifica la red local e intenta de nuevo.' };
  }
  return usableMessage(error.message) ? { title: 'Atención', message: error.message } : GENERIC_ATTENTION;
}

/**
 * Mapeador Centralizado de Mensajes de Error para Usuarios.
 * Convierte excepciones HTTP, RFC 7807 y fallos de red en mensajes en español
 * claros, empáticos y orientados a la acción para la interfaz táctil.
 */
export function mapToUserFriendlyError(error: unknown): UserFriendlyError {
  if (error instanceof ApiError) {
    const mapped = HTTP_STATUS_MAP[error.status];
    if (mapped) {
      return mapped(error);
    }
    return typeof error.message === 'string' && usableMessage(error.message)
      ? { title: 'Atención', message: error.message }
      : GENERIC_ATTENTION;
  }

  if (error instanceof Error) {
    return mapPlainError(error);
  }

  return GENERIC_ATTENTION;
}
