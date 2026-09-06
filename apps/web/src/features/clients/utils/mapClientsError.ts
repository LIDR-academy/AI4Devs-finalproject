import { ApiError } from '@/shared/lib/apiError';
import type { Client } from '../types/client.types';

export function isClientConflictError(
  error: unknown,
): error is ApiError & { data: { existingClient: Client } } {
  return (
    error instanceof ApiError &&
    error.statusCode === 409 &&
    error.data?.existingClient !== undefined
  );
}

export function getExistingClientFromError(error: unknown): Client | null {
  if (!isClientConflictError(error)) {
    return null;
  }

  return error.data.existingClient;
}

export function mapClientsError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 409) {
      return 'Ya existe un cliente con esta identificación';
    }

    return Array.isArray(error.messages)
      ? error.messages.join(', ')
      : error.messages;
  }

  return 'Error de conexión. Intenta de nuevo.';
}
