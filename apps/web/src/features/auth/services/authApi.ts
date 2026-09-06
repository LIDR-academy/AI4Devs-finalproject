import { apiClient } from '@/shared/lib/apiClient';
import { setAccessToken } from '@/shared/lib/tokenStore';
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from '../types/auth.types';

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAccessToken(response.accessToken);
    return response;
  },

  async refresh(): Promise<RefreshResponse> {
    const response = await apiClient<RefreshResponse>('/auth/refresh', {
      method: 'POST',
    });
    setAccessToken(response.accessToken);
    return response;
  },

  async logout(): Promise<void> {
    await apiClient<void>('/auth/logout', {
      method: 'POST',
    });
  },

  async me(): Promise<AuthUser> {
    return apiClient<AuthUser>('/auth/me');
  },
};
