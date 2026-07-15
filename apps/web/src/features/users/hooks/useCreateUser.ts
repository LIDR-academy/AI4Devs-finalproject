'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../services/usersApi';
import type { CreateUserRequest } from '../types/user.types';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders', 'mechanics'] });
    },
  });
}
