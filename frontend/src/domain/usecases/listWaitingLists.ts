import type { WaitingListListResponse } from "@/domain/types/waitingList";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function listWaitingLists(): Promise<WaitingListListResponse> {
  return classesRepository.listWaitingLists();
}
