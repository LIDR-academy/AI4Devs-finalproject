'use client';

import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AppChrome } from '@/shared/components/AppChrome';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppChrome maxWidthClassName="max-w-6xl">{children}</AppChrome>
    </ProtectedRoute>
  );
}
