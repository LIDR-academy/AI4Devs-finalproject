import { ApiError } from '@/shared/lib/apiError';

export function mapHistoryError(error: unknown, entity: 'vehicle' | 'client'): string {
  if (!(error instanceof ApiError)) {
    return 'Error al cargar el historial. Intenta de nuevo.';
  }

  if (error.statusCode === 404) {
    return entity === 'vehicle'
      ? 'Vehículo no encontrado'
      : 'Cliente no encontrado';
  }

  return 'Error al cargar el historial. Intenta de nuevo.';
}
