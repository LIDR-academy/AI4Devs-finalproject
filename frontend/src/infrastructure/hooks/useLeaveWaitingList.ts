import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LeaveWaitingListResponse } from "@/domain/types/waitingList";
import { leaveWaitingList } from "@/domain/usecases/leaveWaitingList";

export function useLeaveWaitingList() {
  const queryClient = useQueryClient();
  return useMutation<LeaveWaitingListResponse, Error, string>({
    mutationFn: (id) => leaveWaitingList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["waiting-lists"] });
      queryClient.invalidateQueries({ queryKey: ["coachee", "dashboard"] });
    },
  });
}
