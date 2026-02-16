'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import CancelModal from '@/app/components/appointments/CancelModal';
import RescheduleModal from '@/app/components/appointments/RescheduleModal';
import PageHeader from '@/app/components/ui/PageHeader';
import StateMessage from '@/app/components/ui/StateMessage';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentItem } from '@/lib/api/appointments';

function formatMexicoCityDate(date: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City',
  }).format(new Date(date));
}

export default function AppointmentsPage() {
  const t = useTranslations('appointmentsManagement');
  const { isAuthenticated, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedToCancel, setSelectedToCancel] = useState<string | null>(null);
  const [selectedToReschedule, setSelectedToReschedule] =
    useState<AppointmentItem | null>(null);

  const { data, isLoading, isError, error } = useAppointments(statusFilter, 1, 20);
  const appointments = useMemo(() => data?.appointments ?? [], [data?.appointments]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isAuthenticated, loading, locale, router]);

  if (loading) {
    return <div className="mx-auto max-w-5xl p-4 text-slate-600">{t('loading')}</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const canMutate = (status: AppointmentItem['status']) =>
    status === 'confirmed' || status === 'pending';

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6" data-testid="appointments-page">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <select
            data-testid="appointments-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">{t('statusAll')}</option>
            <option value="confirmed">{t('statusConfirmed')}</option>
            <option value="pending">{t('statusPending')}</option>
            <option value="completed">{t('statusCompleted')}</option>
            <option value="cancelled">{t('statusCancelled')}</option>
          </select>
        }
      />

      {isLoading ? (
        <StateMessage message={t('loadingAppointments')} />
      ) : isError ? (
        <StateMessage message={(error as Error).message} variant="error" />
      ) : appointments.length === 0 ? (
        <StateMessage message={t('empty')} />
      ) : (
        <div className="space-y-3" data-testid="appointments-list">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              data-testid={`appointment-card-${appointment.id}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-500">{t('appointmentDate')}</p>
                  <p className="font-medium text-slate-900">
                    {formatMexicoCityDate(appointment.appointmentDate)}
                  </p>
                </div>
                <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                  {t(`statusLabel.${appointment.status}`)}
                </span>
              </div>

              {appointment.cancellationReason && (
                <p className="mt-2 text-sm text-slate-600">
                  {t('cancelReason')}: {appointment.cancellationReason}
                </p>
              )}

              {canMutate(appointment.status) && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    data-testid={`appointment-cancel-${appointment.id}`}
                    className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200"
                    onClick={() => setSelectedToCancel(appointment.id)}
                  >
                    {t('cancelAction')}
                  </button>
                  <button
                    type="button"
                    data-testid={`appointment-reschedule-${appointment.id}`}
                    className="rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700 hover:bg-brand-100"
                    onClick={() => setSelectedToReschedule(appointment)}
                  >
                    {t('rescheduleAction')}
                  </button>
                </div>
              )}

              {appointment.status === 'completed' && (
                <div className="mt-3">
                  <Link
                    href={`/${locale}/appointments/${appointment.id}/review`}
                    data-testid={`appointment-review-${appointment.id}`}
                    className="inline-flex rounded-md bg-emerald-100 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-200"
                  >
                    {t('reviewAction')}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CancelModal
        appointmentId={selectedToCancel ?? ''}
        isOpen={!!selectedToCancel}
        onClose={() => setSelectedToCancel(null)}
      />

      <RescheduleModal
        appointment={
          selectedToReschedule
            ? {
                id: selectedToReschedule.id,
                doctorId: selectedToReschedule.doctorId,
                slotId: selectedToReschedule.slotId,
              }
            : { id: '', doctorId: '', slotId: '' }
        }
        isOpen={!!selectedToReschedule}
        onClose={() => setSelectedToReschedule(null)}
      />
    </div>
  );
}
