import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/lib/apiError';
import { workOrdersApi } from '../services/workOrdersApi';
import type {
  UpdateVisitNotesRequest,
  WorkOrderDetail,
} from '../types/work-order.types';

export function useVisitNotes(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateVisitNotesRequest) =>
      workOrdersApi.patchVisitNotes(workOrderId, data),
    onSuccess: (response) => {
      queryClient.setQueryData<WorkOrderDetail>(
        ['work-orders', workOrderId],
        (old) =>
          old
            ? {
                ...old,
                status: response.status,
                visitDiagnosis: response.visitDiagnosis,
                visitRepairSummary: response.visitRepairSummary,
                visitPartsUsed: response.visitPartsUsed,
                visitAdditionalNotes: response.visitAdditionalNotes,
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
