'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  createAppointmentReview,
  CreateReviewPayload,
  getAppointmentReview,
} from '@/lib/api/reviews';

export function useAppointmentReview(appointmentId: string) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['appointment-review', appointmentId],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return getAppointmentReview(appointmentId, accessToken);
    },
    enabled: !!accessToken && !!appointmentId,
    retry: false,
  });
}

export function useCreateAppointmentReview() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: CreateReviewPayload;
    }) => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return createAppointmentReview(appointmentId, payload, accessToken);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appointment-review', variables.appointmentId],
      });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
