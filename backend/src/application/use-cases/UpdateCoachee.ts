import type { Coachee, UpdateCoacheeData } from "../../domain/entities/Coachee.js";
import type { CoacheeRepository } from "../../domain/ports/CoacheeRepository.js";
import type { CoacheeService } from "../../domain/services/CoacheeService.js";
import { ConflictError, NotFoundError } from "../../infrastructure/errors.js";

export class UpdateCoachee {
  constructor(
    private readonly repository: CoacheeRepository,
    private readonly service: CoacheeService,
  ) {}

  async execute(id: string, data: UpdateCoacheeData): Promise<Coachee> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Coachee not found");
    }

    if (data.email && data.email !== existing.email) {
      try {
        await this.service.assertEmailUnique(data.email, id);
      } catch {
        throw new ConflictError("Email already in use by another user", "CONFLICT");
      }
    }

    return this.repository.update(id, data);
  }
}
