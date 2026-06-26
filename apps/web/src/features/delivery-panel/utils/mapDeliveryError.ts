import { ApiError } from '@/shared/lib/apiError';

export function mapDeliveryError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Error al cargar el panel. Intenta de nuevo.';
  }

  if (error.statusCode === 404) {
    return 'La orden ya no está disponible en el panel';
  }

  if (error.statusCode === 409) {
    return 'Esta orden ya fue entregada';
  }

  return 'Error al cargar el panel. Intenta de nuevo.';
}
