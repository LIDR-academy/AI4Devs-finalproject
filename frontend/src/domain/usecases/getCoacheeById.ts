import type { Coachee } from "@/domain/types/coachee";
import { coacheesRepository } from "@/infrastructure/repositories/coacheesRepository";

export async function getCoacheeById(id: string): Promise<Coachee> {
  return coacheesRepository.getById(id);
}
