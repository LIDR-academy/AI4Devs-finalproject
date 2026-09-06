'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/cn';
import { useCreateClient } from '../hooks/useCreateClient';
import { clientsApi } from '../services/clientsApi';
import {
  createClientSchema,
  type CreateClientFormValues,
} from '../utils/createClientSchema';
import {
  getExistingClientFromError,
  mapClientsError,
} from '../utils/mapClientsError';
import { normalizePhoneInput } from '../utils/phoneNormalizer';
import type { Client } from '../types/client.types';
import { ExistingClientAlert } from './ExistingClientAlert';

interface ClientFormProps {
  onCancel?: () => void;
}

export function ClientForm({ onCancel }: ClientFormProps) {
  const { mutateAsync, isPending, error, reset: resetMutation } = useCreateClient();
  const [duplicateClient, setDuplicateClient] = useState<Client | null>(null);
  const [createdClient, setCreatedClient] = useState<Client | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      nationalId: '',
      phone: '',
      email: '',
    },
  });

  const checkDuplicateNationalId = async (nationalId: string) => {
    const trimmed = nationalId.trim();
    if (trimmed.length < 5) {
      return;
    }

    try {
      const result = await clientsApi.search({ nationalId: trimmed });
      if (result.items.length > 0) {
        setDuplicateClient(result.items[0]);
      } else {
        setDuplicateClient(null);
      }
    } catch {
      // Ignore blur lookup errors; submit will surface them
    }
  };

  const submit = async (values: CreateClientFormValues) => {
    resetMutation();
    setDuplicateClient(null);
    setCreatedClient(null);

    try {
      const client = await mutateAsync({
        fullName: values.fullName.trim(),
        nationalId: values.nationalId.trim(),
        phone: values.phone ? normalizePhoneInput(values.phone) : undefined,
        email: values.email?.trim() || undefined,
      });
      reset();
      setCreatedClient(client);
    } catch (submitError) {
      const existing = getExistingClientFromError(submitError);
      if (existing) {
        setDuplicateClient(existing);
      }
    }
  };

  if (createdClient) {
    return (
      <div className="space-y-4 rounded-xl border border-green-200 bg-green-50 p-6">
        <p className="text-base font-medium text-green-900">
          Cliente registrado
        </p>
        <p className="text-sm text-green-800">
          {createdClient.fullName} ({createdClient.nationalId}) fue creado correctamente.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/vehicles/new?clientId=${createdClient.id}`}>
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
      {duplicateClient && <ExistingClientAlert client={duplicateClient} />}

      {error && !duplicateClient && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {mapClientsError(error)}
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
        <label htmlFor="nationalId" className="block text-sm font-medium text-slate-700">
          Identificación
        </label>
        <input
          id="nationalId"
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
            errors.nationalId ? 'border-red-500' : 'border-slate-300',
          )}
          {...register('nationalId', {
            onBlur: (event) => {
              void checkDuplicateNationalId(event.target.value);
            },
          })}
        />
        {errors.nationalId && (
          <p className="text-sm text-red-600">{errors.nationalId.message}</p>
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
        <Button type="submit" disabled={!isValid || isPending || !!duplicateClient}>
          {isPending ? 'Guardando...' : 'Registrar cliente'}
        </Button>
      </div>
    </form>
  );
}
