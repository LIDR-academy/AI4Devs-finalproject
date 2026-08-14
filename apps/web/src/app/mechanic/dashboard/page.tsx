'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { InProgressWorkOrdersWidget } from '@/features/work-orders/components/InProgressWorkOrdersWidget';

export default function MechanicDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Panel del mecánico
        </h1>
        <p className="mt-2 text-slate-600">
          Bienvenido, {user?.fullName ?? 'mecánico'}.
        </p>
      </section>
      <InProgressWorkOrdersWidget />
    </div>
  );
}
