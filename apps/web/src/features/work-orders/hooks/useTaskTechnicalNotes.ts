import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/lib/apiError';
import { workOrdersApi } from '../services/workOrdersApi';
import type {
  UpdateTaskTechnicalNotesRequest,
  WorkOrderDetail,
} from '../types/work-order.types';

export function useTaskTechnicalNotes(workOrderId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskTechnicalNotesRequest) =>
      workOrdersApi.patchTaskTechnicalNotes(workOrderId, taskId, data),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<WorkOrderDetail>(
        ['work-orders', workOrderId],
        (old) =>
          old
            ? {
                ...old,
                tasks: old.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        diagnosis: updatedTask.diagnosis,
                        repairPerformed: updatedTask.repairPerformed,
                        partsUsed: updatedTask.partsUsed,
                        additionalNotes: updatedTask.additionalNotes,
                      }
                    : task,
                ),
              }
            : old,
      );
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
