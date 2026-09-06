'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/cn';
import { useCreateUser } from '../hooks/useCreateUser';
import {
  createUserSchema,
  type CreateUserFormValues,
} from '../utils/createUserSchema';
import { mapUsersError } from '../utils/mapUsersError';

interface UserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ onSuccess, onCancel }: UserFormProps) {
  const { mutateAsync, isPending, error, reset: resetMutation } = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'MECHANIC',
      canActAsMechanic: false,
    },
  });

  const role = watch('role');

  useEffect(() => {
    if (role !== 'ADMIN') {
      setValue('canActAsMechanic', false);
    }
  }, [role, setValue]);

  const submit = async (values: CreateUserFormValues) => {
    resetMutation();
    try {
      await mutateAsync({
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        role: values.role,
        canActAsMechanic:
          values.role === 'ADMIN' ? values.canActAsMechanic === true : false,
      });
      reset();
      onSuccess?.();
    } catch {
      // Error surfaced via mutation state
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      {error && (
        <p role="alert" aria-live="polite" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {mapUsersError(error)}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
          Nombre completo
        </label>
        <input
          id="fullName"
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
            errors.fullName ? 'border-red-500' : 'border-slate-300',
          )}
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="off"
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
          Contraseña temporal
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={cn(
              'w-full rounded-lg border px-3 py-2 pr-24 text-slate-900 outline-none ring-blue-500 focus:ring-2',
              errors.password ? 'border-red-500' : 'border-slate-300',
            )}
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-600 hover:text-slate-900"
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="block text-sm font-medium text-slate-700">
          Rol
        </label>
        <select
          id="role"
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
            errors.role ? 'border-red-500' : 'border-slate-300',
          )}
          {...register('role')}
        >
          <option value="MECHANIC">Mecánico</option>
          <option value="ADMIN">Administrador</option>
        </select>
        {errors.role && (
          <p className="text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {role === 'ADMIN' && (
        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <input
            id="canActAsMechanic"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            {...register('canActAsMechanic')}
          />
          <label htmlFor="canActAsMechanic" className="text-sm text-slate-700">
            También puede realizar trabajo de mecánico
          </label>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={!isValid || isPending}>
          {isPending ? 'Guardando...' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  );
}
