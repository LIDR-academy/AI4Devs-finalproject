import type { Coach, CoachUpdateData } from "@/domain/types/coach";
import { coachesRepository } from "@/infrastructure/repositories/coachesRepository";

export async function updateCoach(id: string, data: CoachUpdateData): Promise<Coach> {
  return coachesRepository.update(id, data);
}
