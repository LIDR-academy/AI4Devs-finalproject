import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JoinWaitingListResponse } from "@/domain/types/waitingList";
import { joinWaitingList } from "@/domain/usecases/joinWaitingList";

export function useJoinWaitingList() {
  const queryClient = useQueryClient();
  return useMutation<JoinWaitingListResponse, Error, string>({
    mutationFn: (id) => joinWaitingList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["waiting-lists"] });
    },
  });
}
