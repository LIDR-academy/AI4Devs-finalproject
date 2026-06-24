/**
 * Auth-related API types for the StayHub frontend.
 *
 * Mirror the backend auth contract (wire format snake_case).
 */

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user_id: string;
  first_name: string;
}
