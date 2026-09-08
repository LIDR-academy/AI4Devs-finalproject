import type { BlockType, Prisma, PrismaClient } from "@prisma/client";
import type { CalendarProvider } from "../../domain/ports/CalendarProvider.js";
import type { BlockPolicy, BlockRole } from "../../domain/services/BlockPolicy.js";
import { hasOverlap, type TimeInterval } from "../../domain/services/OverlapChecker.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
  ValidationError,
} from "../../infrastructure/errors.js";
import type { AuditLogger } from "../../infrastructure/logging/AuditLogger.js";

export interface CreateBlockActor {
  id: string;
  role: BlockRole;
}

export interface CreateBlockInput {
  blockType: BlockType;
  coachId?: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  actor: CreateBlockActor;
}

type BlockRow = Prisma.BlockGetPayload<{ include: { createdBy: true; coach: true } }>;

export class CreateBlock {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly calendar: CalendarProvider,
    private readonly policy: BlockPolicy,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(data: CreateBlockInput): Promise<BlockRow> {
    if (data.blockType === "GYM_WIDE") {
      return this.createGymWide(data);
    }
    return this.createPersonal(data);
  }

  private async createPersonal(data: CreateBlockInput): Promise<BlockRow> {
    const { actor, startTime, endTime, description } = data;

    if (actor.role === "ADMIN" && !data.coachId) {
      throw new ValidationError("coachId is required for personal blocks created by an Admin.");
    }

    const targetCoachId = data.coachId ?? actor.id;
    if (!this.policy.canCreatePersonal(actor.role, actor.id, targetCoachId)) {
      await this.audit(actor.id, "DENIED");
      throw new ForbiddenError(
        "Insufficient permissions to create a personal block for this coach.",
      );
    }

    const target = await this.prisma.user.findUnique({ where: { id: targetCoachId } });
    if (
      !target ||
      (target.role !== "ADMIN" && target.role !== "COACH") ||
      target.status !== "ACTIVE"
    ) {
      throw new NotFoundError("The target coach does not exist or is not an active Admin/Coach.");
    }

    this.assertValidWindow(startTime, endTime);

    const interval: TimeInterval = { start: startTime, end: endTime };
    const [coachClasses, activeBlocks] = await Promise.all([
      this.prisma.trainingClass.findMany({
        where: {
          status: "ACTIVE",
          assigned_coach_id: targetCoachId,
          start_time: { lte: interval.end },
        },
      }),
      this.prisma.block.findMany({
        where: {
          status: "ACTIVE",
          OR: [{ block_type: "GYM_WIDE" }, { block_type: "PERSONAL", coach_id: targetCoachId }],
        },
      }),
    ]);
    this.assertNoOverlap(interval, coachClasses, activeBlocks);

    return this.persist({
      blockType: data.blockType,
      coachId: targetCoachId,
      startTime,
      endTime,
      description,
      actor,
    });
  }

  private async createGymWide(data: CreateBlockInput): Promise<BlockRow> {
    const { actor, startTime, endTime, description } = data;

    if (!this.policy.canCreateGymWide(actor.role)) {
      await this.audit(actor.id, "DENIED");
      throw new ForbiddenError("Only Admins can create gym-wide blocks.");
    }

    this.assertValidWindow(startTime, endTime);

    const interval: TimeInterval = { start: startTime, end: endTime };
    const [gymClasses, activeBlocks] = await Promise.all([
      this.prisma.trainingClass.findMany({
        where: { status: "ACTIVE", start_time: { lte: interval.end } },
      }),
      this.prisma.block.findMany({ where: { status: "ACTIVE" } }),
    ]);
    this.assertNoOverlap(interval, gymClasses, activeBlocks);

    return this.persist({
      blockType: data.blockType,
      coachId: null,
      startTime,
      endTime,
      description,
      actor,
    });
  }

  private assertValidWindow(startTime: Date, endTime: Date) {
    const window = this.policy.validBlockWindow(startTime, endTime, new Date());
    if (!window.valid) {
      throw new ValidationError(`Invalid block window: ${window.reason}.`);
    }
  }

  private assertNoOverlap(
    interval: TimeInterval,
    classes: Array<{ start_time: Date; duration_minutes: number }>,
    blocks: Array<{ start_time: Date; end_time: Date }>,
  ) {
    const classOverlap = classes.some((trainingClass) =>
      hasOverlap(
        [
          {
            start: trainingClass.start_time,
            end: new Date(
              trainingClass.start_time.getTime() + trainingClass.duration_minutes * 60 * 1000,
            ),
          },
        ],
        interval,
      ),
    );
    const blockOverlap = blocks.some((block) =>
      hasOverlap([{ start: block.start_time, end: block.end_time }], interval),
    );

    if (classOverlap || blockOverlap) {
      throw new ConflictError(
        "The requested window overlaps an existing class or time block.",
        "OVERLAP_DETECTED",
      );
    }
  }

  private async persist(input: {
    blockType: BlockType;
    coachId: string | null;
    startTime: Date;
    endTime: Date;
    description?: string;
    actor: CreateBlockActor;
  }): Promise<BlockRow> {
    const { blockType, coachId, startTime, endTime, description, actor } = input;

    let eventId: string;
    try {
      eventId = await this.calendar.createEvent({
        title: blockType === "GYM_WIDE" ? "Gym Wide Block" : "Personal Block",
        startTime,
        endTime,
        timezone: "Europe/Madrid",
        description,
      });
    } catch {
      throw new ServiceUnavailableError("The calendar service is not available.");
    }

    let block: BlockRow;
    try {
      block = await this.prisma.block.create({
        data: {
          block_type: blockType,
          coach_id: coachId,
          start_time: startTime,
          end_time: endTime,
          status: "ACTIVE",
          description: description ?? null,
          google_event_id: eventId,
          created_by: actor.id,
        },
        include: { createdBy: true, coach: true },
      });
    } catch (error) {
      try {
        await this.calendar.deleteEvent(eventId);
      } catch {
        // Best-effort cleanup; the original error is preserved.
      }
      throw error;
    }

    await this.audit(actor.id, "SUCCESS", block.id);
    return block;
  }

  private async audit(actorId: string, outcome: "SUCCESS" | "DENIED", resourceId?: string) {
    await this.auditLogger.log({
      actorId,
      action: "block.create",
      resource: "BLOCK",
      resourceId,
      outcome,
    });
  }
}
