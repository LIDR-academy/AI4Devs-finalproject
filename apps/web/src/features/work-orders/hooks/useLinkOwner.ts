import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersApi } from '../services/workOrdersApi';

export function useLinkOwner(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) =>
      workOrdersApi.linkOwner(workOrderId, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['delivery'] });
    },
  });
}
