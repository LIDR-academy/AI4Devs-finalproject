import type { Coach } from "@/domain/types/coach";
import { coachesRepository } from "@/infrastructure/repositories/coachesRepository";

export async function getCoachById(id: string): Promise<Coach> {
  return coachesRepository.getById(id);
}
