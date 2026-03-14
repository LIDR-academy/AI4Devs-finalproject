'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  approveReviewModeration,
  getReviewsModerationQueue,
  rejectReviewModeration,
} from '@/lib/api/admin';

export function useReviewsModeration(page = 1, limit = 20) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'reviews-moderation', page, limit],
    queryFn: () => {
      if (!accessToken) throw new Error('No autenticado');
      return getReviewsModerationQueue(accessToken, { page, limit });
    },
    enabled: !!accessToken,
  });
}

export function useApproveReviewModeration() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  return useMutation({
    mutationFn: ({ reviewId, notes }: { reviewId: string; notes?: string }) => {
      if (!accessToken) throw new Error('No autenticado');
      return approveReviewModeration(accessToken, reviewId, notes);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'reviews-moderation'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
}

export function useRejectReviewModeration() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  return useMutation({
    mutationFn: ({ reviewId, notes }: { reviewId: string; notes: string }) => {
      if (!accessToken) throw new Error('No autenticado');
      return rejectReviewModeration(accessToken, reviewId, notes);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'reviews-moderation'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
}
