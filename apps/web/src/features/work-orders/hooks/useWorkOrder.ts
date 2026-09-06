import { useQuery } from '@tanstack/react-query';
import { workOrdersApi } from '../services/workOrdersApi';

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['work-orders', id],
    queryFn: () => workOrdersApi.getById(id),
    enabled: id.length > 0,
  });
}
