import type { LeaveWaitingListResponse } from "@/domain/types/waitingList";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function leaveWaitingList(id: string): Promise<LeaveWaitingListResponse> {
  return classesRepository.leaveWaitingList(id);
}
