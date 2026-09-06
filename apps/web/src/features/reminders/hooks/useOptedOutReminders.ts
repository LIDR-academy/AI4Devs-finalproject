import { useQuery } from '@tanstack/react-query';
import { remindersApi } from '../services/remindersApi';

export function useOptedOutReminders(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: ['reminders', 'opted-out'],
    queryFn: () => remindersApi.listOptedOut(),
    enabled,
    staleTime: 15 * 1000,
  });
}
