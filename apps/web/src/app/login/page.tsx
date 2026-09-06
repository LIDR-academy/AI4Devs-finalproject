import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginPageClient } from './LoginPageClient';

export const metadata: Metadata = {
  title: 'Iniciar sesión — MecaTrack',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-600">Cargando...</p>
        </main>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
