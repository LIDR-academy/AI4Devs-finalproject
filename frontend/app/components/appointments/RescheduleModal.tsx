'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { es, enUS } from 'date-fns/locale';
import { format } from 'date-fns';
import { getDoctorSlots, SlotResponse } from '@/lib/api/doctors';
import { useRescheduleAppointment } from '@/hooks/useAppointments';
import { useAuthStore } from '@/store/authStore';

const LOCALES = { es, en: enUS };

interface RescheduleModalProps {
  appointment: {
    id: string;
    doctorId: string;
    slotId: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function RescheduleModal({
  appointment,
  isOpen,
  onClose,
}: RescheduleModalProps) {
  const t = useTranslations('appointmentsManagement');
  const locale = useLocale() as 'es' | 'en';
  const dateFnsLocale = LOCALES[locale] ?? es;
  const { accessToken } = useAuthStore();
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<SlotResponse | null>(null);
  const mutation = useRescheduleAppointment();

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['slots', appointment.doctorId, selectedDate],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return getDoctorSlots(appointment.doctorId, selectedDate, accessToken);
    },
    enabled: isOpen && !!accessToken,
  });

  const filteredSlots = useMemo(
    () =>
      slots.filter((slot) => {
        if (slot.id === appointment.slotId) return false;
        const isLocked =
          slot.lockedUntil && new Date(slot.lockedUntil).getTime() > Date.now();
        return slot.isAvailable && !isLocked;
      }),
    [slots, appointment.slotId]
  );

  if (!isOpen) return null;

  const onConfirm = async () => {
    if (!selectedSlot) return;
    await mutation.mutateAsync({
      appointmentId: appointment.id,
      slotId: selectedSlot.id,
      appointmentDate: selectedSlot.startTime,
    });
    setSelectedSlot(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('rescheduleTitle')}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{t('rescheduleHelper')}</p>

        <input
          type="date"
          value={selectedDate}
          min={today}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedSlot(null);
          }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm mb-3"
        />

        {isLoading ? (
          <p className="text-sm text-gray-500">{t('loadingSlots')}</p>
        ) : filteredSlots.length === 0 ? (
          <p className="text-sm text-gray-500">{t('noSlotsAvailable')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`border rounded-md px-2 py-2 text-sm ${
                  selectedSlot?.id === slot.id
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-gray-300 text-gray-700 hover:border-blue-400'
                }`}
              >
                {format(new Date(slot.startTime), 'HH:mm', { locale: dateFnsLocale })}
              </button>
            ))}
          </div>
        )}

        {mutation.isError && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
            {(mutation.error as Error).message}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            {t('close')}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
            onClick={onConfirm}
            disabled={!selectedSlot || mutation.isPending}
          >
            {mutation.isPending ? t('processing') : t('rescheduleAction')}
          </button>
        </div>
      </div>
    </div>
  );
}
