'use client';

import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AppChrome } from '@/shared/components/AppChrome';

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MECHANIC']}>
      <AppChrome>{children}</AppChrome>
    </ProtectedRoute>
  );
}
