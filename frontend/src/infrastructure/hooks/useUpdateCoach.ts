import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CoachUpdateData } from "@/domain/types/coach";
import { updateCoach } from "@/domain/usecases/updateCoach";
import { useToast } from "@/infrastructure/context/ToastContext";

export function useUpdateCoach(id: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: CoachUpdateData) => updateCoach(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coach", id] });
      showToast("Coach updated successfully", "success");
    },
    onError: () => {
      showToast("Something went wrong updating the coach", "error");
    },
  });
}
