import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersApi } from '../services/workOrdersApi';

export function useUpdateMileage(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mileage: number | null) =>
      workOrdersApi.updateMileage(workOrderId, mileage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['delivery', 'ready'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
