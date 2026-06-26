'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { useVisitNotes } from '../hooks/useVisitNotes';
import type { WorkOrderDetail } from '../types/work-order.types';
import { mapTechnicalNotesError } from '../utils/mapWorkOrdersError';
import {
  visitNotesSchema,
  workOrderToVisitFormValues,
  toVisitNotesRequest,
  type VisitNotesFormValues,
} from '../utils/technicalNotesSchema';
import { TechnicalNotesField } from './TechnicalNotesField';

const VISIT_NOTE_FIELDS = [
  { label: 'Diagnóstico general', key: 'visitDiagnosis' as const },
  { label: 'Resumen de reparación', key: 'visitRepairSummary' as const },
  { label: 'Repuestos (visita)', key: 'visitPartsUsed' as const },
  { label: 'Observaciones generales', key: 'visitAdditionalNotes' as const },
];

interface WorkOrderVisitNotesFormProps {
  workOrder: WorkOrderDetail;
  onSaveSuccess?: () => void;
}

function VisitNotesReadOnly({ workOrder }: { workOrder: WorkOrderDetail }) {
  return (
    <div className="space-y-3">
      {VISIT_NOTE_FIELDS.map((field) => (
        <TechnicalNotesField
          key={field.key}
          id={`visit-readonly-${field.key}`}
          name={field.key}
          label={field.label}
          readOnly
          value={workOrder[field.key]}
        />
      ))}
    </div>
  );
}

export function WorkOrderVisitNotesForm({
  workOrder,
  onSaveSuccess,
}: WorkOrderVisitNotesFormProps) {
  const isEditable = workOrder.status === 'EN_PROCESO';
  const { mutateAsync, isPending, error, reset: resetMutation } =
    useVisitNotes(workOrder.id);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<VisitNotesFormValues>({
    resolver: zodResolver(visitNotesSchema),
    mode: 'onChange',
    defaultValues: workOrderToVisitFormValues(workOrder),
  });

  useEffect(() => {
    reset(workOrderToVisitFormValues(workOrder));
  }, [workOrder, reset]);

  const submit = async (values: VisitNotesFormValues) => {
    resetMutation();
    try {
      const payload = toVisitNotesRequest(values);
      await mutateAsync(payload);
      reset(workOrderToVisitFormValues(payload));
      onSaveSuccess?.();
    } catch {
      // Error surfaced below
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Notas generales de la visita
      </h2>

      {isEditable ? (
        <form
          onSubmit={handleSubmit(submit)}
          className="mt-4 space-y-4"
          noValidate
        >
          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {mapTechnicalNotesError(error)}
            </p>
          )}

          {VISIT_NOTE_FIELDS.map((field) => (
            <TechnicalNotesField
              key={field.key}
              id={`visit-${field.key}`}
              name={field.key}
              label={field.label}
              register={register}
              error={errors[field.key]}
              currentLength={watch(field.key)?.length ?? 0}
            />
          ))}

          <div className="flex justify-end">
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? 'Guardando...' : 'Guardar notas de visita'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4">
          <VisitNotesReadOnly workOrder={workOrder} />
        </div>
      )}
    </section>
  );
}
