'use client';

import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AppHeader } from '@/shared/components/AppHeader';
import { RoleNav } from '@/shared/components/RoleNav';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/shared/lib/cn';

export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const maxWidth = user?.role === 'ADMIN' ? 'max-w-6xl' : 'max-w-5xl';

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MECHANIC']}>
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <RoleNav />
        <main className={cn('mx-auto px-6 py-8', maxWidth)}>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
