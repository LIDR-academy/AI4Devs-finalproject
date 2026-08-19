import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EnrollResponse } from "@/domain/types/class";
import { joinClass } from "@/domain/usecases/joinClass";

export function useJoinClass() {
  const queryClient = useQueryClient();
  return useMutation<EnrollResponse, Error, string>({
    mutationFn: (id) => joinClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}
