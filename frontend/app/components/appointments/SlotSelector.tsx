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
  const [note, setNote] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Información del médico */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          {t('doctorInfo')}
        </h3>
        <p className="text-xl font-semibold text-gray-900">
          Dr. {doctor.firstName} {doctor.lastName}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {doctor.specialties.map((spec) => (
            <span
              key={spec.id}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
            >
              {locale === 'es' ? spec.nameEs : spec.nameEn}
            </span>
          ))}
        </div>
        <p className="text-gray-600 mt-2">{doctor.address}</p>
      </div>

      {/* Selector de fecha */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {t('selectDate')}
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {availableDates.slice(0, 14).map((date) => (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium ${
                isSameDay(date, selectedDate)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {format(date, 'EEE d', { locale: dateFnsLocale })}
            </button>
          ))}
        </div>
      </div>

      {/* Slots del día */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          {t('selectSlot')}
        </h3>
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            {t('loadingSlots')}
          </div>
        ) : slots.length === 0 ? (
          <div className="py-8 text-center text-gray-500 rounded-lg bg-gray-50">
            {t('noSlots')}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {slots.map((slot) => {
              const isLocked =
                slot.lockedUntil && new Date(slot.lockedUntil) > new Date();
              const isDisabled = !slot.isAvailable || !!isLocked;
              const isSelected = selectedSlot?.id === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() =>
                    !isDisabled && setSelectedSlot(isSelected ? null : slot)
                  }
                  disabled={isDisabled}
                  className={`p-4 rounded-lg border text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-600'
                      : isDisabled
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {format(new Date(slot.startTime), 'HH:mm', {
                    locale: dateFnsLocale,
                  })}
                  {isLocked && (
                    <span className="block text-xs text-amber-600 mt-1">
                      {t('reserving')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Panel de confirmación */}
      {selectedSlot && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('appointmentSummary')}
          </h3>
          <p className="text-gray-700">
            {format(new Date(selectedSlot.startTime), "EEEE d 'de' MMMM", {
              locale: dateFnsLocale,
            })}
          </p>
          <p className="text-gray-700 mt-1">
            {format(new Date(selectedSlot.startTime), 'HH:mm')} -{' '}
            {format(new Date(selectedSlot.endTime), 'HH:mm')}
          </p>
          <textarea
            placeholder={t('notesPlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))}
            maxLength={500}
            rows={3}
            className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {note.length}/500
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => reserveMutation.mutate()}
              disabled={reserveMutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {reserveMutation.isPending ? t('reserving') : t('confirmAppointment')}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSlot(null);
                setNote('');
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              {t('cancel')}
            </button>
          </div>
          {reserveMutation.isError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {getErrorMessage(reserveMutation.error as Error)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
