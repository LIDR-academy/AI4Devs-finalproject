/**
 * Authentication service
 * Handles user registration and authentication API calls
 */

import type { ApiError } from '@/types/api.types';
import { API_BASE_URL } from '@/config/api';

export interface RegisterRequest {
  nombre: string;
  email: string;
  contraseña: string;
}

export interface RegisterResponse {
  id: string;
  nombre: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  contraseña: string;
}

export interface LoginResponse {
  accessToken: string;
  user?: {
    id: string;
    nombre: string;
    email: string;
  };
}

/**
 * Registers a new user
 * @param data - User registration data
 * @returns Promise with user data on success
 * @throws Error with status code and message on failure
 */
export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText || 'Error desconocido',
      statusCode: response.status,
    }));

    const error: ApiError = {
      message: errorData.message || 'Error al registrar usuario',
      statusCode: response.status,
    };

    throw error;
  }

  return response.json();
}

/**
 * Logs in a user with email and password
 * @param data - User login credentials
 * @returns Promise with JWT token and user data on success
 * @throws Error with status code and message on failure
 */
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: response.statusText || 'Error desconocido',
      statusCode: response.status,
    }));

    // Parse validation errors from backend
    let errorMessage = errorData.message || 'Error al iniciar sesión';

    // If it's a validation error (400), try to extract a cleaner message
    if (response.status === 400 && Array.isArray(errorData.message)) {
      // NestJS validation errors come as an array
      errorMessage = errorData.message
        .map((err: string) => {
          // Remove technical validation messages, keep only user-friendly parts
          return err.split('must be')[0].trim();
        })
        .join('. ');
    } else if (response.status === 400 && typeof errorData.message === 'string') {
      // Clean up mixed language messages
      errorMessage = errorData.message
        .split('must be')[0] // Remove English technical part
        .split('should not be')[0] // Remove other technical parts
        .trim();
    }

    const error: ApiError = {
      message: errorMessage,
      statusCode: response.status,
    };

    throw error;
  }

  return response.json();
}
