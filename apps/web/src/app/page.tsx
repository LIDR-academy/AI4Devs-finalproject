'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getDashboardPath } from '@/features/auth/utils/roleRedirect';

export default function HomePage() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated && user) {
      router.replace(getDashboardPath(user.role));
      return;
    }

    router.replace('/login');
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-600">Cargando...</p>
    </main>
  );
}
