import { create } from 'zustand';
import { User, AuthState } from '@/types';
import authService from '@/services/auth.service';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  login: (token: string, user: User, devMode?: boolean) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  devMode: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  setLoading: (isLoading) => set({ isLoading }),

  login: (token, user, devMode = false) => {
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
      devMode,
    });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initialize: async () => {
    const token = authService.getStoredToken();
    const user = authService.getStoredUser();

    if (token && user) {
      // Carga optimista: mostrar app de inmediato con el usuario guardado
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      // Verificar perfil en segundo plano (sin bloquear la UI)
      try {
        const currentUser = await authService.getProfile();
        set({ user: currentUser });
      } catch {
        // Si falla (token expirado, red, etc.), cerrar sesión
        await authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
