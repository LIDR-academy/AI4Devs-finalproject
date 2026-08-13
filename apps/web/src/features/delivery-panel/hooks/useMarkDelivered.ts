import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryApi } from '../services/deliveryApi';

export function useMarkDelivered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workOrderId,
      mileage,
    }: {
      workOrderId: string;
      mileage?: number;
    }) => deliveryApi.markDelivered(workOrderId, mileage !== undefined ? { mileage } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'ready'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}
