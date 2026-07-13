import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCoachee } from "@/domain/usecases/updateCoachee";

export function useUpdateCoachee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; email?: string; phone?: string }) =>
      updateCoachee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachees"] });
      queryClient.invalidateQueries({ queryKey: ["coachee", id] });
    },
  });
}
