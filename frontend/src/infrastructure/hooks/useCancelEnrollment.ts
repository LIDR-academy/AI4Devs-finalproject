import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CancelEnrollmentResponse } from "@/domain/types/class";
import { cancelClassEnrollment } from "@/domain/usecases/cancelClassEnrollment";

export function useCancelEnrollment() {
  const queryClient = useQueryClient();
  return useMutation<CancelEnrollmentResponse, Error, string>({
    mutationFn: (id) => cancelClassEnrollment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["coachee", "dashboard"] });
    },
  });
}
