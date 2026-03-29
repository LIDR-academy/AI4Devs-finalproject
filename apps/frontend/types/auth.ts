export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'ARCHITECT' | 'CLIENT';
  subscription: string | null;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export type RegisterResponse = User;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  confirmPassword?: string;
}
