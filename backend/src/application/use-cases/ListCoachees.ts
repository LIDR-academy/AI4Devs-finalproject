import type { Coachee } from "../../domain/entities/Coachee.js";
import type {
  CoacheeFilters,
  CoacheeRepository,
  PaginatedResult,
} from "../../domain/ports/CoacheeRepository.js";

export class ListCoachees {
  constructor(private readonly repository: CoacheeRepository) {}

  async execute(filters: CoacheeFilters): Promise<PaginatedResult<Coachee>> {
    return this.repository.findAll(filters);
  }
}
