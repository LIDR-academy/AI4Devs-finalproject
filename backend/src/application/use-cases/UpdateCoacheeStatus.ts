import type { Coachee, CoacheeStatus } from "../../domain/entities/Coachee.js";
import type { CoacheeRepository } from "../../domain/ports/CoacheeRepository.js";
import { NotFoundError } from "../../infrastructure/errors.js";
import { logger } from "../../infrastructure/logger.js";

export class UpdateCoacheeStatus {
  constructor(private readonly repository: CoacheeRepository) {}

  async execute(id: string, status: CoacheeStatus, actorId: string): Promise<Coachee> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Coachee not found");
    }

    const updated = await this.repository.updateStatus(id, status);

    logger.info({ actorId, coacheeId: id, newStatus: status }, "Coachee status changed");

    return updated;
  }
}
