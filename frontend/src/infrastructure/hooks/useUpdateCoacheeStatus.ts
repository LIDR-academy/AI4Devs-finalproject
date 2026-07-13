import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCoacheeStatus } from "@/domain/usecases/updateCoacheeStatus";

export function useUpdateCoacheeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateCoacheeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coachees"] });
    },
  });
}
