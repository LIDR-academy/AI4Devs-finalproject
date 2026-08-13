import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryApi } from '../services/deliveryApi';

export function useMarkContacted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workOrderId: string) => deliveryApi.markContacted(workOrderId),
    onSuccess: (_data, workOrderId) => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'ready'] });
      queryClient.invalidateQueries({
        queryKey: ['delivery', 'ready', workOrderId],
      });
    },
  });
}
