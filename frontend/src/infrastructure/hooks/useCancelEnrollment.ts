import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CancelEnrollmentResponse } from "@/domain/types/class";
import { cancelClassEnrollment } from "@/domain/usecases/cancelClassEnrollment";
import { buildOptimisticClassMutation } from "./optimisticClassMutation";

export function useCancelEnrollment() {
  const queryClient = useQueryClient();
  const optimistic = buildOptimisticClassMutation({ queryClient, action: "cancel" });
  return useMutation<CancelEnrollmentResponse, Error, string>({
    mutationFn: (id) => cancelClassEnrollment(id),
    ...optimistic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["coachee", "dashboard"] });
    },
  });
}
