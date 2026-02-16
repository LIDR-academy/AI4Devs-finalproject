'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  approveDoctorVerification,
  getAdminVerificationList,
  getDoctorVerificationDocuments,
  getVerificationDocumentSignedUrl,
  rejectDoctorVerification,
} from '@/lib/api/admin';

export function useVerificationList(page = 1, limit = 20, status?: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'verification', page, limit, status],
    queryFn: () => {
      if (!accessToken) throw new Error('No autenticado');
      return getAdminVerificationList(accessToken, {
        page,
        limit,
        status,
      });
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDoctorDocuments(doctorId: string | null) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'verification-documents', doctorId],
    queryFn: () => {
      if (!accessToken || !doctorId) throw new Error('No autenticado');
      return getDoctorVerificationDocuments(accessToken, doctorId);
    },
    enabled: !!accessToken && !!doctorId,
  });
}

export function useSignedVerificationUrl() {
  const { accessToken } = useAuthStore();
  return useMutation({
    mutationFn: (documentId: string) => {
      if (!accessToken) throw new Error('No autenticado');
      return getVerificationDocumentSignedUrl(accessToken, documentId);
    },
  });
}

export function useApproveDoctorVerification() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  return useMutation({
    mutationFn: ({ doctorId, notes }: { doctorId: string; notes?: string }) => {
      if (!accessToken) throw new Error('No autenticado');
      return approveDoctorVerification(accessToken, doctorId, notes);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'verification'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
}

export function useRejectDoctorVerification() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  return useMutation({
    mutationFn: ({ doctorId, notes }: { doctorId: string; notes: string }) => {
      if (!accessToken) throw new Error('No autenticado');
      return rejectDoctorVerification(accessToken, doctorId, notes);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'verification'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
    },
  });
}
