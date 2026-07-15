import type { Coachee } from "../../domain/entities/Coachee.js";
import type { CoacheeRepository } from "../../domain/ports/CoacheeRepository.js";
import { NotFoundError } from "../../infrastructure/errors.js";
import { logger } from "../../infrastructure/logger.js";
import type { AuditLogger } from "../../infrastructure/logging/AuditLogger.js";

export class UpdateCoacheeLevel {
  constructor(
    private readonly repository: CoacheeRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(id: string, levelId: string, actorId: string): Promise<Coachee> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Coachee not found");
    }

    const updated = await this.repository.updateLevel(id, levelId);

    logger.info({ actorId, coacheeId: id, newLevelId: levelId }, "Coachee level changed");
    logger.info(
      { type: 11, recipientId: id, content: `Tu nivel ha sido actualizado a ${levelId}` },
      "Notification #11 triggered",
    );

    try {
      await this.auditLogger.log({
        actorId,
        action: "LEVEL_CHANGE",
        resource: "COACHEE",
        resourceId: id,
        outcome: "SUCCESS",
      });
    } catch (err) {
      logger.warn({ err, actorId, coacheeId: id }, "Failed to record audit log for level change");
    }

    return updated;
  }
}
