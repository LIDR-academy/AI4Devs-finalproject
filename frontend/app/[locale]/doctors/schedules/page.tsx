'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import {
  useCreateSchedule,
  useDeleteSchedule,
  useSchedules,
  useUpdateSchedule,
} from '@/hooks/useSchedules';
import { DoctorSchedule, UpsertSchedulePayload } from '@/lib/api/schedules';
import ScheduleFormModal from '@/app/components/schedules/ScheduleFormModal';
import PageHeader from '@/app/components/ui/PageHeader';
import StateMessage from '@/app/components/ui/StateMessage';

type ApiError = Error & { status?: number; code?: string };

function getErrorMessage(error: unknown, t: ReturnType<typeof useTranslations>): string {
  if (!(error instanceof Error)) {
    return t('errors.generic');
  }
  const apiError = error as ApiError;
  if (apiError.code === 'SCHEDULE_OVERLAP') {
    return t('errors.overlap');
  }
  if (apiError.status === 403) {
    return t('errors.forbidden');
  }
  return apiError.message || t('errors.generic');
}

export default function DoctorSchedulesPage() {
  const t = useTranslations('doctorSchedules');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isAuthenticated, loading } = useAuth();
  const schedulesQuery = useSchedules();
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<DoctorSchedule | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, loading, locale, router]);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role !== 'doctor') {
      router.push(`/${locale}/appointments`);
    }
  }, [isAuthenticated, loading, locale, router, user?.role]);

  const grouped = useMemo(() => {
    const map: Record<number, DoctorSchedule[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    (schedulesQuery.data || []).forEach((schedule) => {
      map[schedule.dayOfWeek].push(schedule);
    });
    return map;
  }, [schedulesQuery.data]);

  if (loading || schedulesQuery.isLoading) {
    return <div className="mx-auto max-w-5xl p-4 text-slate-600">{t('loading')}</div>;
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6" data-testid="doctor-schedules-page">
      <PageHeader
        title={t('title')}
        subtitle={t('timezoneHint')}
        action={
          <button
            type="button"
            data-testid="new-schedule-button"
            onClick={() => {
              setSelected(null);
              setBackendError(null);
              setIsModalOpen(true);
            }}
            className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
          >
            {t('newSchedule')}
          </button>
        }
      />

      {schedulesQuery.isError && (
        <div className="mb-3">
          <StateMessage message={getErrorMessage(schedulesQuery.error, t)} variant="error" />
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).map(([dayKey, daySchedules]) => (
          <div key={dayKey} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">{t(`days.${dayKey}`)}</h2>
            {daySchedules.length === 0 ? (
              <div className="text-sm text-slate-500">{t('emptyDay')}</div>
            ) : (
              <div className="space-y-2">
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    data-testid={`schedule-row-${schedule.id}`}
                    className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                      </div>
                      <div className="text-sm text-slate-600">
                        {t('slotLabel', {
                          duration: schedule.slotDurationMinutes,
                          break: schedule.breakDurationMinutes,
                        })}
                      </div>
                      <div className="text-xs text-slate-500">
                        {schedule.isActive ? t('status.active') : t('status.inactive')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        data-testid={`schedule-edit-${schedule.id}`}
                        className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
                        onClick={() => {
                          setSelected(schedule);
                          setBackendError(null);
                          setIsModalOpen(true);
                        }}
                      >
                        {t('edit')}
                      </button>
                      <button
                        type="button"
                        data-testid={`schedule-delete-${schedule.id}`}
                        className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200"
                        onClick={async () => {
                          if (!window.confirm(t('deleteConfirm'))) {
                            return;
                          }
                          setBackendError(null);
                          try {
                            await deleteMutation.mutateAsync(schedule.id);
                          } catch (error) {
                            setBackendError(getErrorMessage(error, t));
                          }
                        }}
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {backendError && (
        <div className="mt-4">
          <StateMessage message={backendError} variant="error" />
        </div>
      )}

      <ScheduleFormModal
        isOpen={isModalOpen}
        mode={selected ? 'edit' : 'create'}
        schedule={selected}
        backendError={backendError}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsModalOpen(false);
          setBackendError(null);
        }}
        onSubmit={async (payload: UpsertSchedulePayload) => {
          setBackendError(null);
          try {
            if (selected) {
              await updateMutation.mutateAsync({ scheduleId: selected.id, payload });
            } else {
              await createMutation.mutateAsync(payload);
            }
            setIsModalOpen(false);
          } catch (error) {
            setBackendError(getErrorMessage(error, t));
          }
        }}
      />
    </div>
  );
}
