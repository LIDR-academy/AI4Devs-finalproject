'use client';

import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useDashboardRedirect } from '@/shared/components/ProtectedRoute';

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('session') === 'expired';

  useDashboardRedirect();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <LoginForm sessionExpired={sessionExpired} />
    </main>
  );
}
