'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">
        Panel de administración
      </h1>
      <p className="mt-2 text-slate-600">
        Bienvenido, {user?.fullName ?? 'administrador'}.
      </p>
    </section>
  );
}
