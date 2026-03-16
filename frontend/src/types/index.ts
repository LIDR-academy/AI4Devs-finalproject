export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  username: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  devMode?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
  devMode?: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
