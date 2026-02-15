'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyDoctorProfile,
  updateMyDoctorProfile,
  UpdateDoctorProfilePayload,
} from '@/lib/api/doctors';
import { useAuthStore } from '@/store/authStore';

export function useDoctorProfile() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['doctor-profile'],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return getMyDoctorProfile(accessToken);
    },
    enabled: !!accessToken,
  });
}

export function useUpdateDoctorProfile() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDoctorProfilePayload) => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return updateMyDoctorProfile(payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}
