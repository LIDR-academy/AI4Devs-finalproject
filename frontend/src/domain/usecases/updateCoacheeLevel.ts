import { coacheesRepository } from "@/infrastructure/repositories/coacheesRepository";

export async function updateCoacheeLevel(id: string, levelId: string): Promise<unknown> {
  return coacheesRepository.updateLevel(id, levelId);
}
