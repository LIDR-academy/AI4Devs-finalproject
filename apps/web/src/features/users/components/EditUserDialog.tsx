'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { cn } from '@/shared/lib/cn';
import { useUpdateUser } from '../hooks/useUpdateUser';
import type { UpdateUserRequest, UserListItem } from '../types/user.types';
import { mapUsersError } from '../utils/mapUsersError';
import {
  updateUserSchema,
  type UpdateUserFormValues,
} from '../utils/updateUserSchema';

interface EditUserDialogProps {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const { mutateAsync, isPending, error, reset: resetMutation } = useUpdateUser();
  const [showPassword, setShowPassword] = useState(false);
  const [confirmSensitive, setConfirmSensitive] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      role: 'MECHANIC',
      resetPassword: false,
      password: '',
      canActAsMechanic: false,
    },
  });

  const role = watch('role');
  const resetPassword = watch('resetPassword');

  useEffect(() => {
    if (!open || !user) {
      return;
    }

    resetMutation();
    setConfirmSensitive(false);
    setShowPassword(false);
    reset({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      resetPassword: false,
      password: '',
      canActAsMechanic: user.canActAsMechanic === true,
    });
  }, [open, user, reset, resetMutation]);

  useEffect(() => {
    if (role !== 'ADMIN') {
      setValue('canActAsMechanic', false);
    }
  }, [role, setValue]);

  const submit = async (values: UpdateUserFormValues) => {
    if (!user) {
      return;
    }

    const roleChanged = values.role !== user.role;
    const passwordChanging = values.resetPassword === true;
    if ((roleChanged || passwordChanging) && !confirmSensitive) {
      setConfirmSensitive(true);
      return;
    }

    const body: UpdateUserRequest = {};

    const trimmedName = values.fullName.trim();
    if (trimmedName !== user.fullName) {
      body.fullName = trimmedName;
    }

    const normalizedEmail = values.email.trim().toLowerCase();
    if (normalizedEmail !== user.email) {
      body.email = normalizedEmail;
    }

    if (values.role !== user.role) {
      body.role = values.role;
    }

    if (passwordChanging && values.password) {
      body.password = values.password;
    }

    const nextCanActAsMechanic =
      values.role === 'ADMIN' ? values.canActAsMechanic === true : false;
    if (nextCanActAsMechanic !== (user.canActAsMechanic === true)) {
      body.canActAsMechanic = nextCanActAsMechanic;
    }

    if (Object.keys(body).length === 0) {
      onOpenChange(false);
      return;
    }

    resetMutation();
    try {
      await mutateAsync({ id: user.id, body });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      setConfirmSensitive(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Editar usuario">
      {user && (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          {error && (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {mapUsersError(error)}
            </p>
          )}

          {confirmSensitive && (
            <p
              role="status"
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            >
              Cambiar rol o contraseña cerrará las sesiones activas del usuario.
              Confirma de nuevo para continuar.
            </p>
          )}

          <div className="space-y-1">
            <label
              htmlFor="edit-fullName"
              className="block text-sm font-medium text-slate-700"
            >
              Nombre completo
            </label>
            <input
              id="edit-fullName"
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
            <label
              htmlFor="edit-email"
              className="block text-sm font-medium text-slate-700"
            >
              Correo electrónico
            </label>
            <input
              id="edit-email"
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
            <label
              htmlFor="edit-role"
              className="block text-sm font-medium text-slate-700"
            >
              Rol
            </label>
            <select
              id="edit-role"
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
                id="edit-canActAsMechanic"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                {...register('canActAsMechanic')}
              />
              <label
                htmlFor="edit-canActAsMechanic"
                className="text-sm text-slate-700"
              >
                También puede realizar trabajo de mecánico
              </label>
            </div>
          )}

          <div className="flex items-start gap-2">
            <input
              id="edit-resetPassword"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              {...register('resetPassword')}
            />
            <label htmlFor="edit-resetPassword" className="text-sm text-slate-700">
              Restablecer contraseña
            </label>
          </div>

          {resetPassword && (
            <div className="space-y-1">
              <label
                htmlFor="edit-password"
                className="block text-sm font-medium text-slate-700"
              >
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="edit-password"
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
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending
                ? 'Guardando...'
                : confirmSensitive
                  ? 'Confirmar y guardar'
                  : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
