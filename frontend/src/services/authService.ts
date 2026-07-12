/**
 * Auth service — register and login mutations.
 *
 * On success of either mutation, the JWT is stored in localStorage under
 * 'auth_token' (same key used by apiClient's default auth getter).
 */

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, type NormalizedApiError } from './apiClient';
import type { RegisterRequest, LoginRequest, AuthResponse } from '@/types/auth';

export type { RegisterRequest, LoginRequest, AuthResponse };

/**
 * Mutation: POST /api/v1/auth/register
 *
 * On success, stores the issued JWT in localStorage.
 */
export function useRegister(): UseMutationResult<
  AuthResponse,
  NormalizedApiError,
  RegisterRequest
> {
  return useMutation({
    mutationFn: async (request: RegisterRequest) => {
      const response = await apiClient.post<AuthResponse>(
        '/api/v1/auth/register',
        request,
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
      }
    },
  });
}

/**
 * Mutation: POST /api/v1/auth/login
 *
 * On success, stores the issued JWT in localStorage.
 */
export function useLogin(): UseMutationResult<
  AuthResponse,
  NormalizedApiError,
  LoginRequest
> {
  return useMutation({
    mutationFn: async (request: LoginRequest) => {
      const response = await apiClient.post<AuthResponse>(
        '/api/v1/auth/login',
        request,
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
      }
    },
  });
}
