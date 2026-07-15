'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../services/usersApi';
import type { UpdateUserRequest } from '../types/user.types';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateUserRequest;
    }) => usersApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders', 'mechanics'] });
    },
  });
}
