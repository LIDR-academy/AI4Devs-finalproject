import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { devLogin, setOnUnauthorized } from '../api/client';

interface AuthState {
  token: string | null;
  email: string | null;
  userId: string | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('access_token'),
  );
  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem('user_email'),
  );
  const [userId, setUserId] = useState<string | null>(() =>
    localStorage.getItem('user_id'),
  );

  const login = useCallback(async (userEmail: string) => {
    const res = await devLogin(userEmail);
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('user_email', res.user.email);
    localStorage.setItem('user_id', res.user.id);
    setToken(res.access_token);
    setEmail(res.user.email);
    setUserId(res.user.id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    setToken(null);
    setEmail(null);
    setUserId(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
      window.location.assign('/login');
    });
    return () => setOnUnauthorized(null);
  }, [logout]);

  const value = useMemo(
    () => ({
      token,
      email,
      userId,
      login,
      logout,
      isAuthenticated: !!token,
    }),
    [token, email, userId, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
