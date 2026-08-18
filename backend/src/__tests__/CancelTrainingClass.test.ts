import { PrismaClient, type User } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CancelRecurringSeries } from "../application/use-cases/CancelRecurringSeries.js";
import { CancelTrainingClass } from "../application/use-cases/CancelTrainingClass.js";
import type { CalendarProvider } from "../domain/ports/CalendarProvider.js";
import { ClassCancellationPolicy } from "../domain/services/ClassCancellationPolicy.js";
import { AuditLogger } from "../infrastructure/logging/AuditLogger.js";

class StubCalendarProvider implements CalendarProvider {
  public deletedEvents: string[] = [];
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
    this.deletedEvents.push(eventId);
  }

  async queryFreeBusy(): Promise<{ busySlots: never[]; queriedCalendar: string }> {
    return { busySlots: [], queriedCalendar: "stub" };
  }
}

describe("CancelTrainingClass & CancelRecurringSeries", () => {
  const prisma = new PrismaClient();
  const calendar = new StubCalendarProvider();
  const policy = new ClassCancellationPolicy();
  const auditLogger = new AuditLogger(prisma);

  let admin: User;
  let coach: User;
  let otherCoach: User;
  let coachee: User;
  let coachee2: User;
  let createdUserIds: string[] = [];
  let seriesId: string | null = null;

  function future(hoursFromNow: number): Date {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + hoursFromNow);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  function past(hoursAgo: number): Date {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() - hoursAgo);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  const ids: string[] = [];

  async function createClass(overrides: {
    start_time: Date;
    status?: "ACTIVE" | "CANCELED";
    google_event_id?: string | null;
    recurrence_series_id?: string | null;
    assigned_coach_id?: string;
  }): Promise<string> {
    const created = await prisma.trainingClass.create({
      data: {
        class_type: "INDIVIDUAL",
        assigned_coach_id: overrides.assigned_coach_id ?? coach.id,
        level_id: null,
        start_time: overrides.start_time,
        duration_minutes: 60,
        status: overrides.status ?? "ACTIVE",
        description: null,
        recurrence_series_id: overrides.recurrence_series_id ?? null,
        google_event_id: overrides.google_event_id ?? `cal-${crypto.randomUUID()}`,
        created_by: coach.id,
      },
    });
    ids.push(created.id);
    return created.id;
  }

  beforeAll(async () => {
    admin = await prisma.user.create({
      data: {
        email: `cancel-admin-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Admin",
        phone: "+34 600 000 011",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    coach = await prisma.user.create({
      data: {
        email: `cancel-coach-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Coach",
        phone: "+34 600 000 012",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    otherCoach = await prisma.user.create({
      data: {
        email: `cancel-coach-2-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Coach 2",
        phone: "+34 600 000 013",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    coachee = await prisma.user.create({
      data: {
        email: `cancel-coachee-1-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Coachee 1",
        phone: "+34 600 000 014",
        role: "COACHEE",
        status: "ACTIVE",
      },
    });
    coachee2 = await prisma.user.create({
      data: {
        email: `cancel-coachee-2-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Cancel Coachee 2",
        phone: "+34 600 000 015",
        role: "COACHEE",
        status: "ACTIVE",
      },
    });
    createdUserIds = [admin.id, coach.id, otherCoach.id, coachee.id, coachee2.id];
  });

  beforeEach(async () => {
    await prisma.classEnrollment.deleteMany();
    await prisma.waitingList.deleteMany();
    if (ids.length) {
      await prisma.notification.deleteMany({ where: { class_id: { in: ids } } });
      await prisma.trainingClass.deleteMany({ where: { id: { in: ids } } });
      ids.length = 0;
    }
    if (seriesId) {
      await prisma.recurrenceSeries.delete({ where: { id: seriesId } }).catch(() => undefined);
      seriesId = null;
    }
    await prisma.securityAuditLog.deleteMany({
      where: { action: "class.cancel", actor_id: { in: createdUserIds } },
    });
    calendar.deletedEvents = [];
    calendar.failNextDelete = false;
  });

  afterAll(async () => {
    if (ids.length) {
      await prisma.notification.deleteMany({ where: { class_id: { in: ids } } });
      await prisma.trainingClass.deleteMany({ where: { id: { in: ids } } });
    }
    if (seriesId) {
      await prisma.recurrenceSeries.delete({ where: { id: seriesId } }).catch(() => undefined);
    }
    await prisma.securityAuditLog.deleteMany({ where: { actor_id: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  const cancel = new CancelTrainingClass(prisma, calendar, policy, auditLogger);
  const cancelSeries = new CancelRecurringSeries(prisma, calendar, policy, auditLogger);

  describe("CancelTrainingClass", () => {
    it("soft-cancels a single class as the assigned coach (200 path)", async () => {
      const classId = await createClass({ start_time: future(24) });
      await prisma.classEnrollment.create({ data: { class_id: classId, coachee_id: coachee.id } });

      const result = await cancel.execute({
        id: classId,
        scope: "single",
        actor: { id: coach.id, role: "COACH" },
      });

      expect(result.status).toBe("CANCELED");
      expect(result.canceledInstances).toBeNull();

      const stored = await prisma.trainingClass.findUnique({ where: { id: classId } });
      expect(stored?.status).toBe("CANCELED");
      expect(calendar.deletedEvents).toHaveLength(1);

      const notifications = await prisma.notification.findMany({
        where: { class_id: classId },
      });
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({
        notification_type: 7,
        recipient_id: coachee.id,
      });

      const audit = await prisma.securityAuditLog.findFirst({
        where: { action: "class.cancel", outcome: "SUCCESS", resource_id: classId },
      });
      expect(audit?.resource_id).toBe(classId);
    });

    it("allows an Admin to cancel any class", async () => {
      const classId = await createClass({ start_time: future(24) });
      const result = await cancel.execute({
        id: classId,
        scope: "single",
        actor: { id: admin.id, role: "ADMIN" },
      });
      expect(result.status).toBe("CANCELED");
    });

    it("returns 403 when the actor is not the assigned coach and not an admin", async () => {
      const classId = await createClass({ start_time: future(24) });
      await expect(
        cancel.execute({
          id: classId,
          scope: "single",
          actor: { id: otherCoach.id, role: "COACH" },
        }),
      ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });

      await expect(
        cancel.execute({
          id: classId,
          scope: "single",
          actor: { id: coachee.id, role: "COACHEE" },
        }),
      ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });

      const audit = await prisma.securityAuditLog.findFirst({
        where: { action: "class.cancel", outcome: "DENIED", resource_id: classId },
      });
      expect(audit).not.toBeNull();
    });

    it("returns 404 for a non-existent class", async () => {
      await expect(
        cancel.execute({
          id: "00000000-0000-0000-0000-000000000000",
          scope: "single",
          actor: { id: admin.id, role: "ADMIN" },
        }),
      ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
    });

    it("returns 409 when the class is already canceled", async () => {
      const classId = await createClass({
        start_time: future(24),
        status: "CANCELED",
        google_event_id: null,
      });
      await expect(
        cancel.execute({
          id: classId,
          scope: "single",
          actor: { id: admin.id, role: "ADMIN" },
        }),
      ).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });
    });

    it("returns 503 and does not mutate the DB when the calendar is unavailable", async () => {
      const classId = await createClass({ start_time: future(24) });
      calendar.failNextDelete = true;

      await expect(
        cancel.execute({
          id: classId,
          scope: "single",
          actor: { id: admin.id, role: "ADMIN" },
        }),
      ).rejects.toMatchObject({ statusCode: 503, code: "SERVICE_UNAVAILABLE" });

      const stored = await prisma.trainingClass.findUnique({ where: { id: classId } });
      expect(stored?.status).toBe("ACTIVE");
    });
  });

  describe("CancelTrainingClass scope=series", () => {
    it("cancels future active instances, preserves past ones, and reports the count", async () => {
      seriesId = (
        await prisma.recurrenceSeries.create({
          data: {
            class_type: "INDIVIDUAL",
            level_id: null,
            coach_id: coach.id,
            day_of_week: 1,
            start_time: future(24),
            start_date: future(24),
            created_by: coach.id,
          },
        })
      ).id;

      const pastInstance = await createClass({
        start_time: past(48),
        google_event_id: null,
        recurrence_series_id: seriesId,
      });
      const target = await createClass({ start_time: future(24), recurrence_series_id: seriesId });
      const next = await createClass({
        start_time: future(24 * 8),
        recurrence_series_id: seriesId,
      });
      const canceledAlready = await createClass({
        start_time: future(24 * 15),
        status: "CANCELED",
        google_event_id: null,
        recurrence_series_id: seriesId,
      });

      await prisma.classEnrollment.create({ data: { class_id: target, coachee_id: coachee.id } });

      const result = await cancel.execute({
        id: target,
        scope: "series",
        actor: { id: admin.id, role: "ADMIN" },
      });

      expect(result.status).toBe("CANCELED");
      expect(result.canceledInstances).toBe(2);

      const pastStored = await prisma.trainingClass.findUnique({ where: { id: pastInstance } });
      expect(pastStored?.status).toBe("ACTIVE");
      const targetStored = await prisma.trainingClass.findUnique({ where: { id: target } });
      expect(targetStored?.status).toBe("CANCELED");
      const nextStored = await prisma.trainingClass.findUnique({ where: { id: next } });
      expect(nextStored?.status).toBe("CANCELED");
      const canceledAlreadyStored = await prisma.trainingClass.findUnique({
        where: { id: canceledAlready },
      });
      expect(canceledAlreadyStored?.status).toBe("CANCELED");

      expect(calendar.deletedEvents.filter((id) => id.startsWith("cal-"))).toHaveLength(2);

      const notifications = await prisma.notification.findMany({ where: { class_id: target } });
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({
        notification_type: 7,
        recipient_id: coachee.id,
      });
    });
  });

  describe("CancelRecurringSeries", () => {
    it("cancels the whole future series and returns the count", async () => {
      seriesId = (
        await prisma.recurrenceSeries.create({
          data: {
            class_type: "INDIVIDUAL",
            level_id: null,
            coach_id: coach.id,
            day_of_week: 2,
            start_time: future(24),
            start_date: future(24),
            created_by: coach.id,
          },
        })
      ).id;

      const pastInstance = await createClass({
        start_time: past(48),
        google_event_id: null,
        recurrence_series_id: seriesId,
      });
      const futureInstance = await createClass({
        start_time: future(24),
        recurrence_series_id: seriesId,
      });

      await prisma.classEnrollment.create({
        data: { class_id: futureInstance, coachee_id: coachee.id },
      });

      const result = await cancelSeries.execute({
        seriesId,
        actor: { id: admin.id, role: "ADMIN" },
      });

      expect(result.status).toBe("CANCELED");
      expect(result.canceledInstanceCount).toBe(1);

      const pastStored = await prisma.trainingClass.findUnique({ where: { id: pastInstance } });
      expect(pastStored?.status).toBe("ACTIVE");
      const futureStored = await prisma.trainingClass.findUnique({
        where: { id: futureInstance },
      });
      expect(futureStored?.status).toBe("CANCELED");
    });

    it("allows the creator coach to cancel the series", async () => {
      seriesId = (
        await prisma.recurrenceSeries.create({
          data: {
            class_type: "INDIVIDUAL",
            level_id: null,
            coach_id: coach.id,
            day_of_week: 3,
            start_time: future(24),
            start_date: future(24),
            created_by: coach.id,
          },
        })
      ).id;
      await createClass({ start_time: future(24), recurrence_series_id: seriesId });

      const result = await cancelSeries.execute({
        seriesId,
        actor: { id: coach.id, role: "COACH" },
      });
      expect(result.canceledInstanceCount).toBe(1);
    });

    it("returns 403 for a coach that neither created the series nor is assigned", async () => {
      seriesId = (
        await prisma.recurrenceSeries.create({
          data: {
            class_type: "INDIVIDUAL",
            level_id: null,
            coach_id: coach.id,
            day_of_week: 4,
            start_time: future(24),
            start_date: future(24),
            created_by: coach.id,
          },
        })
      ).id;
      await createClass({ start_time: future(24), recurrence_series_id: seriesId });

      await expect(
        cancelSeries.execute({
          seriesId,
          actor: { id: otherCoach.id, role: "COACH" },
        }),
      ).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
    });

    it("returns 404 for a non-existent series", async () => {
      await expect(
        cancelSeries.execute({
          seriesId: "00000000-0000-0000-0000-000000000000",
          actor: { id: admin.id, role: "ADMIN" },
        }),
      ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
    });
  }, 40000);
});
