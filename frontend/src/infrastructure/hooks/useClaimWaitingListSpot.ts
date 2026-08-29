import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ClaimWaitingListResponse } from "@/domain/types/waitingList";
import { claimWaitingListSpot } from "@/domain/usecases/claimWaitingListSpot";
import { buildOptimisticClassMutation } from "./optimisticClassMutation";

export function useClaimWaitingListSpot() {
  const queryClient = useQueryClient();
  const optimistic = buildOptimisticClassMutation({ queryClient, action: "claim" });
  return useMutation<ClaimWaitingListResponse, Error, string>({
    mutationFn: (id) => claimWaitingListSpot(id),
    ...optimistic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["waiting-lists"] });
      queryClient.invalidateQueries({ queryKey: ["coachee", "dashboard"] });
    },
  });
}
