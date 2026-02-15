'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  createSchedule,
  deleteSchedule,
  getMySchedules,
  updateSchedule,
  UpsertSchedulePayload,
} from '@/lib/api/schedules';

export function useSchedules() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['doctor-schedules'],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return getMySchedules(accessToken);
    },
    enabled: !!accessToken,
  });
}

export function useCreateSchedule() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertSchedulePayload) => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return createSchedule(payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useUpdateSchedule() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scheduleId,
      payload,
    }: {
      scheduleId: string;
      payload: Partial<UpsertSchedulePayload>;
    }) => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return updateSchedule(scheduleId, payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useDeleteSchedule() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return deleteSchedule(scheduleId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
