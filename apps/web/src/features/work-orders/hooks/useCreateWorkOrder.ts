import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersApi } from '../services/workOrdersApi';
import type { CreateWorkOrderRequest } from '../types/work-order.types';

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkOrderRequest) => workOrdersApi.create(data),
    onSuccess: (workOrder) => {
      queryClient.invalidateQueries({
        queryKey: ['vehicles', workOrder.vehicleId, 'history'],
      });
      queryClient.invalidateQueries({
        queryKey: ['work-orders', 'active', workOrder.vehicleId],
      });
      queryClient.setQueryData(['work-orders', workOrder.id], workOrder);
    },
  });
}
