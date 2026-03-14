'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  getAdminCancellations,
  getAdminMetrics,
  getAdminRatings,
  getAdminReservations,
} from '@/lib/api/admin';

const STALE_24_HOURS = 24 * 60 * 60 * 1000;

export function useAdminMetrics() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: () => {
      if (!accessToken) throw new Error('No autenticado');
      return getAdminMetrics(accessToken);
    },
    enabled: !!accessToken,
    staleTime: STALE_24_HOURS,
  });
}

export function useAdminReservations(page = 1, limit = 20, filters?: Record<string, string>) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'reservations', page, limit, filters],
    queryFn: () => {
      if (!accessToken) throw new Error('No autenticado');
      return getAdminReservations(accessToken, { page, limit, ...filters });
    },
    enabled: !!accessToken,
    staleTime: STALE_24_HOURS,
  });
}

export function useAdminCancellations(page = 1, limit = 20, filters?: Record<string, string>) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'cancellations', page, limit, filters],
    queryFn: () => {
      if (!accessToken) throw new Error('No autenticado');
      return getAdminCancellations(accessToken, { page, limit, ...filters });
    },
    enabled: !!accessToken,
    staleTime: STALE_24_HOURS,
  });
}

export function useAdminRatings() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'ratings'],
    queryFn: () => {
      if (!accessToken) throw new Error('No autenticado');
      return getAdminRatings(accessToken);
    },
    enabled: !!accessToken,
    staleTime: STALE_24_HOURS,
  });
}

export function useRefreshAdminDashboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => true,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
