'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../services/usersApi';

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.deactivate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders', 'mechanics'] });
    },
  });
}
