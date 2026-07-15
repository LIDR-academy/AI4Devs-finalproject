import { apiClient } from '@/shared/lib/apiClient';
import type {
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UserListItem,
} from '../types/user.types';

export const usersApi = {
  list(): Promise<UserListItem[]> {
    return apiClient<UserListItem[]>('/users');
  },

  create(data: CreateUserRequest): Promise<CreateUserResponse> {
    return apiClient<CreateUserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(userId: string, data: UpdateUserRequest): Promise<UserListItem> {
    return apiClient<UserListItem>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deactivate(userId: string): Promise<UserListItem> {
    return apiClient<UserListItem>(`/users/${userId}/deactivate`, {
      method: 'PATCH',
    });
  },
};
