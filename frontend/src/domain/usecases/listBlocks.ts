import type { ListBlocksParams, ListBlocksResponse } from "@/domain/types/block";
import { blocksRepository } from "@/infrastructure/repositories/blocksRepository";

export async function listBlocks(params: ListBlocksParams): Promise<ListBlocksResponse> {
  return blocksRepository.list(params);
}
