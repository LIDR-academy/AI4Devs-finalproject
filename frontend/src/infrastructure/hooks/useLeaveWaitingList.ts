import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LeaveWaitingListResponse } from "@/domain/types/waitingList";
import { leaveWaitingList } from "@/domain/usecases/leaveWaitingList";
import { buildOptimisticClassMutation } from "./optimisticClassMutation";

export function useLeaveWaitingList() {
  const queryClient = useQueryClient();
  const optimistic = buildOptimisticClassMutation({ queryClient, action: "waitlist-leave" });
  return useMutation<LeaveWaitingListResponse, Error, string>({
    mutationFn: (id) => leaveWaitingList(id),
    ...optimistic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["waiting-lists"] });
      queryClient.invalidateQueries({ queryKey: ["coachee", "dashboard"] });
    },
  });
}
