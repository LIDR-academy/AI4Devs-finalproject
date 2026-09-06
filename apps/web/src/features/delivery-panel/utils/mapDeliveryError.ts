import { ApiError } from '@/shared/lib/apiError';

export function mapDeliveryError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Error al cargar el panel. Intenta de nuevo.';
  }

  if (error.statusCode === 404) {
    return 'La orden ya no está disponible en el panel';
  }

  if (error.statusCode === 409) {
    const message = Array.isArray(error.messages)
      ? error.messages.join(', ')
      : error.messages;

    if (message === 'Owner already contacted') {
      return 'El propietario ya fue marcado como contactado';
    }
    if (message === 'Work order is not ready for contact') {
      return 'Esta orden no está lista para marcar contacto';
    }
    if (message === 'Work order is not ready for delivery') {
      return 'Esta orden no está lista para entrega';
    }
    if (message === 'Work order has no owner to contact') {
      return 'Esta orden no tiene propietario para contactar.';
    }
    if (message === 'Work order is already delivered') {
      return 'Esta orden ya fue entregada';
    }

    return 'Esta orden ya fue entregada';
  }

  return 'Error al cargar el panel. Intenta de nuevo.';
}
