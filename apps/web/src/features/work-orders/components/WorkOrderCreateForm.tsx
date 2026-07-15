'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { cn } from '@/shared/lib/cn';
import type { Vehicle } from '@/features/vehicles/types/vehicle.types';
import { useVehicleHistory } from '@/features/history/hooks/useVehicleHistory';
import { useCreateWorkOrder } from '../hooks/useCreateWorkOrder';
import {
  createWorkOrderSchema,
  type CreateWorkOrderFormValues,
} from '../utils/createWorkOrderSchema';
import {
  getActiveWorkOrderIdFromError,
  mapWorkOrdersError,
} from '../utils/mapWorkOrdersError';
import {
  getPreviousVisitMileage,
  isMileageDecrease,
  lowerMileageConfirmMessage,
  resolveMileageBaseline,
} from '../utils/mileageDecrease';
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
  const { data: history } = useVehicleHistory(vehicle.id);
  const [conflictWorkOrderId, setConflictWorkOrderId] = useState<string | null>(
    null,
  );
  const [pendingValues, setPendingValues] =
    useState<CreateWorkOrderFormValues | null>(null);
  const [confirmLowerOpen, setConfirmLowerOpen] = useState(false);

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
      mileage: null,
      assignedMechanicId: '',
      intakeMode: vehicle.currentOwner ? 'OWNER' : 'THIRD_PARTY',
      broughtByName: '',
      broughtByPhone: '',
      vehicleHasOwner: Boolean(vehicle.currentOwner),
      initialTasks: [{ description: '' }],
    },
  });

  const assignedMechanicId = watch('assignedMechanicId') ?? '';
  const intakeMode = watch('intakeMode');

  const baseline = useMemo(
    () =>
      resolveMileageBaseline(
        getPreviousVisitMileage(history?.visits ?? []),
        null,
      ),
    [history?.visits],
  );

  useEffect(() => {
    setValue('vehicleId', vehicle.id, { shouldValidate: true });
    setValue('vehicleHasOwner', Boolean(vehicle.currentOwner), {
      shouldValidate: true,
    });
    setValue(
      'intakeMode',
      vehicle.currentOwner ? 'OWNER' : 'THIRD_PARTY',
      { shouldValidate: true },
    );
  }, [vehicle.id, vehicle.currentOwner, setValue]);

  const createWorkOrder = async (values: CreateWorkOrderFormValues) => {
    resetMutation();
    setConflictWorkOrderId(null);

    try {
      const workOrder = await mutateAsync({
        vehicleId: values.vehicleId,
        entryReason: values.entryReason.trim(),
        mileage: values.mileage,
        assignedMechanicId: values.assignedMechanicId || undefined,
        intakeMode: values.intakeMode,
        initialTasks: values.initialTasks.map((task) => ({
          description: task.description.trim(),
        })),
        ...(values.intakeMode === 'THIRD_PARTY'
          ? {
              broughtByName: values.broughtByName?.trim() ?? '',
              broughtByPhone: values.broughtByPhone?.trim() || null,
            }
          : {}),
      });
      setConfirmLowerOpen(false);
      setPendingValues(null);
      router.push(`/work-orders/${workOrder.id}`);
    } catch (submitError) {
      const activeWorkOrderId = getActiveWorkOrderIdFromError(submitError);
      if (activeWorkOrderId) {
        setConflictWorkOrderId(activeWorkOrderId);
      }
      setConfirmLowerOpen(false);
    }
  };

  const submit = async (values: CreateWorkOrderFormValues) => {
    if (
      isMileageDecrease(values.mileage, baseline) &&
      values.mileage !== null &&
      baseline !== null
    ) {
      setPendingValues(values);
      setConfirmLowerOpen(true);
      return;
    }

    await createWorkOrder(values);
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
              {vehicle.currentOwner
                ? `Propietario: ${vehicle.currentOwner.fullName} (${vehicle.currentOwner.nationalId})`
                : 'Sin propietario'}
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

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">
            Quién trae el vehículo
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input
                type="radio"
                value="OWNER"
                disabled={isDisabled || !vehicle.currentOwner}
                {...register('intakeMode')}
              />
              Dueño / cliente
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input
                type="radio"
                value="THIRD_PARTY"
                disabled={isDisabled}
                {...register('intakeMode')}
              />
              Traído por tercero
            </label>
          </div>
          {errors.intakeMode && (
            <p className="text-sm text-red-600">{errors.intakeMode.message}</p>
          )}
          {!vehicle.currentOwner && (
            <p className="text-sm text-amber-800">
              Este vehículo no tiene dueño en ficha; usa “Traído por tercero”.
            </p>
          )}
          {vehicle.currentOwner && intakeMode === 'THIRD_PARTY' && (
            <p className="text-sm text-amber-800">
              Esta visita no asociará al dueño de la ficha.
            </p>
          )}
        </fieldset>

        {intakeMode === 'THIRD_PARTY' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="broughtByName"
                className="block text-sm font-medium text-slate-700"
              >
                Nombre de quien lo trae
              </label>
              <input
                id="broughtByName"
                disabled={isDisabled}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
                  errors.broughtByName ? 'border-red-500' : 'border-slate-300',
                )}
                {...register('broughtByName')}
              />
              {errors.broughtByName && (
                <p className="text-sm text-red-600">
                  {errors.broughtByName.message}
                </p>
              )}
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="broughtByPhone"
                className="block text-sm font-medium text-slate-700"
              >
                Teléfono (opcional)
              </label>
              <input
                id="broughtByPhone"
                inputMode="numeric"
                disabled={isDisabled}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
                  errors.broughtByPhone ? 'border-red-500' : 'border-slate-300',
                )}
                {...register('broughtByPhone')}
              />
              {errors.broughtByPhone && (
                <p className="text-sm text-red-600">
                  {errors.broughtByPhone.message}
                </p>
              )}
            </div>
          </div>
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
            {...register('mileage', {
              setValueAs: (value) =>
                value === '' || value === null || value === undefined
                  ? null
                  : Number(value),
            })}
          />
          {errors.mileage && (
            <p className="text-sm text-red-600">{errors.mileage.message}</p>
          )}
          <p className="text-sm text-slate-500">
            Puede completarse más adelante (p. ej. vehículo varado)
          </p>
          {baseline !== null && (
            <p className="text-sm text-slate-500">
              Último registrado: {baseline.toLocaleString('es-CR')} km
            </p>
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

      <Modal
        open={confirmLowerOpen}
        onOpenChange={(next) => {
          if (!next) {
            setConfirmLowerOpen(false);
            setPendingValues(null);
          }
        }}
        title="Kilometraje menor al anterior"
      >
        {pendingValues?.mileage != null && baseline !== null && (
          <p className="mb-4 text-sm text-amber-900">
            {lowerMileageConfirmMessage(pendingValues.mileage, baseline)}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setConfirmLowerOpen(false);
              setPendingValues(null);
            }}
            disabled={isPending}
          >
            Revisar
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (pendingValues) {
                void createWorkOrder(pendingValues);
              }
            }}
            disabled={isPending}
          >
            {isPending ? 'Creando...' : 'Sí, crear igual'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
