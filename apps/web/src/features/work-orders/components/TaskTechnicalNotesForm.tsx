'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { useTaskTechnicalNotes } from '../hooks/useTaskTechnicalNotes';
import type { WorkOrderTaskDetail } from '../types/work-order.types';
import { mapTechnicalNotesError } from '../utils/mapWorkOrdersError';
import {
  taskTechnicalNotesSchema,
  taskToFormValues,
  toTaskTechnicalNotesRequest,
  type TaskTechnicalNotesFormValues,
} from '../utils/technicalNotesSchema';
import { TechnicalNotesField } from './TechnicalNotesField';

const TASK_NOTE_FIELDS = [
  { label: 'Diagnóstico', key: 'diagnosis' as const },
  { label: 'Reparación / mantenimiento', key: 'repairPerformed' as const },
  { label: 'Repuestos utilizados', key: 'partsUsed' as const },
  { label: 'Observaciones', key: 'additionalNotes' as const },
];

interface TaskTechnicalNotesFormProps {
  workOrderId: string;
  task: WorkOrderTaskDetail;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function TaskTechnicalNotesForm({
  workOrderId,
  task,
  disabled = false,
  onSuccess,
}: TaskTechnicalNotesFormProps) {
  const { mutateAsync, isPending, error, reset: resetMutation } =
    useTaskTechnicalNotes(workOrderId, task.id);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<TaskTechnicalNotesFormValues>({
    resolver: zodResolver(taskTechnicalNotesSchema),
    mode: 'onChange',
    defaultValues: taskToFormValues(task),
  });

  useEffect(() => {
    reset(taskToFormValues(task));
  }, [task, reset]);

  const submit = async (values: TaskTechnicalNotesFormValues) => {
    resetMutation();
    try {
      const payload = toTaskTechnicalNotesRequest(values);
      await mutateAsync(payload);
      reset(taskToFormValues(payload));
      onSuccess?.();
    } catch {
      // Error surfaced below
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {mapTechnicalNotesError(error)}
        </p>
      )}

      {TASK_NOTE_FIELDS.map((field) => (
        <TechnicalNotesField
          key={field.key}
          id={`${task.id}-${field.key}`}
          name={field.key}
          label={field.label}
          register={register}
          error={errors[field.key]}
          currentLength={watch(field.key)?.length ?? 0}
        />
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={!isValid || isPending || disabled}>
          {isPending ? 'Guardando...' : 'Guardar notas'}
        </Button>
      </div>
    </form>
  );
}
