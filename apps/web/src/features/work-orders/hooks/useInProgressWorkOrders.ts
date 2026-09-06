import { useQuery } from '@tanstack/react-query';
import { workOrdersApi } from '../services/workOrdersApi';

export function useInProgressWorkOrders(options: {
  limit: number;
  offset?: number;
  enabled?: boolean;
}) {
  const { limit, offset = 0, enabled = true } = options;

  return useQuery({
    queryKey: ['work-orders', 'in-progress', { limit, offset }],
    queryFn: () => workOrdersApi.getInProgress({ limit, offset }),
    enabled,
    staleTime: 15 * 1000,
  });
}
