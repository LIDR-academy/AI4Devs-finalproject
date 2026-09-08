import type { Level } from "@/domain/types/coachee";
import { coacheesRepository } from "@/infrastructure/repositories/coacheesRepository";

export async function getLevels(): Promise<Level[]> {
  return coacheesRepository.getLevels();
}
