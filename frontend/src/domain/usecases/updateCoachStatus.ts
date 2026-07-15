import { coachesRepository } from "@/infrastructure/repositories/coachesRepository";

export async function updateCoachStatus(id: string, status: string): Promise<unknown> {
  return coachesRepository.updateStatus(id, status);
}
