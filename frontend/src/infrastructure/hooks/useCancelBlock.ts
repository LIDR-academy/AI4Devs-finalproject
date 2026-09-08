import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CancelBlockResponse } from "@/domain/types/block";
import { cancelBlock } from "@/domain/usecases/cancelBlock";

export function useCancelBlock() {
  const queryClient = useQueryClient();

  return useMutation<CancelBlockResponse, Error, string>({
    mutationFn: (id: string) => cancelBlock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    },
  });
}
