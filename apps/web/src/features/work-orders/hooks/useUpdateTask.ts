import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/lib/apiError';
import { workOrdersApi } from '../services/workOrdersApi';
import type {
  UpdateTaskRequest,
  WorkOrderDetail,
} from '../types/work-order.types';

export function useUpdateTask(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: UpdateTaskRequest;
    }) => workOrdersApi.updateTask(workOrderId, taskId, data),
    onSuccess: (response) => {
      queryClient.setQueryData<WorkOrderDetail>(
        ['work-orders', workOrderId],
        (old) =>
          old
            ? {
                ...old,
                status: response.workOrder.status,
                totalAmount: response.workOrder.totalAmount,
                updatedAt: response.workOrder.updatedAt,
                tasks: old.tasks.map((task) =>
                  task.id === response.task.id ? response.task : task,
                ),
              }
            : old,
      );
    },
    onError: (error) => {
      if (
        error instanceof ApiError &&
        (error.statusCode === 403 || error.statusCode === 409)
      ) {
        queryClient.invalidateQueries({
          queryKey: ['work-orders', workOrderId],
        });
      }
    },
  });
}
