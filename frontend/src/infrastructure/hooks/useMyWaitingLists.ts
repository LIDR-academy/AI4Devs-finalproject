import { useQuery } from "@tanstack/react-query";
import type { WaitingListListResponse } from "@/domain/types/waitingList";
import { listWaitingLists } from "@/domain/usecases/listWaitingLists";

export function useMyWaitingLists() {
  return useQuery<WaitingListListResponse>({
    queryKey: ["waiting-lists"],
    queryFn: listWaitingLists,
  });
}
