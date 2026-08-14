import { useQuery } from '@tanstack/react-query';
import { remindersApi } from '../services/remindersApi';

export function useEligibleReminders(options: {
  limit: number;
  offset?: number;
  days?: number;
  q?: string;
  enabled?: boolean;
}) {
  const { limit, offset = 0, days, q, enabled = true } = options;

  return useQuery({
    queryKey: ['reminders', 'eligible', { limit, offset, days, q }],
    queryFn: () =>
      remindersApi.listEligible({
        limit,
        offset,
        days,
        q: q?.trim() ? q.trim() : undefined,
      }),
    enabled,
    staleTime: 15 * 1000,
  });
}
