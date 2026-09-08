import type { Coachee, CoacheeFormData } from "@/domain/types/coachee";
import { coacheesRepository } from "@/infrastructure/repositories/coacheesRepository";

export async function createCoachee(form: CoacheeFormData): Promise<Coachee> {
  return coacheesRepository.create(form);
}
