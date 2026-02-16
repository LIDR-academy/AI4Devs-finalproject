'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(
  /\/api\/v1\/?$/,
  ''
);

function LoginContent() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const nextPath = searchParams.get('next');
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const getPostLoginPath = useCallback(
    (role: string | undefined, candidateNextPath: string | null) => {
      const safeNextPath =
        candidateNextPath && candidateNextPath.startsWith(`/${locale}/`)
          ? candidateNextPath
          : null;

      if (safeNextPath && (role === 'patient' || role === 'client')) {
        return safeNextPath;
      }

      if (role === 'doctor') return `/${locale}/doctors/profile`;
      if (role === 'admin') return `/${locale}/admin/dashboard`;
      return `/${locale}/search`;
    },
    [locale]
  );

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    router.replace(getPostLoginPath(user?.role, nextPath));
  }, [authLoading, getPostLoginPath, isAuthenticated, nextPath, router, user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    try {
      // Por ahora, usamos el paciente de prueba
      // En producción, esto sería un endpoint de login real
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.accessToken);
        setUser(data.user);
        router.push(getPostLoginPath(data.user?.role, nextPath));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('loginTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('loginHint')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} data-testid="login-form">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('email')}
              </label>
              <input
                id="email"
                data-testid="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('password')}
              </label>
              <input
                id="password"
                data-testid="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              data-testid="login-submit"
              disabled={submitLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
        <div className="space-y-2 rounded-md border border-slate-200 bg-white p-4 text-sm">
          <p className="text-slate-700">{t('noAccountYet')}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/register`}
              className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
              data-testid="login-create-patient"
            >
              {t('createPatientAccount')}
            </Link>
            <Link
              href={`/${locale}/register/doctor`}
              className="rounded-md bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200"
              data-testid="login-create-doctor"
            >
              {t('createDoctorAccount')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-slate-600">Cargando...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
