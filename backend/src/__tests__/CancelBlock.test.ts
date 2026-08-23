import { PrismaClient, type User } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CancelBlock } from "../application/use-cases/CancelBlock.js";
import type { CalendarProvider } from "../domain/ports/CalendarProvider.js";
import { BlockPolicy } from "../domain/services/BlockPolicy.js";
import { AuditLogger } from "../infrastructure/logging/AuditLogger.js";

class StubCalendarProvider implements CalendarProvider {
  public deletedEventIds: string[] = [];
  public failNextDelete = false;

  async createEvent(): Promise<string> {
    return "stub-event";
  }

  async updateEvent(): Promise<void> {}

  async deleteEvent(eventId: string): Promise<void> {
    if (this.failNextDelete) {
      this.failNextDelete = false;
      throw new Error("calendar down");
    }
    this.deletedEventIds.push(eventId);
  }

  async queryFreeBusy(): Promise<{ busySlots: never[]; queriedCalendar: string }> {
    return { busySlots: [], queriedCalendar: "stub" };
  }
}

describe("CancelBlock", () => {
  const prisma = new PrismaClient();
  const calendar = new StubCalendarProvider();
  const policy = new BlockPolicy();
  const auditLogger = new AuditLogger(prisma);
  const cancelBlock = new CancelBlock(prisma, calendar, policy, auditLogger);

  let admin: User;
  let coach: User;
  let otherCoach: User;
  let coachee: User;
  let createdUserIds: string[] = [];
  let createdBlockIds: string[] = [];

  function future(hoursFromNow: number): Date {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  async function createBlock(overrides: {
    blockType?: "PERSONAL" | "GYM_WIDE";
    coachId?: string | null;
    createdBy?: string;
    status?: "ACTIVE" | "CANCELED";
    googleEventId?: string | null;
  }): Promise<string> {
    const created = await prisma.block.create({
      data: {
        block_type: overrides.blockType ?? "PERSONAL",
        created_by: overrides.createdBy ?? coach.id,
        coach_id: overrides.coachId ?? coach.id,
        start_time: future(24),
        end_time: future(120),
        status: overrides.status ?? "ACTIVE",
        description: null,
        google_event_id:
          overrides.googleEventId === undefined
            ? `cal-${crypto.randomUUID()}`
            : overrides.googleEventId,
      },
    });
    createdBlockIds.push(created.id);
    return created.id;
  }

  beforeAll(async () => {
    admin = await prisma.user.create({
      data: {
        email: `cancelblock-admin-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Block Admin",
        phone: "+34 600 000 031",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    coach = await prisma.user.create({
      data: {
        email: `cancelblock-coach-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Block Coach",
        phone: "+34 600 000 032",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    otherCoach = await prisma.user.create({
      data: {
        email: `cancelblock-coach2-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Block Coach 2",
        phone: "+34 600 000 033",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    coachee = await prisma.user.create({
      data: {
        email: `cancelblock-coachee-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Block Coachee",
        phone: "+34 600 000 034",
        role: "COACHEE",
        status: "ACTIVE",
      },
    });
    createdUserIds = [admin.id, coach.id, otherCoach.id, coachee.id];
  });

  beforeEach(async () => {
    await prisma.block.deleteMany({ where: { created_by: { in: createdUserIds } } });
    await prisma.securityAuditLog.deleteMany({
      where: { action: "block.cancel", actor_id: { in: createdUserIds } },
    });
    createdBlockIds = [];
    calendar.deletedEventIds = [];
    calendar.failNextDelete = false;
  });

  afterAll(async () => {
    await prisma.block.deleteMany({ where: { created_by: { in: createdUserIds } } });
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  it("soft-cancels a block as an Admin, clears the event, and audits SUCCESS", async () => {
    const blockId = await createBlock({});

    const result = await cancelBlock.execute({
      id: blockId,
      actor: { id: admin.id, role: "ADMIN" },
    });

    expect(result).toEqual({ id: blockId, status: "CANCELED" });

    const stored = await prisma.block.findUnique({ where: { id: blockId } });
    expect(stored?.status).toBe("CANCELED");
    expect(stored?.google_event_id).toBeNull();
    expect(calendar.deletedEventIds).toHaveLength(1);

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "block.cancel", outcome: "SUCCESS", resource_id: blockId },
    });
    expect(audit).not.toBeNull();
  });

  it("soft-cancels the creator coach's own personal block", async () => {
    const blockId = await createBlock({ createdBy: coach.id, coachId: coach.id });

    const result = await cancelBlock.execute({
      id: blockId,
      actor: { id: coach.id, role: "COACH" },
    });
    expect(result.status).toBe("CANCELED");
  });

  it("returns 403 for a coach canceling another coach's personal block and audits DENIED", async () => {
    const blockId = await createBlock({ createdBy: otherCoach.id, coachId: otherCoach.id });

    await expect(
      cancelBlock.execute({ id: blockId, actor: { id: coach.id, role: "COACH" } }),
    ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });

    const audit = await prisma.securityAuditLog.findFirst({
      where: { action: "block.cancel", outcome: "DENIED", resource_id: blockId },
    });
    expect(audit).not.toBeNull();
    expect(calendar.deletedEventIds).toHaveLength(0);
  });

  it("returns 403 for a coach canceling a gym-wide block", async () => {
    const blockId = await createBlock({
      blockType: "GYM_WIDE",
      coachId: null,
      createdBy: admin.id,
    });

    await expect(
      cancelBlock.execute({ id: blockId, actor: { id: coach.id, role: "COACH" } }),
    ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
  });

  it("returns 403 for a COACHEE actor", async () => {
    const blockId = await createBlock({});

    await expect(
      cancelBlock.execute({ id: blockId, actor: { id: coachee.id, role: "COACHEE" } }),
    ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
  });

  it("returns 404 for a non-existent block", async () => {
    await expect(
      cancelBlock.execute({
        id: "00000000-0000-0000-0000-000000000000",
        actor: { id: admin.id, role: "ADMIN" },
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
  });

  it("returns 409 when the block is already canceled", async () => {
    const blockId = await createBlock({ status: "CANCELED", googleEventId: null });

    await expect(
      cancelBlock.execute({ id: blockId, actor: { id: admin.id, role: "ADMIN" } }),
    ).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });
  });

  it("returns 503 and does not mutate the DB when the calendar delete fails", async () => {
    const blockId = await createBlock({});
    calendar.failNextDelete = true;

    await expect(
      cancelBlock.execute({ id: blockId, actor: { id: admin.id, role: "ADMIN" } }),
    ).rejects.toMatchObject({ statusCode: 503, code: "SERVICE_UNAVAILABLE" });

    const stored = await prisma.block.findUnique({ where: { id: blockId } });
    expect(stored?.status).toBe("ACTIVE");
    expect(stored?.google_event_id).not.toBeNull();
  });

  it("returns 503 and does not mutate the DB when no calendar is provided but the block has a google_event_id", async () => {
    const blockId = await createBlock({});
    const noCalendarCancel = new CancelBlock(prisma, null, policy, auditLogger);

    await expect(
      noCalendarCancel.execute({ id: blockId, actor: { id: admin.id, role: "ADMIN" } }),
    ).rejects.toMatchObject({ statusCode: 503, code: "SERVICE_UNAVAILABLE" });

    const stored = await prisma.block.findUnique({ where: { id: blockId } });
    expect(stored?.status).toBe("ACTIVE");
    expect(stored?.google_event_id).not.toBeNull();
    expect(calendar.deletedEventIds).toHaveLength(0);
  });
});
