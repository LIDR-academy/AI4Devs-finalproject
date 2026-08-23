import { PrismaClient, type User } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CreateBlock, type CreateBlockInput } from "../application/use-cases/CreateBlock.js";
import type { CalendarProvider } from "../domain/ports/CalendarProvider.js";
import { BlockPolicy } from "../domain/services/BlockPolicy.js";
import { AuditLogger } from "../infrastructure/logging/AuditLogger.js";

class StubCalendarProvider implements CalendarProvider {
  public createdEventIds: string[] = [];
  public failNextCreate = false;
  public deletedEventIds: string[] = [];

  async createEvent(): Promise<string> {
    if (this.failNextCreate) {
      this.failNextCreate = false;
      throw new Error("calendar down");
    }
    const id = `stub-block-event-${this.createdEventIds.length + 1}`;
    this.createdEventIds.push(id);
    return id;
  }

  async updateEvent(): Promise<void> {}

  async deleteEvent(eventId: string): Promise<void> {
    this.deletedEventIds.push(eventId);
  }

  async queryFreeBusy(): Promise<{ busySlots: never[]; queriedCalendar: string }> {
    return { busySlots: [], queriedCalendar: "stub" };
  }
}

describe("CreateBlock (personal branch)", () => {
  const prisma = new PrismaClient();
  const calendar = new StubCalendarProvider();
  const policy = new BlockPolicy();
  const auditLogger = new AuditLogger(prisma);
  const createBlock = new CreateBlock(prisma, calendar, policy, auditLogger);

  let admin: User;
  let coach: User;
  let otherCoach: User;
  let coachee: User;
  let inactiveCoach: User;
  let createdUserIds: string[] = [];
  let createdBlockIds: string[] = [];

  function future(hoursFromNow: number): Date {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  function baseInput(overrides: Partial<CreateBlockInput> = {}): CreateBlockInput {
    return {
      blockType: "PERSONAL",
      coachId: coach.id,
      startTime: future(24),
      endTime: future(120),
      actor: { id: coach.id, role: "COACH" },
      ...overrides,
    };
  }

  beforeAll(async () => {
    admin = await prisma.user.create({
      data: {
        email: `block-admin-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Block Admin",
        phone: "+34 600 000 001",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    coach = await prisma.user.create({
      data: {
        email: `block-coach-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Block Coach",
        phone: "+34 600 000 002",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    otherCoach = await prisma.user.create({
      data: {
        email: `block-coach-2-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Block Coach 2",
        phone: "+34 600 000 003",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    coachee = await prisma.user.create({
      data: {
        email: `block-coachee-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Block Coachee",
        phone: "+34 600 000 004",
        role: "COACHEE",
        status: "ACTIVE",
      },
    });
    inactiveCoach = await prisma.user.create({
      data: {
        email: `block-inactive-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Block Inactive Coach",
        phone: "+34 600 000 005",
        role: "COACH",
        status: "INACTIVE",
      },
    });
    createdUserIds = [admin.id, coach.id, otherCoach.id, coachee.id, inactiveCoach.id];
  });

  beforeEach(async () => {
    await prisma.block.deleteMany({ where: { created_by: { in: createdUserIds } } });
    await prisma.trainingClass.deleteMany({
      where: { assigned_coach_id: { in: [coach.id, otherCoach.id] } },
    });
    await prisma.securityAuditLog.deleteMany({
      where: { action: "block.create", actor_id: { in: createdUserIds } },
    });
    createdBlockIds = [];
    calendar.createdEventIds = [];
    calendar.deletedEventIds = [];
    calendar.failNextCreate = false;
  });

  afterAll(async () => {
    await prisma.block.deleteMany({ where: { created_by: { in: createdUserIds } } });
    await prisma.trainingClass.deleteMany({
      where: { assigned_coach_id: { in: [coach.id, otherCoach.id] } },
    });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  it("creates a personal block for the actor coach, stores the calendar event, and audits SUCCESS", async () => {
    const start = future(24);
    const end = future(120);
    const result = await createBlock.execute(
      baseInput({ startTime: start, endTime: end, description: "No classes" }),
    );

    expect(result.status).toBe("ACTIVE");
    expect(result.block_type).toBe("PERSONAL");
    expect(result.coach_id).toBe(coach.id);
    expect(result.google_event_id).not.toBeNull();
    expect(calendar.createdEventIds).toHaveLength(1);

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "block.create", outcome: "SUCCESS", resource_id: result.id },
    });
    expect(audit).not.toBeNull();
  });

  it("creates a personal block as an Admin for another coach", async () => {
    const result = await createBlock.execute(
      baseInput({
        coachId: otherCoach.id,
        startTime: future(24),
        endTime: future(120),
        actor: { id: admin.id, role: "ADMIN" },
      }),
    );
    expect(result.status).toBe("ACTIVE");
    expect(result.coach_id).toBe(otherCoach.id);
    expect(calendar.createdEventIds).toHaveLength(1);
  });

  it("returns 403 when a COACH targets another coach and audits DENIED", async () => {
    await expect(
      createBlock.execute(
        baseInput({
          coachId: otherCoach.id,
          startTime: future(24),
          endTime: future(120),
          actor: { id: coach.id, role: "COACH" },
        }),
      ),
    ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "block.create", outcome: "DENIED", actor_id: coach.id },
    });
    expect(audit).not.toBeNull();
    expect(await prisma.block.count()).toBe(0);
    expect(calendar.createdEventIds).toHaveLength(0);
  });

  it("returns 403 for a COACHEE actor", async () => {
    await expect(
      createBlock.execute(
        baseInput({
          coachId: coachee.id,
          startTime: future(24),
          endTime: future(120),
          actor: { id: coachee.id, role: "COACHEE" },
        }),
      ),
    ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
  });

  it("requires coachId when an Admin creates a personal block", async () => {
    await expect(
      createBlock.execute(
        baseInput({
          coachId: undefined,
          startTime: future(24),
          endTime: future(120),
          actor: { id: admin.id, role: "ADMIN" },
        }),
      ),
    ).rejects.toMatchObject({ statusCode: 400, code: "VALIDATION_ERROR" });
  });

  it("returns 404 when the personal target coach does not exist", async () => {
    await expect(
      createBlock.execute(
        baseInput({
          coachId: "00000000-0000-0000-0000-000000000000",
          startTime: future(24),
          endTime: future(120),
          actor: { id: admin.id, role: "ADMIN" },
        }),
      ),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });

  it("returns 404 when the personal target coach is not active", async () => {
    await expect(
      createBlock.execute(
        baseInput({
          coachId: inactiveCoach.id,
          startTime: future(24),
          endTime: future(120),
          actor: { id: admin.id, role: "ADMIN" },
        }),
      ),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });

  it("returns 404 when the personal target is a Coachee", async () => {
    await expect(
      createBlock.execute(
        baseInput({
          coachId: coachee.id,
          startTime: future(24),
          endTime: future(120),
          actor: { id: admin.id, role: "ADMIN" },
        }),
      ),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });

  it("returns 400 for a misaligned window", async () => {
    const start = future(24);
    start.setUTCMinutes(30, 0, 0);
    await expect(
      createBlock.execute(baseInput({ startTime: start, endTime: future(120) })),
    ).rejects.toMatchObject({ statusCode: 400, code: "VALIDATION_ERROR" });
  });

  it("returns 400 for a window shorter than an hour", async () => {
    const start = future(24);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    await expect(
      createBlock.execute(baseInput({ startTime: start, endTime: end })),
    ).rejects.toMatchObject({ statusCode: 400, code: "VALIDATION_ERROR" });
  });

  it("returns 400 for an inverted range", async () => {
    const start = future(24);
    const end = future(23);
    await expect(
      createBlock.execute(baseInput({ startTime: start, endTime: end })),
    ).rejects.toMatchObject({ statusCode: 400, code: "VALIDATION_ERROR" });
  });

  it("returns 400 for a past start", async () => {
    const start = future(-24);
    await expect(
      createBlock.execute(baseInput({ startTime: start, endTime: future(24) })),
    ).rejects.toMatchObject({ statusCode: 400, code: "VALIDATION_ERROR" });
  });

  it("returns 409 when the window overlaps an ACTIVE class of the target coach", async () => {
    const start = future(24);
    const end = future(120);
    await prisma.trainingClass.create({
      data: {
        class_type: "INDIVIDUAL",
        assigned_coach_id: coach.id,
        level_id: null,
        start_time: new Date(start.getTime() + 60 * 60 * 1000),
        duration_minutes: 60,
        status: "ACTIVE",
        description: null,
        google_event_id: `cal-${crypto.randomUUID()}`,
        created_by: coach.id,
      },
    });

    await expect(
      createBlock.execute(baseInput({ startTime: start, endTime: end })),
    ).rejects.toMatchObject({ statusCode: 409, code: "OVERLAP_DETECTED" });
    expect(calendar.createdEventIds).toHaveLength(0);
  });

  it("returns 409 when the window overlaps an ACTIVE personal block of the target coach", async () => {
    const start = future(24);
    const end = future(120);
    const existing = await prisma.block.create({
      data: {
        block_type: "PERSONAL",
        coach_id: coach.id,
        start_time: new Date(start.getTime() + 60 * 60 * 1000),
        end_time: new Date(start.getTime() + 120 * 60 * 1000),
        status: "ACTIVE",
        description: null,
        google_event_id: `cal-${crypto.randomUUID()}`,
        created_by: otherCoach.id,
      },
    });
    createdBlockIds.push(existing.id);

    await expect(
      createBlock.execute(baseInput({ startTime: start, endTime: end })),
    ).rejects.toMatchObject({ statusCode: 409, code: "OVERLAP_DETECTED" });
  });

  it("returns 409 when the window overlaps an active gym-wide block", async () => {
    const start = future(24);
    const end = future(120);
    const existing = await prisma.block.create({
      data: {
        block_type: "GYM_WIDE",
        coach_id: null,
        start_time: new Date(start.getTime() + 60 * 60 * 1000),
        end_time: new Date(start.getTime() + 120 * 60 * 1000),
        status: "ACTIVE",
        description: null,
        google_event_id: `cal-${crypto.randomUUID()}`,
        created_by: admin.id,
      },
    });
    createdBlockIds.push(existing.id);

    await expect(
      createBlock.execute(baseInput({ startTime: start, endTime: end })),
    ).rejects.toMatchObject({ statusCode: 409, code: "OVERLAP_DETECTED" });
  });

  it("ignores CANCELED blocks during overlap checks", async () => {
    const start = future(24);
    const end = future(120);
    const canceled = await prisma.block.create({
      data: {
        block_type: "PERSONAL",
        coach_id: coach.id,
        start_time: new Date(start.getTime() + 60 * 60 * 1000),
        end_time: new Date(start.getTime() + 120 * 60 * 1000),
        status: "CANCELED",
        description: null,
        google_event_id: null,
        created_by: otherCoach.id,
      },
    });
    createdBlockIds.push(canceled.id);

    const result = await createBlock.execute(baseInput({ startTime: start, endTime: end }));
    expect(result.status).toBe("ACTIVE");
  });

  it("returns 503 and does not write the block when the calendar is unavailable", async () => {
    calendar.failNextCreate = true;
    await expect(
      createBlock.execute(baseInput({ startTime: future(24), endTime: future(120) })),
    ).rejects.toMatchObject({ statusCode: 503, code: "SERVICE_UNAVAILABLE" });
    expect(await prisma.block.count()).toBe(0);
    expect(calendar.createdEventIds).toHaveLength(0);
  });

  describe("gym-wide branch", () => {
    function gymWideInput(overrides: Partial<CreateBlockInput> = {}): CreateBlockInput {
      return {
        blockType: "GYM_WIDE",
        startTime: future(24),
        endTime: future(120),
        actor: { id: admin.id, role: "ADMIN" },
        ...overrides,
      };
    }

    it("creates a gym-wide block as an Admin, stores the event, and audits SUCCESS", async () => {
      const result = await createBlock.execute(
        gymWideInput({ startTime: future(24), endTime: future(120) }),
      );

      expect(result.status).toBe("ACTIVE");
      expect(result.block_type).toBe("GYM_WIDE");
      expect(result.coach_id).toBeNull();
      expect(result.google_event_id).not.toBeNull();
      expect(calendar.createdEventIds).toHaveLength(1);

      const audit = await prisma.securityAuditLog.findFirst({
        where: { action: "block.create", outcome: "SUCCESS", resource_id: result.id },
      });
      expect(audit).not.toBeNull();
    });

    it("returns 403 for a COACH and audits DENIED", async () => {
      await expect(
        createBlock.execute(gymWideInput({ actor: { id: coach.id, role: "COACH" } })),
      ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });

      const audit = await prisma.securityAuditLog.findFirst({
        where: { action: "block.create", outcome: "DENIED", actor_id: coach.id },
      });
      expect(audit).not.toBeNull();
      expect(await prisma.block.count()).toBe(0);
      expect(calendar.createdEventIds).toHaveLength(0);
    });

    it("returns 403 for a COACHEE actor", async () => {
      await expect(
        createBlock.execute(gymWideInput({ actor: { id: coachee.id, role: "COACHEE" } })),
      ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
    });

    it("returns 400 for a misaligned window", async () => {
      const start = future(24);
      start.setUTCMinutes(30, 0, 0);
      await expect(createBlock.execute(gymWideInput({ startTime: start }))).rejects.toMatchObject({
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    });

    it("returns 409 when overlapping any ACTIVE class", async () => {
      const start = future(24);
      await prisma.trainingClass.create({
        data: {
          class_type: "GROUP",
          assigned_coach_id: otherCoach.id,
          level_id: null,
          start_time: new Date(start.getTime() + 60 * 60 * 1000),
          duration_minutes: 60,
          status: "ACTIVE",
          description: null,
          google_event_id: `cal-${crypto.randomUUID()}`,
          created_by: admin.id,
        },
      });

      await expect(
        createBlock.execute(gymWideInput({ startTime: start, endTime: future(120) })),
      ).rejects.toMatchObject({ statusCode: 409, code: "OVERLAP_DETECTED" });
    });

    it("returns 409 when overlapping an ACTIVE personal block", async () => {
      const start = future(24);
      const existing = await prisma.block.create({
        data: {
          block_type: "PERSONAL",
          coach_id: coach.id,
          start_time: new Date(start.getTime() + 60 * 60 * 1000),
          end_time: new Date(start.getTime() + 120 * 60 * 1000),
          status: "ACTIVE",
          description: null,
          google_event_id: `cal-${crypto.randomUUID()}`,
          created_by: coach.id,
        },
      });
      createdBlockIds.push(existing.id);

      await expect(
        createBlock.execute(gymWideInput({ startTime: start, endTime: future(120) })),
      ).rejects.toMatchObject({ statusCode: 409, code: "OVERLAP_DETECTED" });
    });

    it("returns 409 when overlapping an ACTIVE gym-wide block", async () => {
      const start = future(24);
      const existing = await prisma.block.create({
        data: {
          block_type: "GYM_WIDE",
          coach_id: null,
          start_time: new Date(start.getTime() + 60 * 60 * 1000),
          end_time: new Date(start.getTime() + 120 * 60 * 1000),
          status: "ACTIVE",
          description: null,
          google_event_id: `cal-${crypto.randomUUID()}`,
          created_by: admin.id,
        },
      });
      createdBlockIds.push(existing.id);

      await expect(
        createBlock.execute(gymWideInput({ startTime: start, endTime: future(120) })),
      ).rejects.toMatchObject({ statusCode: 409, code: "OVERLAP_DETECTED" });
    });

    it("returns 503 and does not write the block when the calendar is unavailable", async () => {
      calendar.failNextCreate = true;
      await expect(
        createBlock.execute(gymWideInput({ startTime: future(24), endTime: future(120) })),
      ).rejects.toMatchObject({ statusCode: 503, code: "SERVICE_UNAVAILABLE" });
      expect(await prisma.block.count()).toBe(0);
    });
  });
});
