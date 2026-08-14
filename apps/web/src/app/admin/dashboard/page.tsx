'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { RemindersDashboardWidget } from '@/features/reminders/components/RemindersDashboardWidget';
import { InProgressWorkOrdersWidget } from '@/features/work-orders/components/InProgressWorkOrdersWidget';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Panel de administración
        </h1>
        <p className="mt-2 text-slate-600">
          Bienvenido, {user?.fullName ?? 'administrador'}.
        </p>
      </section>
      <InProgressWorkOrdersWidget />
      <RemindersDashboardWidget />
    </div>
  );
}
