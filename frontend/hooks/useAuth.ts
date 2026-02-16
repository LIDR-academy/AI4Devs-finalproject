'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, User } from '@/store/authStore';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken, logout: logoutStore } = useAuthStore();

  useEffect(() => {
    const restorePersistedAuth = () => {
      if (typeof window === 'undefined') return { token: accessToken, restoredUser: user };

      const persistedToken = localStorage.getItem('accessToken');
      let restoredUser = user;

      if (!restoredUser) {
        const persistedStore = localStorage.getItem('auth-storage');
        if (persistedStore) {
          try {
            const parsed = JSON.parse(persistedStore) as {
              state?: { user?: User | null; accessToken?: string | null };
            };
            const parsedUser = parsed?.state?.user ?? null;
            const parsedToken = parsed?.state?.accessToken ?? null;

            if (parsedUser) {
              useAuthStore.getState().setUser(parsedUser);
              restoredUser = parsedUser;
            }
            if (!accessToken && parsedToken) {
              useAuthStore.getState().setToken(parsedToken);
            }
          } catch {
            // Ignorar storage corrupto y continuar con fallback normal.
          }
        }
      }

      return { token: accessToken || persistedToken, restoredUser };
    };

    const { token, restoredUser } = restorePersistedAuth();

    if (token && !restoredUser) {
      // Validar token y obtener información del usuario
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(
        /\/api\/v1\/?$/,
        ''
      );
      fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('Token inválido');
        })
        .then((data) => {
          useAuthStore.getState().setUser(data.user);
        })
        .catch(() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
          }
          logoutStore();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [accessToken, user, logoutStore]);

  const logout = () => {
    logoutStore();
    const locale = pathname?.split('/')[1];
    const nextLocale = locale === 'en' || locale === 'es' ? locale : 'es';
    router.push(`/${nextLocale}/login`);
  };

  return { user, loading, logout, isAuthenticated: !!user && !!accessToken };
}
