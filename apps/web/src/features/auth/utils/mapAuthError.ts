import { ApiError } from '@/shared/lib/apiError';

export function mapAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    const message = Array.isArray(error.messages)
      ? error.messages.join(', ')
      : error.messages;

    if (error.statusCode === 401) {
      return 'Correo o contraseña incorrectos';
    }

    if (error.statusCode === 403) {
      return 'Tu cuenta está inactiva. Contacta al administrador del taller.';
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
