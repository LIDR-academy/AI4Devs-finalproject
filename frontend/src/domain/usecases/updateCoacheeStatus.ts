import { coacheesRepository } from "@/infrastructure/repositories/coacheesRepository";

export async function updateCoacheeStatus(id: string, status: string): Promise<unknown> {
  return coacheesRepository.updateStatus(id, status);
}
