import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateClassPayload, CreateClassResponse } from "@/domain/types/class";
import { createClass } from "@/domain/usecases/createClass";

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation<CreateClassResponse, Error, CreateClassPayload>({
    mutationFn: (payload: CreateClassPayload) => createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}
