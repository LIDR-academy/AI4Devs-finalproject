import { apiRequest } from '../../../shared/http/apiClient.js';

export interface CreateUserRequest {
  name: string;
  role: string;
  pin: string;
}

export interface CreateUserResult {
  id: string;
  name: string;
  role: string;
  status: string;
}

export interface SetUserStatusResult {
  id: string;
  status: string;
}

export interface UserListItem {
  id: string;
  name: string;
  role: string;
  status: string;
}

/**
 * Servicio separado de auth.service.ts (no user.service.ts) a propósito: apiClient.ts
 * importa AuthService para leer el token de sesión — si estos métodos vivieran en
 * auth.service.ts e importaran apiRequest de vuelta, se crearía un ciclo de módulos.
 */
export class UsersService {
  public static async listUsers(): Promise<UserListItem[]> {
    return apiRequest<UserListItem[]>('/auth/users');
  }

  public static async createUser(data: CreateUserRequest): Promise<CreateUserResult> {
    return apiRequest<CreateUserResult>('/auth/users', { method: 'POST', body: data });
  }

  public static async setUserStatus(userId: string, action: 'BLOCK' | 'ACTIVATE'): Promise<SetUserStatusResult> {
    return apiRequest<SetUserStatusResult>(`/auth/users/${encodeURIComponent(userId)}/status`, {
      method: 'PATCH',
      body: { action },
    });
  }
}
