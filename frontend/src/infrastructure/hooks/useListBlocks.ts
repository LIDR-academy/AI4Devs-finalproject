import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListBlocksParams, ListBlocksResponse } from "@/domain/types/block";
import { listBlocks } from "@/domain/usecases/listBlocks";

export function useListBlocks(params: ListBlocksParams) {
  return useQuery<ListBlocksResponse>({
    queryKey: [
      "blocks",
      params.start,
      params.end,
      params.blockType ?? "all",
      params.page ?? 1,
      params.limit ?? 20,
    ],
    queryFn: () => listBlocks(params),
    placeholderData: keepPreviousData,
  });
}
