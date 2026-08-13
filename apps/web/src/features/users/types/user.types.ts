import type { UserRole } from '@/features/auth/types/auth.types';

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  canActAsMechanic: boolean;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  canActAsMechanic?: boolean;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  role?: UserRole;
  password?: string;
  canActAsMechanic?: boolean;
}

export type CreateUserResponse = UserListItem;
