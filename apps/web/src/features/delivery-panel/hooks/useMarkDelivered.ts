import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryApi } from '../services/deliveryApi';

export function useMarkDelivered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workOrderId: string) => deliveryApi.markDelivered(workOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'ready'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}
