'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { cn } from '@/shared/lib/cn';
import { useVehicle } from '../hooks/useVehicle';
import { useUpdateVehicle } from '../hooks/useUpdateVehicle';
import { vehiclesApi } from '../services/vehiclesApi';
import type { ExistingVehicleSummary, Vehicle } from '../types/vehicle.types';
import { normalizeLicensePlate } from '../utils/licensePlateNormalizer';
import {
  getExistingVehicleFromError,
  mapVehiclesError,
} from '../utils/mapVehiclesError';
import {
  updateVehicleSchema,
  type UpdateVehicleFormValues,
} from '../utils/updateVehicleSchema';
import { ExistingVehicleAlert } from './ExistingVehicleAlert';

interface VehicleEditFormProps {
  vehicleId: string;
  onCancel?: () => void;
}

export function VehicleEditForm({ vehicleId, onCancel }: VehicleEditFormProps) {
  const { data: vehicle, isLoading, error: loadError } = useVehicle(vehicleId);
  const { mutateAsync, isPending, error, reset: resetMutation } = useUpdateVehicle();
  const [duplicateVehicle, setDuplicateVehicle] =
    useState<ExistingVehicleSummary | null>(null);
  const [updatedVehicle, setUpdatedVehicle] = useState<Vehicle | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<UpdateVehicleFormValues>({
    resolver: zodResolver(updateVehicleSchema),
    mode: 'onChange',
    defaultValues: {
      licensePlate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
    },
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color ?? '',
      });
    }
  }, [vehicle, reset]);

  const checkDuplicatePlate = async (licensePlate: string) => {
    const normalized = normalizeLicensePlate(licensePlate);
    if (normalized.length < 2 || normalized === vehicle?.licensePlate) {
      setDuplicateVehicle(null);
      return;
    }

    try {
      const result = await vehiclesApi.search({ licensePlate: normalized });
      if (result.items.length > 0 && result.items[0].id !== vehicleId) {
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
      // Ignore blur lookup errors
    }
  };

  const submit = async (values: UpdateVehicleFormValues) => {
    resetMutation();
    setDuplicateVehicle(null);
    setUpdatedVehicle(null);

    try {
      const result = await mutateAsync({
        id: vehicleId,
        data: {
          licensePlate: normalizeLicensePlate(values.licensePlate),
          brand: values.brand.trim(),
          model: values.model.trim(),
          year: values.year,
          color: values.color?.trim() || undefined,
        },
      });
      setUpdatedVehicle(result);
    } catch (submitError) {
      const existing = getExistingVehicleFromError(submitError);
      if (existing) {
        setDuplicateVehicle(existing);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Cargando vehículo..." />;
  }

  if (loadError || !vehicle) {
    return (
      <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        No se pudo cargar el vehículo.
      </p>
    );
  }

  if (updatedVehicle) {
    return (
      <div className="space-y-4 rounded-xl border border-green-200 bg-green-50 p-6">
        <p className="text-base font-medium text-green-900">Vehículo actualizado</p>
        <p className="text-sm text-green-800">
          {updatedVehicle.licensePlate} — {updatedVehicle.brand}{' '}
          {updatedVehicle.model} {updatedVehicle.year}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/vehicles/${updatedVehicle.id}`}>
            <Button>Ver ficha</Button>
          </Link>
          <Link href="/vehicles">
            <Button variant="secondary">Volver a búsqueda</Button>
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

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Propietario actual</p>
        <p className="mt-1">{vehicle.currentOwner?.fullName ?? 'Sin propietario'}</p>
        {vehicle.currentOwner && (
          <p>Identificación: {vehicle.currentOwner.nationalId}</p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          El cambio de propietario estará disponible en una versión futura.
        </p>
      </div>

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
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
