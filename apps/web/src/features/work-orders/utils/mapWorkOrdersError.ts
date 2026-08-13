import { ApiError } from '@/shared/lib/apiError';

export function isActiveWorkOrderConflict(
  error: unknown,
): error is ApiError & { data: { activeWorkOrderId: string } } {
  return (
    error instanceof ApiError &&
    error.statusCode === 409 &&
    typeof error.data?.activeWorkOrderId === 'string'
  );
}

export function getActiveWorkOrderIdFromError(error: unknown): string | null {
  if (!isActiveWorkOrderConflict(error)) {
    return null;
  }

  return error.data.activeWorkOrderId;
}

function getApiErrorMessage(error: ApiError): string {
  return Array.isArray(error.messages)
    ? error.messages.join(', ')
    : error.messages;
}

export function mapTechnicalNotesError(error: unknown): string {
  if (error instanceof ApiError) {
    const message = getApiErrorMessage(error);

    if (error.statusCode === 403) {
      if (message.toLowerCase().includes('completed task')) {
        return 'No se pueden editar notas de una tarea completada';
      }

      return 'No se pueden editar las notas en el estado actual de la orden o tarea';
    }

    if (error.statusCode === 404) {
      return 'No se encontró el recurso solicitado';
    }

    if (error.statusCode === 400) {
      return message || 'El texto es demasiado largo (máximo 5000 caracteres)';
    }

    return message;
  }

  return 'Error al guardar. Intenta de nuevo.';
}

export function mapWorkOrdersError(error: unknown): string {
  if (error instanceof ApiError) {
    const message = Array.isArray(error.messages)
      ? error.messages.join(', ')
      : error.messages;
    const lower = message.toLowerCase();

    if (error.statusCode === 409) {
      if (lower.includes('task')) {
        return 'La tarea ya está completada';
      }

      return 'El vehículo ya tiene una orden de trabajo activa';
    }

    if (error.statusCode === 403) {
      return 'Esta orden ya no admite cambios en las tareas';
    }

    if (error.statusCode === 404) {
      return 'No se encontró el recurso solicitado';
    }

    if (error.statusCode === 400) {
      if (lower.includes('broughtbyname is required')) {
        return 'Indica el nombre de quien trae el vehículo';
      }
      if (lower.includes('broughtby fields are only valid')) {
        return 'Quita los datos de tercero o cambia el modo de ingreso';
      }
      if (lower.includes('vehicle has no active owner')) {
        return 'El vehículo no tiene dueño; usa “Traído por tercero”';
      }
      return message;
    }

    return message;
  }

  return 'Error de conexión. Intenta de nuevo.';
}
