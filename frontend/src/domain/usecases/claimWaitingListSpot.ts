import type { ClaimWaitingListResponse } from "@/domain/types/waitingList";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function claimWaitingListSpot(id: string): Promise<ClaimWaitingListResponse> {
  return classesRepository.claimWaitingListSpot(id);
}
