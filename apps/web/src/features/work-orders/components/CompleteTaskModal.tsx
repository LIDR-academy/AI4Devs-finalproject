'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { cn } from '@/shared/lib/cn';
import type { WorkOrderTaskDetail } from '../types/work-order.types';
import {
  completeTaskSchema,
  type CompleteTaskFormValues,
} from '../utils/completeTaskSchema';

interface CompleteTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: WorkOrderTaskDetail | null;
  onConfirm: (values: CompleteTaskFormValues) => Promise<void>;
  isPending: boolean;
  errorMessage?: string | null;
}

export function CompleteTaskModal({
  open,
  onOpenChange,
  task,
  onConfirm,
  isPending,
  errorMessage,
}: CompleteTaskModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CompleteTaskFormValues>({
    resolver: zodResolver(completeTaskSchema),
    mode: 'onChange',
    defaultValues: {
      costNotes: '',
    },
  });

  const submit = async (values: CompleteTaskFormValues) => {
    try {
      await onConfirm(values);
      reset({ costNotes: '' });
      onOpenChange(false);
    } catch {
      // Keep modal open; parent surfaces error
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset({ costNotes: '' });
    }
    onOpenChange(nextOpen);
  };

  return (
    <Modal open={open} onOpenChange={handleClose} title="Completar tarea">
      {task && (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">Tarea:</span>{' '}
            {task.description}
          </p>

          {errorMessage && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="task-cost" className="block text-sm font-medium text-slate-700">
              Costo
            </label>
            <input
              id="task-cost"
              type="number"
              min={0}
              step="0.01"
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
                errors.cost ? 'border-red-500' : 'border-slate-300',
              )}
              {...register('cost', { valueAsNumber: true })}
            />
            {errors.cost && (
              <p className="text-sm text-red-600">{errors.cost.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="task-cost-notes"
              className="block text-sm font-medium text-slate-700"
            >
              Notas del costo (opcional)
            </label>
            <textarea
              id="task-cost-notes"
              rows={2}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2',
                errors.costNotes ? 'border-red-500' : 'border-slate-300',
              )}
              {...register('costNotes')}
            />
            {errors.costNotes && (
              <p className="text-sm text-red-600">{errors.costNotes.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleClose(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? 'Guardando...' : 'Completar tarea'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
