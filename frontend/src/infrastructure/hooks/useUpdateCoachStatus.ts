import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCoachStatus } from "@/domain/usecases/updateCoachStatus";
import { useToast } from "@/infrastructure/context/ToastContext";

export function useUpdateCoachStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateCoachStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      queryClient.invalidateQueries({ queryKey: ["coach", variables.id] });
      showToast(
        `Coach ${variables.status === "active" ? "activated" : "deactivated"} successfully`,
        "success",
      );
    },
    onError: () => {
      showToast("Something went wrong updating the status", "error");
    },
  });
}
