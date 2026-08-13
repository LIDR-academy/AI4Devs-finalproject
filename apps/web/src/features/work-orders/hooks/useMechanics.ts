import { useQuery } from '@tanstack/react-query';
import { workOrdersApi } from '../services/workOrdersApi';

export function useMechanics() {
  return useQuery({
    queryKey: ['work-orders', 'mechanics'],
    queryFn: () => workOrdersApi.getMechanics(),
    staleTime: 30 * 1000,
  });
}
