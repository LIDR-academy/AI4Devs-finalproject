export enum UserRole {
  ADMIN = "ADMIN",
  COACH = "COACH",
  COACHEE = "COACHEE",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  mustChangePassword?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
