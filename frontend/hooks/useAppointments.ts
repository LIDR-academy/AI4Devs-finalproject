'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  cancelAppointment,
  getAppointments,
  rescheduleAppointment,
} from '@/lib/api/appointments';

export function useAppointments(status: string, page = 1, limit = 10) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['appointments', status, page, limit],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return getAppointments(accessToken, status, page, limit);
    },
    enabled: !!accessToken,
  });
}

export function useCancelAppointment() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      cancellationReason,
    }: {
      appointmentId: string;
      cancellationReason?: string;
    }) => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return cancelAppointment(
        appointmentId,
        { status: 'cancelled', cancellationReason },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useRescheduleAppointment() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      slotId,
      appointmentDate,
    }: {
      appointmentId: string;
      slotId: string;
      appointmentDate: string;
    }) => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return rescheduleAppointment(
        appointmentId,
        { slotId, appointmentDate },
        accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
