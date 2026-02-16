'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import DoctorProfileForm from '@/app/components/doctors/DoctorProfileForm';
import PageHeader from '@/app/components/ui/PageHeader';
import StateMessage from '@/app/components/ui/StateMessage';
import { UpdateDoctorProfilePayload } from '@/lib/api/doctors';
import { useAuth } from '@/hooks/useAuth';
import { useDoctorProfile, useUpdateDoctorProfile } from '@/hooks/useDoctorProfile';
import {
  useAppointments,
  useCancelAppointment,
  useConfirmAppointmentByDoctor,
} from '@/hooks/useAppointments';
import { AppointmentItem } from '@/lib/api/appointments';

function formatMexicoCityDate(date: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City',
  }).format(new Date(date));
}

export default function DoctorProfilePage() {
  const t = useTranslations('doctorProfile');
  const tAppointments = useTranslations('appointmentsManagement');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isAuthenticated, loading } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [appointmentsFilter, setAppointmentsFilter] = useState<'pending' | 'confirmed'>(
    'pending'
  );

  const profileQuery = useDoctorProfile();
  const updateProfile = useUpdateDoctorProfile();
  const cancelAppointment = useCancelAppointment();
  const confirmAppointment = useConfirmAppointmentByDoctor();
  const doctorAppointmentsQuery = useAppointments(appointmentsFilter, 1, 20);
  const doctorAppointments = useMemo(
    () => doctorAppointmentsQuery.data?.appointments ?? [],
    [doctorAppointmentsQuery.data?.appointments]
  );

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

  if (loading || profileQuery.isLoading) {
    return <div className="mx-auto max-w-3xl p-4 text-slate-600">{t('loading')}</div>;
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    return null;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <StateMessage
          message={
            profileQuery.error instanceof Error ? profileQuery.error.message : t('loadError')
          }
          variant="error"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <PageHeader
        title={t('title')}
        subtitle={`${t('email')}: ${profileQuery.data.email}`}
        action={
          <button
            type="button"
            onClick={() => router.push(`/${locale}/doctors/schedules`)}
            className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
          >
            {t('manageSchedules')}
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('appointments.title')}</h2>
              <p className="text-sm text-slate-600">{t('appointments.subtitle')}</p>
            </div>
            <select
              data-testid="doctor-profile-appointments-filter"
              value={appointmentsFilter}
              onChange={(e) => setAppointmentsFilter(e.target.value as 'pending' | 'confirmed')}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="pending">{t('appointments.filters.pending')}</option>
              <option value="confirmed">{t('appointments.filters.confirmed')}</option>
            </select>
          </div>

          {doctorAppointmentsQuery.isLoading ? (
            <StateMessage message={t('appointments.loading')} />
          ) : doctorAppointmentsQuery.isError ? (
            <StateMessage
              message={
                doctorAppointmentsQuery.error instanceof Error
                  ? doctorAppointmentsQuery.error.message
                  : t('appointments.loadError')
              }
              variant="error"
            />
          ) : doctorAppointments.length === 0 ? (
            <StateMessage message={t('appointments.empty')} />
          ) : (
            <div className="space-y-3" data-testid="doctor-profile-appointments-list">
              {doctorAppointments.map((appointment: AppointmentItem) => (
                <article
                  key={appointment.id}
                  data-testid={`doctor-profile-appointment-card-${appointment.id}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{tAppointments('appointmentDate')}</p>
                      <p className="font-medium text-slate-900">
                        {formatMexicoCityDate(appointment.appointmentDate)}
                      </p>
                    </div>
                    <span className="inline-block rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700">
                      {tAppointments(`statusLabel.${appointment.status}`)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
                    <div>
                      <p className="text-slate-500">{t('appointments.fields.patient')}</p>
                      <p className="font-medium text-slate-900">
                        {appointment.patient
                          ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                          : t('appointments.notAvailable')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t('appointments.fields.email')}</p>
                      <p>{appointment.patient?.email || t('appointments.notAvailable')}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t('appointments.fields.phone')}</p>
                      <p>{appointment.patient?.phone || t('appointments.notAvailable')}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t('appointments.fields.notes')}</p>
                      <p>{appointment.notes || t('appointments.withoutNotes')}</p>
                    </div>
                  </div>

                  {(appointment.status === 'pending' ||
                    appointment.status === 'confirmed') && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        data-testid={`doctor-profile-cancel-appointment-${appointment.id}`}
                        className="rounded-md border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={confirmAppointment.isPending || cancelAppointment.isPending}
                        onClick={async () => {
                          if (!window.confirm(t('appointments.cancel.confirm'))) {
                            return;
                          }
                          setSuccessMessage(null);
                          setWarningMessage(null);
                          try {
                            const response = await cancelAppointment.mutateAsync({
                              appointmentId: appointment.id,
                              cancellationReason: t('appointments.cancel.defaultReason'),
                            });
                            setSuccessMessage(
                              response.message || t('appointments.cancel.success')
                            );
                            await doctorAppointmentsQuery.refetch();
                          } catch (error) {
                            setWarningMessage(
                              error instanceof Error
                                ? error.message
                                : t('appointments.cancel.error')
                            );
                          }
                        }}
                      >
                        {cancelAppointment.isPending
                          ? t('appointments.cancel.processing')
                          : t('appointments.cancel.action')}
                      </button>

                      {appointment.status === 'pending' && (
                      <button
                        type="button"
                        data-testid={`doctor-profile-confirm-appointment-${appointment.id}`}
                        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={confirmAppointment.isPending || cancelAppointment.isPending}
                        onClick={async () => {
                          setSuccessMessage(null);
                          setWarningMessage(null);
                          try {
                            const response = await confirmAppointment.mutateAsync({
                              appointmentId: appointment.id,
                            });
                            setSuccessMessage(
                              response.message || t('appointments.confirm.success')
                            );
                            await doctorAppointmentsQuery.refetch();
                          } catch (error) {
                            setWarningMessage(
                              error instanceof Error
                                ? error.message
                                : t('appointments.confirm.error')
                            );
                          }
                        }}
                      >
                        {confirmAppointment.isPending
                          ? t('appointments.confirm.processing')
                          : t('appointments.confirm.action')}
                      </button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:col-span-4">
          {successMessage && <StateMessage message={successMessage} variant="success" />}

          {warningMessage && <StateMessage message={warningMessage} variant="warning" />}

          {updateProfile.isError && (
            <StateMessage
              message={updateProfile.error instanceof Error ? updateProfile.error.message : t('saveError')}
              variant="error"
            />
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <DoctorProfileForm
              profile={profileQuery.data}
              isSaving={updateProfile.isPending}
              onSubmit={async (payload: UpdateDoctorProfilePayload) => {
                setSuccessMessage(null);
                setWarningMessage(null);
                try {
                  const response = await updateProfile.mutateAsync(payload);
                  setSuccessMessage(response.message || t('saveSuccess'));
                  if (response.warnings?.length) {
                    setWarningMessage(response.warnings.join(' '));
                  }
                  await profileQuery.refetch();
                } catch {
                  // El error se renderiza con updateProfile.isError más arriba.
                }
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
