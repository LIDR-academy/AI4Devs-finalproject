import { useState, useEffect, useCallback } from 'react';
import { loginUser, type LoginRequest, type LoginResponse } from '@/services/auth.service';

const TOKEN_KEY = 'travelsplit_token';
const USER_KEY = 'travelsplit_user';

interface User {
  id: string;
  nombre: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

/**
 * Custom hook for authentication management
 * Handles login, logout, token persistence, and auth state
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });

  /**
   * Checks if user is authenticated by reading from localStorage
   */
  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (token && userStr) {
        const user = JSON.parse(userStr);
        // Basic token validation - just check if it exists
        // In production, you might want to decode and check expiration
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          isLoading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      }
    } catch {
      // If there's an error reading from localStorage, clear it
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  }, []);

  /**
   * Logs in a user with email and password
   * @param credentials - User login credentials
   * @returns Promise that resolves when login is successful
   */
  const login = useCallback(async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await loginUser(credentials);

    // Store token and user data in localStorage first
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    if (response.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    // Update state synchronously after localStorage
    setAuthState({
      isAuthenticated: true,
      user: response.user || null,
      token: response.accessToken,
      isLoading: false,
    });

    return response;
  }, []);

  /**
   * Logs out the current user
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}
