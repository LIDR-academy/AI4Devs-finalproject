import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EnrollResponse } from "@/domain/types/class";
import { joinClass } from "@/domain/usecases/joinClass";
import { buildOptimisticClassMutation } from "./optimisticClassMutation";

export function useJoinClass() {
  const queryClient = useQueryClient();
  const optimistic = buildOptimisticClassMutation({ queryClient, action: "join" });
  return useMutation<EnrollResponse, Error, string>({
    mutationFn: (id) => joinClass(id),
    ...optimistic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["coachee", "dashboard"] });
    },
  });
}
