import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/lib/apiError';
import { workOrdersApi } from '../services/workOrdersApi';

export function useAddTask(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (description: string) =>
      workOrdersApi.addTask(workOrderId, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', workOrderId] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.statusCode === 403) {
        queryClient.invalidateQueries({
          queryKey: ['work-orders', workOrderId],
        });
      }
    },
  });
}
