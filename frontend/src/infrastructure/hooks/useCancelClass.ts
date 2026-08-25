import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CancelClassResponse, CancelClassScope } from "@/domain/types/class";
import { cancelClass } from "@/domain/usecases/cancelClass";

export function useCancelClass() {
  const queryClient = useQueryClient();
  return useMutation<CancelClassResponse, Error, { id: string; scope: CancelClassScope }>({
    mutationFn: ({ id, scope }) => cancelClass(id, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}
