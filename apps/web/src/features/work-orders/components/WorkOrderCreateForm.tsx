'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/cn';
import type { Vehicle } from '@/features/vehicles/types/vehicle.types';
import { useCreateWorkOrder } from '../hooks/useCreateWorkOrder';
import {
  createWorkOrderSchema,
  type CreateWorkOrderFormValues,
} from '../utils/createWorkOrderSchema';
import {
  getActiveWorkOrderIdFromError,
  mapWorkOrdersError,
} from '../utils/mapWorkOrdersError';
import { ActiveWorkOrderBanner } from './ActiveWorkOrderBanner';
import { InitialTasksEditor } from './InitialTasksEditor';
import { MechanicSelect } from './MechanicSelect';

interface WorkOrderCreateFormProps {
  vehicle: Vehicle;
  onChangeVehicle: () => void;
  blockedByActiveWorkOrder?: boolean;
}

export function WorkOrderCreateForm({
  vehicle,
  onChangeVehicle,
  blockedByActiveWorkOrder = false,
}: WorkOrderCreateFormProps) {
  const router = useRouter();
  const { mutateAsync, isPending, error, reset: resetMutation } =
    useCreateWorkOrder();
  const [conflictWorkOrderId, setConflictWorkOrderId] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateWorkOrderFormValues>({
    resolver: zodResolver(createWorkOrderSchema),
    mode: 'onChange',
    defaultValues: {
      vehicleId: vehicle.id,
      entryReason: '',
      mileage: 0,
      assignedMechanicId: '',
      initialTasks: [{ description: '' }],
    },
  });

  const assignedMechanicId = watch('assignedMechanicId') ?? '';

  useEffect(() => {
    setValue('vehicleId', vehicle.id, { shouldValidate: true });
  }, [vehicle.id, setValue]);

  const submit = async (values: CreateWorkOrderFormValues) => {
    resetMutation();
    setConflictWorkOrderId(null);

    try {
      const workOrder = await mutateAsync({
        vehicleId: values.vehicleId,
        entryReason: values.entryReason.trim(),
        mileage: values.mileage,
        assignedMechanicId: values.assignedMechanicId || undefined,
        initialTasks: values.initialTasks.map((task) => ({
          description: task.description.trim(),
        })),
      });
      router.push(`/work-orders/${workOrder.id}`);
    } catch (submitError) {
      const activeWorkOrderId = getActiveWorkOrderIdFromError(submitError);
      if (activeWorkOrderId) {
        setConflictWorkOrderId(activeWorkOrderId);
      }
    }
  };

  const isDisabled = blockedByActiveWorkOrder || isPending;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Vehículo seleccionado</p>
            <p className="text-lg font-semibold tracking-wide text-slate-900">
              {vehicle.licensePlate}
            </p>
            <p className="text-sm text-slate-700">
              {vehicle.brand} {vehicle.model} · {vehicle.year}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Propietario: {vehicle.currentOwner.fullName} (
              {vehicle.currentOwner.nationalId})
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={onChangeVehicle}>
            Cambiar vehículo
          </Button>
        </div>
      </div>

      {conflictWorkOrderId && (
        <ActiveWorkOrderBanner
          activeWorkOrder={{
            id: conflictWorkOrderId,
            status: 'EN_PROCESO',
            checkedInAt: new Date().toISOString(),
          }}
        />
      )}

      <form
        onSubmit={handleSubmit(submit)}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        noValidate
      >
        {error && !conflictWorkOrderId && (
          <p
            role="alert"
            aria-live="polite"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {mapWorkOrdersError(error)}
          </p>
        )}

        <div className="space-y-1">
          <label
            htmlFor="entryReason"
            className="block text-sm font-medium text-slate-700"
          >
            Motivo de ingreso
          </label>
          <textarea
            id="entryReason"
            rows={3}
            disabled={isDisabled}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
              errors.entryReason ? 'border-red-500' : 'border-slate-300',
            )}
            {...register('entryReason')}
          />
          {errors.entryReason && (
            <p className="text-sm text-red-600">{errors.entryReason.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="mileage"
            className="block text-sm font-medium text-slate-700"
          >
            Kilometraje
          </label>
          <input
            id="mileage"
            type="number"
            min={0}
            disabled={isDisabled}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
              errors.mileage ? 'border-red-500' : 'border-slate-300',
            )}
            {...register('mileage', { valueAsNumber: true })}
          />
          {errors.mileage && (
            <p className="text-sm text-red-600">{errors.mileage.message}</p>
          )}
        </div>

        <MechanicSelect
          value={assignedMechanicId}
          onChange={(value) =>
            setValue('assignedMechanicId', value, { shouldValidate: true })
          }
          disabled={isDisabled}
        />

        <InitialTasksEditor
          control={control}
          register={register}
          errors={errors}
          disabled={isDisabled}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!isValid || isDisabled}>
            {isPending ? 'Creando...' : 'Crear orden de trabajo'}
          </Button>
        </div>
      </form>
    </div>
  );
}
