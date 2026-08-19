import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JoinWaitingListResponse } from "@/domain/types/waitingList";
import { joinWaitingList } from "@/domain/usecases/joinWaitingList";

export const WAITING_LIST_JOIN_INVALIDATION_KEYS: QueryKey[] = [
  ["classes"],
  ["waiting-lists"],
  ["coachee", "dashboard"],
];

export async function invalidateWaitingListQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all(
    WAITING_LIST_JOIN_INVALIDATION_KEYS.map((key) =>
      queryClient.invalidateQueries({ queryKey: key }),
    ),
  );
}

export function useJoinWaitingList() {
  const queryClient = useQueryClient();
  return useMutation<JoinWaitingListResponse, Error, string>({
    mutationFn: (id) => joinWaitingList(id),
    onSuccess: () => {
      void invalidateWaitingListQueries(queryClient);
    },
  });
}
