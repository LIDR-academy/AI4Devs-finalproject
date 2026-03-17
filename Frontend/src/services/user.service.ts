/**
 * User service
 * Handles user profile API calls (get, update)
 */

import type { ApiError } from '@/types/api.types';
import { API_BASE_URL } from '@/config/api';

const TOKEN_KEY = 'travelsplit_token';

export interface UserResponse {
  id: string;
  nombre: string;
  email: string;
  createdAt: string;
}

export interface UpdateUserPayload {
  nombre?: string;
  email?: string;
  contraseña?: string;
}

/**
 * Gets the stored JWT token from localStorage
 * @returns Token or null
 */
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Updates a user by ID (own profile only; backend enforces req.user.id === id)
 * @param id - User UUID
 * @param payload - Partial user data (nombre, email, contraseña)
 * @returns Promise with updated user on success
 * @throws ApiError on failure (403 if not own profile, 404 if not found, etc.)
 */
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserResponse> {
  const token = getToken();
  if (!token) {
    const error: ApiError = {
      message: 'Sesión no válida. Inicia sesión nuevamente.',
      statusCode: 401,
    };
    throw error;
  }

  const body: Record<string, string> = {};
  if (payload.nombre !== undefined) body.nombre = payload.nombre;
  if (payload.email !== undefined) body.email = payload.email;
  if (payload.contraseña !== undefined && payload.contraseña !== '')
    body.contraseña = payload.contraseña;

  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText || 'Error desconocido',
      statusCode: response.status,
    }));

    const error: ApiError = {
      message:
        typeof errorData.message === 'string'
          ? errorData.message
          : Array.isArray(errorData.message)
            ? errorData.message.join('. ')
            : 'Error al actualizar el perfil',
      statusCode: response.status,
    };

    throw error;
  }

  return response.json();
}
