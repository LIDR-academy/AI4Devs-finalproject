import type { UserRole } from '@/features/auth/types/auth.types';

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export type CreateUserResponse = UserListItem;
