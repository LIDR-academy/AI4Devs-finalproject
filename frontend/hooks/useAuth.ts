'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, User } from '@/store/authStore';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, accessToken, logout: logoutStore } = useAuthStore();

  useEffect(() => {
    const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
    
    if (token && !user) {
      // Validar token y obtener información del usuario
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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
    router.push('/login');
  };

  return { user, loading, logout, isAuthenticated: !!user && !!accessToken };
}
