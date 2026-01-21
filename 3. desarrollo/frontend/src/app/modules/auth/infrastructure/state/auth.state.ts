import { UserEntity } from '../../domain/entities';

/**
 * Estado de autenticación
 */
export interface AuthState {
  user: UserEntity | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  failedAttempts: number;
  remainingAttempts: number | null;
  requirePasswordChange: boolean;
  captchaRequired: boolean;
  serverOnline: boolean;
}

/**
 * Estado inicial de autenticación
 */
export const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  failedAttempts: 0,
  remainingAttempts: null,
  requirePasswordChange: false,
  captchaRequired: false,
  serverOnline: true,
};

