'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { getDoctorSlots, type DoctorDetail, type SlotResponse } from '@/lib/api/doctors';
import { createAppointment } from '@/lib/api/appointments';

const LOCALES = { es, en: enUS };

interface SlotSelectorProps {
  doctorId: string;
  doctor: DoctorDetail;
  accessToken: string;
}

export default function SlotSelector({
  doctorId,
  doctor,
  accessToken,
}: SlotSelectorProps) {
  const t = useTranslations('appointments');
  const locale = useLocale() as 'es' | 'en';
  const router = useRouter();
  const params = useParams();
  const localeParam = params.locale as string;

  const dateFnsLocale = LOCALES[locale] ?? es;

  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<SlotResponse | null>(null);
  const [bookingFor, setBookingFor] = useState<'self' | 'other'>('self');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [note, setNote] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data: slotsData, isLoading } = useQuery({
    queryKey: ['slots', doctorId, dateStr],
    queryFn: () => getDoctorSlots(doctorId, dateStr, accessToken),
    enabled: !!doctorId && !!dateStr && !!accessToken,
  });

  const queryClient = useQueryClient();
  const reserveMutation = useMutation({
    mutationFn: () =>
      createAppointment(
        {
          doctorId,
          slotId: selectedSlot!.id,
          appointmentDate: selectedSlot!.startTime,
          notes: note.trim() || undefined,
        },
        accessToken
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push(`/${localeParam}/search`);
    },
  });

  const slots = slotsData ?? [];
  const availableDates = Array.from({ length: 28 }, (_, i) =>
    addDays(today, i)
  ).filter((d) => d.getDay() !== 0 && d.getDay() !== 6);

  const getErrorMessage = (err: Error) => {
    const msg = err.message.toLowerCase();
    if (msg.includes('cita activa') || msg.includes('active appointment'))
      return t('errorActiveAppointment');
    if (msg.includes('reservado') || msg.includes('booked'))
      return t('errorSlotTaken');
    if (msg.includes('no está disponible') || msg.includes('not available'))
      return t('errorSlotUnavailable');
    return err.message;
  };

  const isBookingDataValid =
    phone.trim().length >= 8 &&
    email.trim().length > 4 &&
    email.trim() === emailConfirm.trim() &&
    acceptTerms;

  return (
    <div className="space-y-6" data-testid="slot-selector">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-medium text-slate-500">{t('doctorInfo')}</h3>
            <p className="text-xl font-semibold text-slate-900">
              Dra./Dr. {doctor.firstName} {doctor.lastName}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {doctor.specialties.map((spec) => (
                <span
                  key={spec.id}
                  className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                >
                  {locale === 'es' ? spec.nameEs : spec.nameEn}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-600">{doctor.address}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-sm font-medium text-slate-700">{t('selectDate')}</h3>
            <div className="flex gap-2 overflow-x-auto pb-2" data-testid="slot-date-list">
              {availableDates.slice(0, 14).map((date) => (
                <button
                  key={date.toISOString()}
                  type="button"
                  data-testid={`slot-date-${format(date, 'yyyy-MM-dd')}`}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  className={`flex-shrink-0 rounded-md px-4 py-2 text-sm font-medium ${
                    isSameDay(date, selectedDate)
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {format(date, 'EEE d', { locale: dateFnsLocale })}
                </button>
              ))}
            </div>

            <h3 className="mb-3 mt-6 text-sm font-medium text-slate-700">{t('selectSlot')}</h3>
            {isLoading ? (
              <div className="py-8 text-center text-slate-500">{t('loadingSlots')}</div>
            ) : slots.length === 0 ? (
              <div className="rounded-lg bg-slate-50 py-8 text-center text-slate-500">{t('noSlots')}</div>
            ) : (
              <div
                className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
                data-testid="slot-list"
              >
                {slots.map((slot) => {
                  const isLocked = slot.lockedUntil && new Date(slot.lockedUntil) > new Date();
                  const isDisabled = !slot.isAvailable || !!isLocked;
                  const isSelected = selectedSlot?.id === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      data-testid={`slot-item-${slot.id}`}
                      onClick={() => !isDisabled && setSelectedSlot(isSelected ? null : slot)}
                      disabled={isDisabled}
                      className={`rounded-lg border p-4 text-sm font-medium transition-colors ${
                        isSelected
                          ? 'border-brand-600 bg-emerald-50 text-emerald-800 ring-2 ring-brand-600'
                          : isDisabled
                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                            : 'border-slate-300 text-slate-700 hover:border-brand-600 hover:bg-emerald-50'
                      }`}
                    >
                      {format(new Date(slot.startTime), 'HH:mm', { locale: dateFnsLocale })}
                      {isLocked && (
                        <span className="mt-1 block text-xs text-amber-600">{t('reserving')}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <h3 className="text-lg font-semibold text-slate-900">{t('appointmentSummary')}</h3>
          {selectedSlot ? (
            <>
              <p className="mt-3 text-sm text-slate-700">
                {format(new Date(selectedSlot.startTime), "EEEE d 'de' MMMM", {
                  locale: dateFnsLocale,
                })}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {format(new Date(selectedSlot.startTime), 'HH:mm')} -{' '}
                {format(new Date(selectedSlot.endTime), 'HH:mm')}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">{t('selectSlotToContinue')}</p>
          )}

          <div className="mt-5 space-y-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-700">{t('bookingFor')}</legend>
              <div className="space-y-2 text-sm text-slate-700">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="bookingFor"
                    checked={bookingFor === 'self'}
                    onChange={() => setBookingFor('self')}
                  />
                  {t('forMe')}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="bookingFor"
                    checked={bookingFor === 'other'}
                    onChange={() => setBookingFor('other')}
                  />
                  {t('forOther')}
                </label>
              </div>
            </fieldset>

            <label className="block text-sm text-slate-700">
              {t('contactPhone')}
              <input
                type="tel"
                data-testid="slot-contact-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </label>

            <label className="block text-sm text-slate-700">
              {t('contactEmail')}
              <input
                type="email"
                data-testid="slot-contact-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </label>

            <label className="block text-sm text-slate-700">
              {t('confirmEmail')}
              <input
                type="email"
                data-testid="slot-contact-email-confirm"
                value={emailConfirm}
                onChange={(e) => setEmailConfirm(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </label>

            <textarea
              placeholder={t('notesPlaceholder')}
              data-testid="slot-note"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              maxLength={500}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            <p className="text-xs text-slate-500">{note.length}/500</p>

            <label className="flex items-start gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                data-testid="slot-consent-terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5"
              />
              {t('consentTerms')}
            </label>

            <label className="flex items-start gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={acceptMarketing}
                onChange={(e) => setAcceptMarketing(e.target.checked)}
                className="mt-0.5"
              />
              {t('consentMarketing')}
            </label>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              data-testid="slot-confirm-appointment"
              onClick={() => reserveMutation.mutate()}
              disabled={reserveMutation.isPending || !selectedSlot || !isBookingDataValid}
              className="w-full rounded-md bg-brand-600 px-6 py-2 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {reserveMutation.isPending ? t('reserving') : t('confirmAppointment')}
            </button>
            <button
              type="button"
              data-testid="slot-cancel-selection"
              onClick={() => {
                setSelectedSlot(null);
                setNote('');
                setPhone('');
                setEmail('');
                setEmailConfirm('');
                setAcceptTerms(false);
                setAcceptMarketing(false);
              }}
              className="w-full rounded-md bg-slate-100 px-6 py-2 text-slate-700 hover:bg-slate-200"
            >
              {t('cancel')}
            </button>
          </div>

          {acceptMarketing && <p className="mt-2 text-[11px] text-slate-500">{t('marketingNote')}</p>}

          {reserveMutation.isError && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {getErrorMessage(reserveMutation.error as Error)}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
