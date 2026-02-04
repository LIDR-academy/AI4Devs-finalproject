import { AxiosError } from 'axios';

/**
 * Extrae el mensaje de error del backend (response.data.message) o fallback a error.message.
 * Útil para mostrar en formularios el mensaje real de validación/conflicto (ej. 400).
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    error instanceof AxiosError &&
    error.response?.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data
  ) {
    const msg = (error.response.data as { message?: string | string[] }).message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
