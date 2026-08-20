import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JoinWaitingListResponse } from "@/domain/types/waitingList";
import { joinWaitingList } from "@/domain/usecases/joinWaitingList";
import { buildOptimisticClassMutation } from "./optimisticClassMutation";

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
  const optimistic = buildOptimisticClassMutation({ queryClient, action: "waitlist-join" });
  return useMutation<JoinWaitingListResponse, Error, string>({
    mutationFn: (id) => joinWaitingList(id),
    ...optimistic,
    onSuccess: () => {
      void invalidateWaitingListQueries(queryClient);
    },
  });
}
