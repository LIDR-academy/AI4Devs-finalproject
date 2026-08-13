import { ApiError } from '@/shared/lib/apiError';

export function mapAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    const message = Array.isArray(error.messages)
      ? error.messages.join(', ')
      : error.messages;

    // Login failures are intentionally generic (US-014): wrong credentials and
    // inactive accounts both surface as 401 from the API.
    if (error.statusCode === 401 || error.statusCode === 403) {
      return 'Correo o contraseña incorrectos';
    }

    if (error.statusCode === 429) {
      return 'Demasiados intentos. Intenta de nuevo más tarde.';
    }

    if (error.statusCode === 400) {
      return message;
    }
  }

  return 'Error de conexión. Verifica tu red e intenta de nuevo.';
}
