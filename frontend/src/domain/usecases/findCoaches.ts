import type { Coach } from "@/domain/types/coach";
import { coachesRepository } from "@/infrastructure/repositories/coachesRepository";
import type { PaginatedResponse } from "@/infrastructure/types/api";

export async function findCoaches(
  status?: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Coach>> {
  return coachesRepository.get(status, page, limit);
}
