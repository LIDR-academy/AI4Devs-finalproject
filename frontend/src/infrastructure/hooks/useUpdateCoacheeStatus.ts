import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCoacheeStatus } from "@/domain/usecases/updateCoacheeStatus";
import { useToast } from "@/infrastructure/context/ToastContext";

export function useUpdateCoacheeStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateCoacheeStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coachees"] });
      queryClient.invalidateQueries({ queryKey: ["coachee", variables.id] });
      showToast(
        `Coachee ${variables.status === "active" ? "activated" : "deactivated"} successfully`,
        "success",
      );
    },
    onError: () => {
      showToast("Something went wrong updating the status", "error");
    },
  });
}
