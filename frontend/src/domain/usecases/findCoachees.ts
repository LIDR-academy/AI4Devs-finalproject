import type { Coachee } from "@/domain/types/coachee";
import { coacheesRepository } from "@/infrastructure/repositories/coacheesRepository";
import type { PaginatedResponse } from "@/infrastructure/types/api";

export async function findCoachees(
  status?: string,
  levelId?: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Coachee>> {
  return coacheesRepository.get(status, levelId, page, limit);
}
