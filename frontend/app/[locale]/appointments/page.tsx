'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import CancelModal from '@/app/components/appointments/CancelModal';
import RescheduleModal from '@/app/components/appointments/RescheduleModal';
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
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const canMutate = (status: AppointmentItem['status']) =>
    status === 'confirmed' || status === 'pending';

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">{t('statusAll')}</option>
          <option value="confirmed">{t('statusConfirmed')}</option>
          <option value="pending">{t('statusPending')}</option>
          <option value="completed">{t('statusCompleted')}</option>
          <option value="cancelled">{t('statusCancelled')}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-gray-600">{t('loadingAppointments')}</div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          {(error as Error).message}
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-600 p-4 rounded-md">
          {t('empty')}
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm text-gray-500">{t('appointmentDate')}</p>
                  <p className="font-medium text-gray-900">
                    {formatMexicoCityDate(appointment.appointmentDate)}
                  </p>
                </div>
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {t(`statusLabel.${appointment.status}`)}
                </span>
              </div>

              {appointment.cancellationReason && (
                <p className="text-sm text-gray-600 mt-2">
                  {t('cancelReason')}: {appointment.cancellationReason}
                </p>
              )}

              {canMutate(appointment.status) && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                    onClick={() => setSelectedToCancel(appointment.id)}
                  >
                    {t('cancelAction')}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm"
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
                    className="inline-flex px-3 py-2 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm"
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
