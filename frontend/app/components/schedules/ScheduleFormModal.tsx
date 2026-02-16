'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { DoctorSchedule, UpsertSchedulePayload } from '@/lib/api/schedules';

interface ScheduleFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  schedule?: DoctorSchedule | null;
  isSubmitting: boolean;
  backendError?: string | null;
  onClose: () => void;
  onSubmit: (payload: UpsertSchedulePayload) => Promise<void>;
}

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export default function ScheduleFormModal({
  isOpen,
  mode,
  schedule,
  isSubmitting,
  backendError,
  onClose,
  onSubmit,
}: ScheduleFormModalProps) {
  const t = useTranslations('doctorSchedules');
  const schema = useMemo(
    () =>
      z
        .object({
          dayOfWeek: z.coerce.number().int().min(0).max(6),
          startTime: z.string().regex(/^\d{2}:\d{2}$/),
          endTime: z.string().regex(/^\d{2}:\d{2}$/),
          slotDurationMinutes: z.coerce.number().int().min(1),
          breakDurationMinutes: z.coerce.number().int().min(0),
          isActive: z.boolean(),
        })
        .refine(
          (values) => values.endTime > values.startTime,
          t('validation.endAfterStart'),
        ),
    [t],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      dayOfWeek: schedule?.dayOfWeek ?? 1,
      startTime: (schedule?.startTime ?? '09:00:00').slice(0, 5),
      endTime: (schedule?.endTime ?? '17:00:00').slice(0, 5),
      slotDurationMinutes: schedule?.slotDurationMinutes ?? 30,
      breakDurationMinutes: schedule?.breakDurationMinutes ?? 0,
      isActive: schedule?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="schedule-form-modal"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
        className="w-full max-w-lg rounded-lg bg-white p-5 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="schedule-modal-title" className="text-lg font-semibold">
            {mode === 'create' ? t('createTitle') : t('editTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            {t('close')}
          </button>
        </div>

        {backendError && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {backendError}
          </div>
        )}

        <form
          className="space-y-3"
          data-testid="schedule-form"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit({
              dayOfWeek: values.dayOfWeek,
              startTime: normalizeTime(values.startTime),
              endTime: normalizeTime(values.endTime),
              slotDurationMinutes: values.slotDurationMinutes,
              breakDurationMinutes: values.breakDurationMinutes,
              isActive: values.isActive,
            });
          })}
        >
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="dayOfWeek">
              {t('fields.day')}
            </label>
            <select
              id="dayOfWeek"
              data-testid="schedule-dayOfWeek"
              {...register('dayOfWeek')}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value={0}>{t('days.0')}</option>
              <option value={1}>{t('days.1')}</option>
              <option value={2}>{t('days.2')}</option>
              <option value={3}>{t('days.3')}</option>
              <option value={4}>{t('days.4')}</option>
              <option value={5}>{t('days.5')}</option>
              <option value={6}>{t('days.6')}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="startTime">
                {t('fields.startTime')}
              </label>
              <input
                id="startTime"
                type="time"
                data-testid="schedule-startTime"
                {...register('startTime')}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="endTime">
                {t('fields.endTime')}
              </label>
              <input
                id="endTime"
                type="time"
                data-testid="schedule-endTime"
                {...register('endTime')}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {(errors.startTime || errors.endTime) && (
            <p className="text-sm text-red-600">
              {errors.endTime?.message || errors.startTime?.message}
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="slotDurationMinutes"
              >
                {t('fields.slotDuration')}
              </label>
              <input
                id="slotDurationMinutes"
                type="number"
                data-testid="schedule-slotDurationMinutes"
                min={1}
                {...register('slotDurationMinutes')}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="breakDurationMinutes"
              >
                {t('fields.breakDuration')}
              </label>
              <input
                id="breakDurationMinutes"
                type="number"
                data-testid="schedule-breakDurationMinutes"
                min={0}
                {...register('breakDurationMinutes')}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {(errors.slotDurationMinutes || errors.breakDurationMinutes) && (
            <p className="text-sm text-red-600">
              {errors.slotDurationMinutes?.message || errors.breakDurationMinutes?.message}
            </p>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" data-testid="schedule-isActive" {...register('isActive')} />
            {t('fields.isActive')}
          </label>

          <div className="pt-2 text-xs text-gray-500">{t('timezoneHint')}</div>

          <button
            type="submit"
            data-testid="schedule-submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {isSubmitting ? t('saving') : mode === 'create' ? t('create') : t('save')}
          </button>
        </form>
      </div>
    </div>
  );
}
