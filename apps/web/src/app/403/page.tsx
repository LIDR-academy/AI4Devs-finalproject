'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getDashboardPath } from '@/features/auth/utils/roleRedirect';

export default function ForbiddenPage() {
  const { user } = useAuth();
  const dashboardPath = user ? getDashboardPath(user.role) : '/login';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">403</h1>
      <p className="mt-2 max-w-md text-slate-600">
        No tienes permiso para acceder a esta página.
      </p>
      <Link
        href={dashboardPath}
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Volver
      </Link>
    </main>
  );
}
