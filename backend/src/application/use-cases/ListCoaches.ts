import type { Coach } from "../../domain/entities/Coach.js";
import type {
  CoachFilters,
  CoachRepository,
  PaginatedResult,
} from "../../domain/ports/CoachRepository.js";

export class ListCoaches {
  constructor(private readonly repository: CoachRepository) {}

  async execute(filters: CoachFilters): Promise<PaginatedResult<Coach>> {
    return this.repository.findAll(filters);
  }
}
