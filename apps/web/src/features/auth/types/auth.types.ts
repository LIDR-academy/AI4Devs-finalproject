export type UserRole = 'ADMIN' | 'MECHANIC';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Omit<AuthUser, 'active'>;
}

export interface RefreshResponse {
  accessToken: string;
}
