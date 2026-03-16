export interface UserProfile {
  id: number;
  email: string;
  is_admin: boolean;
  is_active: boolean;
}

export interface AuthSession {
  email: string;
  apiKey?: string;
  isAuthenticated: boolean;
}
