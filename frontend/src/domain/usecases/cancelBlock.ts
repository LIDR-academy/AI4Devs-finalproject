import type { CancelBlockResponse } from "@/domain/types/block";
import { blocksRepository } from "@/infrastructure/repositories/blocksRepository";

export async function cancelBlock(id: string): Promise<CancelBlockResponse> {
  return blocksRepository.cancel(id);
}
