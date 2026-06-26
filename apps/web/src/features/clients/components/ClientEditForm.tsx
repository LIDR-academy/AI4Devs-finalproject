'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { cn } from '@/shared/lib/cn';
import { useClient } from '../hooks/useClient';
import { useUpdateClient } from '../hooks/useUpdateClient';
import type { Client } from '../types/client.types';
import { mapClientsError } from '../utils/mapClientsError';
import { normalizePhoneInput } from '../utils/phoneNormalizer';
import {
  updateClientSchema,
  type UpdateClientFormValues,
} from '../utils/updateClientSchema';

interface ClientEditFormProps {
  clientId: string;
  onCancel?: () => void;
}

export function ClientEditForm({ clientId, onCancel }: ClientEditFormProps) {
  const { data: client, isLoading, error: loadError } = useClient(clientId);
  const { mutateAsync, isPending, error, reset: resetMutation } = useUpdateClient();
  const [updatedClient, setUpdatedClient] = useState<Client | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<UpdateClientFormValues>({
    resolver: zodResolver(updateClientSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        fullName: client.fullName,
        phone: client.phone ?? '',
        email: client.email ?? '',
      });
    }
  }, [client, reset]);

  const submit = async (values: UpdateClientFormValues) => {
    resetMutation();
    setUpdatedClient(null);

    try {
      const result = await mutateAsync({
        id: clientId,
        data: {
          fullName: values.fullName.trim(),
          phone: values.phone ? normalizePhoneInput(values.phone) : undefined,
          email: values.email?.trim() || undefined,
        },
      });
      setUpdatedClient(result);
    } catch {
      // Error surfaced via mutation state
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Cargando cliente..." />;
  }

  if (loadError || !client) {
    return (
      <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        No se pudo cargar el cliente.
      </p>
    );
  }

  if (updatedClient) {
    return (
      <div className="space-y-4 rounded-xl border border-green-200 bg-green-50 p-6">
        <p className="text-base font-medium text-green-900">Cliente actualizado</p>
        <p className="text-sm text-green-800">
          {updatedClient.fullName} ({updatedClient.nationalId}) fue actualizado correctamente.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/vehicles/new?clientId=${updatedClient.id}`}>
            <Button>Registrar vehículo</Button>
          </Link>
          <Link href="/clients">
            <Button variant="secondary">Volver a búsqueda</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {mapClientsError(error)}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="nationalId" className="block text-sm font-medium text-slate-700">
          Identificación
        </label>
        <input
          id="nationalId"
          value={client.nationalId}
          readOnly
          disabled
          className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-600"
        />
        <p className="text-xs text-slate-500">La identificación no se puede modificar.</p>
      </div>

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
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
          Teléfono (opcional)
        </label>
        <input
          id="phone"
          type="tel"
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
            errors.phone ? 'border-red-500' : 'border-slate-300',
          )}
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Correo electrónico (opcional)
        </label>
        <input
          id="email"
          type="email"
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

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={!isValid || isPending}>
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
