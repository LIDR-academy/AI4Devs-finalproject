import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCoacheeLevel } from "@/domain/usecases/updateCoacheeLevel";

export function useUpdateCoacheeLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, levelId }: { id: string; levelId: string }) =>
      updateCoacheeLevel(id, levelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachees"] });
    },
  });
}
