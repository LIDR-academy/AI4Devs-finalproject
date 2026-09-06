'use client';

import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AppChrome } from '@/shared/components/AppChrome';

export default function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['MECHANIC']}>
      <AppChrome maxWidthClassName="max-w-5xl">{children}</AppChrome>
    </ProtectedRoute>
  );
}
