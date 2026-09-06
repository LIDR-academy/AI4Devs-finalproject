import { ApiError } from '@/shared/lib/apiError';
import type { ExistingVehicleSummary } from '../types/vehicle.types';

export function isVehicleConflictError(
  error: unknown,
): error is ApiError & { data: { existingVehicle: ExistingVehicleSummary } } {
  return (
    error instanceof ApiError &&
    error.statusCode === 409 &&
    error.data?.existingVehicle !== undefined
  );
}

export function getExistingVehicleFromError(
  error: unknown,
): ExistingVehicleSummary | null {
  if (!isVehicleConflictError(error)) {
    return null;
  }

  return error.data.existingVehicle;
}

export function mapVehiclesError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 409) {
      if (
        typeof error.messages === 'string' &&
        error.messages.includes('work orders')
      ) {
        return 'No se puede eliminar un vehículo con órdenes de trabajo';
      }

      return 'Ya existe un vehículo con esta placa';
    }

    if (error.statusCode === 404) {
      return 'No se encontró el recurso solicitado';
    }

    return Array.isArray(error.messages)
      ? error.messages.join(', ')
      : error.messages;
  }

  return 'Error de conexión. Intenta de nuevo.';
}
