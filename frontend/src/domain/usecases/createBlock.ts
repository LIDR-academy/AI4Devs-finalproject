import type { CreateBlockPayload, CreateBlockResponse } from "@/domain/types/block";
import { blocksRepository } from "@/infrastructure/repositories/blocksRepository";

export async function createBlock(payload: CreateBlockPayload): Promise<CreateBlockResponse> {
  return blocksRepository.create(payload);
}
