import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateBlockPayload, CreateBlockResponse } from "@/domain/types/block";
import { createBlock } from "@/domain/usecases/createBlock";

export function useCreateBlock() {
  const queryClient = useQueryClient();

  return useMutation<CreateBlockResponse, Error, CreateBlockPayload>({
    mutationFn: (payload: CreateBlockPayload) => createBlock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });
}
