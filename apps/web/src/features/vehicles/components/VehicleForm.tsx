'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Client } from '@/features/clients/types/client.types';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/cn';
import { useCreateVehicle } from '../hooks/useCreateVehicle';
import { vehiclesApi } from '../services/vehiclesApi';
import type { ExistingVehicleSummary, Vehicle } from '../types/vehicle.types';
import {
  createVehicleSchema,
  type CreateVehicleFormValues,
} from '../utils/createVehicleSchema';
import { normalizeLicensePlate } from '../utils/licensePlateNormalizer';
import {
  getExistingVehicleFromError,
  mapVehiclesError,
} from '../utils/mapVehiclesError';
import { ClientPicker } from './ClientPicker';
import { ExistingVehicleAlert } from './ExistingVehicleAlert';

interface VehicleFormProps {
  readOnlyClient?: Client | null;
  onCancel?: () => void;
}

export function VehicleForm({ readOnlyClient = null, onCancel }: VehicleFormProps) {
  const { mutateAsync, isPending, error, reset: resetMutation } = useCreateVehicle();
  const [duplicateVehicle, setDuplicateVehicle] =
    useState<ExistingVehicleSummary | null>(null);
  const [createdVehicle, setCreatedVehicle] = useState<Vehicle | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    readOnlyClient,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateVehicleFormValues>({
    resolver: zodResolver(createVehicleSchema),
    mode: 'onChange',
    defaultValues: {
      licensePlate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      withoutOwner: false,
      clientId: readOnlyClient?.id ?? '',
    },
  });

  const clientId = watch('clientId');
  const withoutOwner = watch('withoutOwner');

  useEffect(() => {
    if (readOnlyClient) {
      setValue('clientId', readOnlyClient.id, { shouldValidate: true });
      setValue('withoutOwner', false, { shouldValidate: true });
      setSelectedClient(readOnlyClient);
    }
  }, [readOnlyClient, setValue]);

  useEffect(() => {
    if (withoutOwner) {
      setSelectedClient(null);
      setValue('clientId', '', { shouldValidate: true });
    }
  }, [withoutOwner, setValue]);

  const checkDuplicatePlate = async (licensePlate: string) => {
    const normalized = normalizeLicensePlate(licensePlate);
    if (normalized.length < 2) {
      return;
    }

    try {
      const result = await vehiclesApi.search({ licensePlate: normalized });
      if (result.items.length > 0) {
        const match = result.items[0];
        setDuplicateVehicle({
          id: match.id,
          licensePlate: match.licensePlate,
          brand: match.brand,
          model: match.model,
          year: match.year,
        });
      } else {
        setDuplicateVehicle(null);
      }
    } catch {
      // Ignore blur lookup errors; submit will surface them
    }
  };

  const handleClientChange = (client: Client) => {
    setSelectedClient(client);
    setValue('withoutOwner', false, { shouldValidate: true });
    setValue('clientId', client.id, { shouldValidate: true });
  };

  const submit = async (values: CreateVehicleFormValues) => {
    resetMutation();
    setDuplicateVehicle(null);
    setCreatedVehicle(null);

    try {
      const vehicle = await mutateAsync({
        licensePlate: normalizeLicensePlate(values.licensePlate),
        brand: values.brand.trim(),
        model: values.model.trim(),
        year: values.year,
        color: values.color?.trim() || undefined,
        ...(values.withoutOwner || !values.clientId
          ? {}
          : { clientId: values.clientId }),
      });
      reset({
        licensePlate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        withoutOwner: false,
        clientId: readOnlyClient?.id ?? '',
      });
      setSelectedClient(readOnlyClient);
      setCreatedVehicle(vehicle);
    } catch (submitError) {
      const existing = getExistingVehicleFromError(submitError);
      if (existing) {
        setDuplicateVehicle(existing);
      }
    }
  };

  if (createdVehicle) {
    return (
      <div className="space-y-4 rounded-xl border border-green-200 bg-green-50 p-6">
        <p className="text-base font-medium text-green-900">
          Vehículo registrado
        </p>
        <p className="text-sm text-green-800">
          {createdVehicle.licensePlate} — {createdVehicle.brand}{' '}
          {createdVehicle.model} {createdVehicle.year}
        </p>
        <p className="text-sm text-green-800">
          {createdVehicle.currentOwner
            ? `Propietario: ${createdVehicle.currentOwner.fullName}`
            : 'Sin propietario'}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/work-orders/new?vehicleId=${createdVehicle.id}`}>
            <Button>Crear orden de trabajo</Button>
          </Link>
          <Link href={`/vehicles/${createdVehicle.id}`}>
            <Button variant="secondary">Ver ficha</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      {duplicateVehicle && <ExistingVehicleAlert vehicle={duplicateVehicle} />}

      {error && !duplicateVehicle && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {mapVehiclesError(error)}
        </p>
      )}

      <div className="space-y-1">
        <label
          htmlFor="licensePlate"
          className="block text-sm font-medium text-slate-700"
        >
          Placa
        </label>
        <input
          id="licensePlate"
          className={cn(
            'w-full rounded-lg border px-3 py-2 uppercase text-slate-900 outline-none ring-blue-500 focus:ring-2',
            errors.licensePlate ? 'border-red-500' : 'border-slate-300',
          )}
          {...register('licensePlate', {
            onChange: (event) => {
              event.target.value = event.target.value.toUpperCase();
            },
            onBlur: (event) => {
              void checkDuplicatePlate(event.target.value);
            },
          })}
        />
        {errors.licensePlate && (
          <p className="text-sm text-red-600">{errors.licensePlate.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="brand" className="block text-sm font-medium text-slate-700">
            Marca
          </label>
          <input
            id="brand"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
              errors.brand ? 'border-red-500' : 'border-slate-300',
            )}
            {...register('brand')}
          />
          {errors.brand && (
            <p className="text-sm text-red-600">{errors.brand.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="model" className="block text-sm font-medium text-slate-700">
            Modelo
          </label>
          <input
            id="model"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
              errors.model ? 'border-red-500' : 'border-slate-300',
            )}
            {...register('model')}
          />
          {errors.model && (
            <p className="text-sm text-red-600">{errors.model.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="year" className="block text-sm font-medium text-slate-700">
            Año
          </label>
          <input
            id="year"
            type="number"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
              errors.year ? 'border-red-500' : 'border-slate-300',
            )}
            {...register('year', { valueAsNumber: true })}
          />
          {errors.year && (
            <p className="text-sm text-red-600">{errors.year.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="color" className="block text-sm font-medium text-slate-700">
            Color (opcional)
          </label>
          <input
            id="color"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
              errors.color ? 'border-red-500' : 'border-slate-300',
            )}
            {...register('color')}
          />
          {errors.color && (
            <p className="text-sm text-red-600">{errors.color.message}</p>
          )}
        </div>
      </div>

      {!readOnlyClient && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <label className="flex items-start gap-2 text-sm text-slate-800">
            <input
              type="checkbox"
              className="mt-0.5"
              {...register('withoutOwner')}
            />
            <span>
              <span className="font-medium">Registrar sin propietario</span>
              <span className="mt-0.5 block text-slate-600">
                Útil cuando lo trae un taller externo; se puede asociar dueño
                después.
              </span>
            </span>
          </label>
        </div>
      )}

      {!withoutOwner && (
        <ClientPicker
          value={clientId || null}
          onChange={handleClientChange}
          readOnlyClient={readOnlyClient}
          selectedClient={selectedClient}
          error={errors.clientId?.message}
        />
      )}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={!isValid || isPending || !!duplicateVehicle}
        >
          {isPending ? 'Guardando...' : 'Registrar vehículo'}
        </Button>
      </div>
    </form>
  );
}
