import type { PrismaClient } from "@prisma/client";
import type { CalendarProvider } from "../../domain/ports/CalendarProvider.js";
import type { BlockPolicy, BlockRole } from "../../domain/services/BlockPolicy.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
} from "../../infrastructure/errors.js";
import type { AuditLogger } from "../../infrastructure/logging/AuditLogger.js";

export interface CancelBlockActor {
  id: string;
  role: BlockRole;
}

export interface CancelBlockInput {
  id: string;
  actor: CancelBlockActor;
}

export interface CancelBlockResult {
  id: string;
  status: "CANCELED";
}

export class CancelBlock {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly calendar: CalendarProvider | null,
    private readonly policy: BlockPolicy,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(input: CancelBlockInput): Promise<CancelBlockResult> {
    const { id, actor } = input;

    const block = await this.prisma.block.findUnique({ where: { id } });
    if (!block) {
      throw new NotFoundError("Block not found.");
    }

    if (block.status === "CANCELED") {
      throw new ConflictError("The block is already canceled.");
    }

    if (!this.policy.canCancel(actor.role, actor.id, block)) {
      await this.auditLogger.log({
        actorId: actor.id,
        action: "block.cancel",
        resource: "BLOCK",
        resourceId: block.id,
        outcome: "DENIED",
      });
      throw new ForbiddenError("Insufficient permissions to cancel this block.");
    }

    if (block.google_event_id) {
      if (!this.calendar) {
        throw new ServiceUnavailableError("The calendar service is not available.");
      }
      try {
        await this.calendar.deleteEvent(block.google_event_id);
      } catch {
        throw new ServiceUnavailableError("The calendar service is not available.");
      }
    }

    await this.prisma.block.update({
      where: { id: block.id },
      data: {
        status: "CANCELED",
        google_event_id: null,
      },
    });

    await this.auditLogger.log({
      actorId: actor.id,
      action: "block.cancel",
      resource: "BLOCK",
      resourceId: block.id,
      outcome: "SUCCESS",
    });

    return { id: block.id, status: "CANCELED" };
  }
}
