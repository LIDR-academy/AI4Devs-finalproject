import type { JoinWaitingListResponse } from "@/domain/types/waitingList";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function joinWaitingList(id: string): Promise<JoinWaitingListResponse> {
  return classesRepository.joinWaitingList(id);
}
