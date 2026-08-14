import { ApiError } from '@/shared/lib/apiError';

export function mapRemindersError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 403) {
      return 'No tienes permiso para acceder a recordatorios.';
    }
    if (error.statusCode === 404) {
      return 'Vehículo no encontrado.';
    }
    if (error.statusCode === 400) {
      const message = error.message.toLowerCase();
      if (message.includes('at most 100')) {
        return 'Demasiados vehículos seleccionados (máximo 100).';
      }
      if (message.includes('empty') || message.includes('at least')) {
        return 'Selecciona al menos un vehículo.';
      }
      return 'No se pudo completar la operación. Revisa los datos e intenta de nuevo.';
    }
  }

  return 'No se pudo completar la operación. Intenta de nuevo.';
}
