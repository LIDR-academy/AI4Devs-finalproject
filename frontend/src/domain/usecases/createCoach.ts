import type { Coach, CoachFormData } from "@/domain/types/coach";
import { coachesRepository } from "@/infrastructure/repositories/coachesRepository";

export async function createCoach(form: CoachFormData): Promise<Coach> {
  return coachesRepository.create(form);
}
