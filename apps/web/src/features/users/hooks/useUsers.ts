'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../services/usersApi';
import { sortUsers } from '../utils/sortUsers';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
    select: sortUsers,
  });
}
