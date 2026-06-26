'use client';

import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AppHeader } from '@/shared/components/AppHeader';
import { RoleNav } from '@/shared/components/RoleNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <RoleNav />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
