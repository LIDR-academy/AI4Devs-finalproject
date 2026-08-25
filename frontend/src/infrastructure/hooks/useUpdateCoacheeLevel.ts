import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCoacheeLevel } from "@/domain/usecases/updateCoacheeLevel";
import { useToast } from "@/infrastructure/context/ToastContext";

export function useUpdateCoacheeLevel() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, levelId }: { id: string; levelId: string }) =>
      updateCoacheeLevel(id, levelId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coachees"] });
      queryClient.invalidateQueries({ queryKey: ["coachee", variables.id] });
      showToast("Level updated successfully", "success");
    },
    onError: () => {
      showToast("Something went wrong updating the level", "error");
    },
  });
}
