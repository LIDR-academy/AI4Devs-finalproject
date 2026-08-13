'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/cn';
import { useAddTask } from '../hooks/useAddTask';
import {
  addTaskSchema,
  type AddTaskFormValues,
} from '../utils/completeTaskSchema';
import { mapWorkOrdersError } from '../utils/mapWorkOrdersError';

interface AddTaskFormProps {
  workOrderId: string;
}

export function AddTaskForm({ workOrderId }: AddTaskFormProps) {
  const [expanded, setExpanded] = useState(false);
  const { mutateAsync, isPending, error, reset: resetMutation } = useAddTask(workOrderId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<AddTaskFormValues>({
    resolver: zodResolver(addTaskSchema),
    mode: 'onChange',
    defaultValues: { description: '' },
  });

  const submit = async (values: AddTaskFormValues) => {
    resetMutation();
    try {
      await mutateAsync(values.description.trim());
      reset();
      setExpanded(false);
    } catch {
      // Error surfaced below
    }
  };

  if (!expanded) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
        <Button type="button" variant="secondary" onClick={() => setExpanded(true)}>
          Agregar tarea
        </Button>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Nueva tarea</h2>

      <form onSubmit={handleSubmit(submit)} className="mt-4 space-y-4" noValidate>
        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {mapWorkOrdersError(error)}
          </p>
        )}

        <div className="space-y-1">
          <label
            htmlFor="new-task-description"
            className="block text-sm font-medium text-slate-700"
          >
            Descripción
          </label>
          <input
            id="new-task-description"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
              errors.description ? 'border-red-500' : 'border-slate-300',
            )}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              reset();
              setExpanded(false);
            }}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={!isValid || isPending}>
            {isPending ? 'Agregando...' : 'Agregar tarea'}
          </Button>
        </div>
      </form>
    </section>
  );
}
