import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Coachee, CoacheeFormData } from "@/domain/types/coachee";
import { createCoachee } from "@/domain/usecases/createCoachee";

export function useCreateCoachee() {
  const queryClient = useQueryClient();
  return useMutation<Coachee, Error, CoacheeFormData>({
    mutationFn: (form: CoacheeFormData) => createCoachee(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachees"] });
    },
  });
}
