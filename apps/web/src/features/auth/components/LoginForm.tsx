'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '../hooks/useLogin';
import { loginSchema, type LoginFormValues } from '../utils/loginSchema';
import { cn } from '@/shared/lib/cn';

interface LoginFormProps {
  sessionExpired?: boolean;
}

export function LoginForm({ sessionExpired = false }: LoginFormProps) {
  const { login, isPending, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <form
      onSubmit={handleSubmit(login)}
      className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      noValidate
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">MecaTrack</h1>
        <p className="text-sm text-slate-600">Iniciar sesión</p>
      </div>

      {sessionExpired && (
        <p role="status" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Tu sesión expiró. Inicia sesión de nuevo.
        </p>
      )}

      {error && (
        <p role="alert" aria-live="polite" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
              errors.email ? 'border-red-500' : 'border-slate-300',
            )}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
              errors.password ? 'border-red-500' : 'border-slate-300',
            )}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
