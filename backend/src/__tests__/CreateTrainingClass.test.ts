import type { PrismaClient, User } from "@prisma/client";
import { PrismaClient as PrismaClientInstance } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  CreateTrainingClass,
  type CreateTrainingClassData,
} from "../application/use-cases/CreateTrainingClass.js";
import type { CalendarEventData, CalendarProvider } from "../domain/ports/CalendarProvider.js";
import { zonedWallClockParts } from "../domain/services/TimeZoneMath.js";

class StubCalendarProvider implements CalendarProvider {
  public createdEventIds: string[] = [];
  public createdEvents: CalendarEventData[] = [];
  private counter = 0;

  async createEvent(data: CalendarEventData): Promise<string> {
    this.counter += 1;
    const id = `stub-event-${this.counter}`;
    this.createdEventIds.push(id);
    this.createdEvents.push(data);
    return id;
  }

  async updateEvent(): Promise<void> {}

  async deleteEvent(eventId: string): Promise<void> {
    this.createdEventIds = this.createdEventIds.filter((id) => id !== eventId);
    this.createdEvents = this.createdEvents.filter((e) => e.title !== `__ignore_${eventId}__`);
  }

  async queryFreeBusy(): Promise<{ busySlots: never[]; queriedCalendar: string }> {
    return { busySlots: [], queriedCalendar: "stub" };
  }
}

describe("CreateTrainingClass", () => {
  const prisma: PrismaClient = new PrismaClientInstance();
  const calendar = new StubCalendarProvider();
  let createTrainingClass: CreateTrainingClass;
  let admin: User;
  let coach: User;
  let coachees: User[];
  let levelIds: Record<string, string>;

  beforeAll(async () => {
    createTrainingClass = new CreateTrainingClass(prisma, calendar);
    const allLevels = await prisma.level.findMany({ orderBy: { sort_order: "asc" } });
    levelIds = Object.fromEntries(allLevels.map((l) => [l.name, l.id]));

    admin = await prisma.user.create({
      data: {
        email: `use-case-admin-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Use Case Admin",
        phone: "+34 600 000 001",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    coach = await prisma.user.create({
      data: {
        email: `use-case-coach-${Date.now()}@example.com`,
        password_hash: "not-used",
        name: "Use Case Coach",
        phone: "+34 600 000 002",
        role: "COACH",
        status: "ACTIVE",
      },
    });
    coachees = [];
    for (let i = 0; i < 5; i++) {
      const levelName = ["Principiante", "Basico", "Intermedio", "Avanzado", "Experto"][i];
      const coachee = await prisma.user.create({
        data: {
          email: `use-case-coachee-${i}-${Date.now()}@example.com`,
          password_hash: "not-used",
          name: `Use Case Coachee ${i + 1}`,
          phone: `+34 600 000 01${i}`,
          role: "COACHEE",
          status: "ACTIVE",
          level_id: levelIds[levelName],
        },
      });
      coachees.push(coachee);
    }
  });

  beforeEach(async () => {
    await prisma.classEnrollment.deleteMany();
    await prisma.waitingList.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.trainingClass.deleteMany();
    await prisma.recurrenceSeries.deleteMany();
    await prisma.block.deleteMany();
    calendar.createdEventIds = [];
    calendar.createdEvents = [];
  });

  afterAll(async () => {
    const userIds = [admin?.id, coach?.id, ...(coachees ?? []).map((c) => c.id)].filter(Boolean);
    await prisma.classEnrollment.deleteMany();
    await prisma.waitingList.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.trainingClass.deleteMany();
    await prisma.recurrenceSeries.deleteMany();
    await prisma.block.deleteMany();
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });

  function baseData(overrides: Partial<CreateTrainingClassData> = {}): CreateTrainingClassData {
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() + 14);
    startDate.setUTCHours(10, 0, 0, 0);
    return {
      classType: "INDIVIDUAL",
      coacheeIds: [coachees[0].id],
      assignedCoachId: coach.id,
      startDateTime: startDate,
      createdBy: admin.id,
      ...overrides,
    };
  }

  describe("individual classes", () => {
    it("creates a single class with one enrollment and a calendar event (happy path)", async () => {
      const result = await createTrainingClass.execute(baseData());

      expect(result.seriesId).toBeNull();
      expect(result.recurrence.enabled).toBe(false);
      expect(calendar.createdEventIds).toHaveLength(1);
      expect(result.instances).toHaveLength(1);
      const instance = result.instances[0];
      expect(instance.class_type).toBe("INDIVIDUAL");
      expect(instance.duration_minutes).toBe(60);
      expect(instance.google_event_id).toBe(calendar.createdEventIds[0]);
      expect(instance.enrollments.map((e) => e.coachee_id)).toEqual([coachees[0].id]);
      expect(instance.assigned_coach_id).toBe(coach.id);
      expect(instance.level_id).toBeNull();
      expect(calendar.createdEvents[0].title).toBe("Use Case Coachee 1 - Principiante");
      expect(calendar.createdEvents[0].description).toContain(`Coach: ${coach.name}`);
      expect(calendar.createdEvents[0].description).toContain("Recurring: no");
    });

    it("defaults the assigned coach to the creator when the creator is a coach", async () => {
      const result = await createTrainingClass.execute(
        baseData({ assignedCoachId: undefined, createdBy: coach.id }),
      );
      expect(result.instances[0].assigned_coach_id).toBe(coach.id);
    });

    it("rejects an individual class with more than one coachee", async () => {
      await expect(
        createTrainingClass.execute(baseData({ coacheeIds: [coachees[0].id, coachees[1].id] })),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("rejects an individual class that provides a level", async () => {
      await expect(
        createTrainingClass.execute(baseData({ levelId: levelIds.Basico })),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("defaults the assigned coach to the creator when the creator is an admin", async () => {
      const result = await createTrainingClass.execute(
        baseData({ assignedCoachId: undefined, createdBy: admin.id }),
      );
      expect(result.instances[0].assigned_coach_id).toBe(admin.id);
    });

    it("rejects when the creator is not a coach and no coach is selected", async () => {
      await expect(
        createTrainingClass.execute(
          baseData({ assignedCoachId: undefined, createdBy: coachees[0].id }),
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("rejects when a coachee does not exist", async () => {
      await expect(
        createTrainingClass.execute(
          baseData({ coacheeIds: ["00000000-0000-0000-0000-000000000000"] }),
        ),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("group classes", () => {
    it("creates a group class with three enrollments when levels are within reach", async () => {
      const result = await createTrainingClass.execute(
        baseData({
          classType: "GROUP",
          coacheeIds: [coachees[0].id, coachees[1].id, coachees[2].id],
          levelId: levelIds.Basico,
        }),
      );

      expect(result.instances).toHaveLength(1);
      expect(result.instances[0].class_type).toBe("GROUP");
      expect(result.instances[0].level_id).toBe(levelIds.Basico);
      expect(result.instances[0].enrollments).toHaveLength(3);
      expect(calendar.createdEvents[0].title).toBe("Group class - Basico");
      expect(calendar.createdEvents[0].description).toContain(`Coach: ${coach.name}`);
      expect(calendar.createdEvents[0].description).toContain("Recurring: no");
      expect(calendar.createdEvents[0].description).toContain(
        `Coachees: ${coachees[0].name}, ${coachees[1].name}, ${coachees[2].name}`,
      );
    });

    it("allows a group with coachees exactly one level above or below", async () => {
      const result = await createTrainingClass.execute(
        baseData({
          classType: "GROUP",
          coacheeIds: [coachees[0].id, coachees[1].id, coachees[2].id],
          levelId: levelIds.Basico,
        }),
      );
      expect(result.instances[0].enrollments).toHaveLength(3);
    });

    it("rejects a group class without a level", async () => {
      await expect(
        createTrainingClass.execute(
          baseData({
            classType: "GROUP",
            coacheeIds: [coachees[0].id, coachees[1].id, coachees[2].id],
          }),
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("rejects a group class with less than three coachees", async () => {
      await expect(
        createTrainingClass.execute(
          baseData({
            classType: "GROUP",
            coacheeIds: [coachees[0].id, coachees[1].id],
            levelId: levelIds.Basico,
          }),
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("rejects a group class with more than four coachees", async () => {
      await expect(
        createTrainingClass.execute(
          baseData({
            classType: "GROUP",
            coacheeIds: coachees.slice(0, 5).map((c) => c.id),
            levelId: levelIds.Basico,
          }),
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("rejects when a coachee is more than one level away from the class level", async () => {
      await expect(
        createTrainingClass.execute(
          baseData({
            classType: "GROUP",
            coacheeIds: [coachees[0].id, coachees[4].id, coachees[1].id],
            levelId: levelIds.Experto,
          }),
        ),
      ).rejects.toMatchObject({ code: "LEVEL_MISMATCH" });
    });
  });

  describe("recurring series", () => {
    it("creates a recurrence series with 12 weekly instances and one calendar event each", async () => {
      const utcDay = new Date().getUTCDay();
      const daysUntilMonday = (8 - utcDay) % 7 || 7;
      const seriesStart = new Date(
        Date.now() + (14 + daysUntilMonday) * 24 * 60 * 60 * 1000,
      ).toISOString();
      const result = await createTrainingClass.execute(
        baseData({
          classType: "GROUP",
          coacheeIds: [coachees[0].id, coachees[1].id, coachees[2].id],
          levelId: levelIds.Basico,
          recurrence: {
            enabled: true,
            dayOfWeek: 1,
            startDate: seriesStart.slice(0, 10),
          },
        }),
      );

      expect(result.seriesId).toBeTruthy();
      expect(result.recurrence.enabled).toBe(true);
      expect(result.instances).toHaveLength(12);
      expect(calendar.createdEventIds).toHaveLength(12);
      for (const event of calendar.createdEvents) {
        expect(event.title).toBe("Group class - Basico");
        expect(event.description).toContain("Recurring: weekly");
        expect(event.description).toContain(`Coach: ${coach.name}`);
        expect(event.description).toContain(
          `Coachees: ${coachees[0].name}, ${coachees[1].name}, ${coachees[2].name}`,
        );
      }

      const series = await prisma.recurrenceSeries.findUnique({
        where: { id: result.seriesId ?? undefined },
      });
      expect(series).not.toBeNull();
      expect(series?.day_of_week).toBe(1);

      const firstDay = result.instances[0].start_time.getUTCDay();
      const firstWallClock = zonedWallClockParts(result.instances[0].start_time);
      for (const instance of result.instances) {
        expect(instance.start_time.getUTCDay()).toBe(firstDay);
        expect(instance.recurrence_series_id).toBe(result.seriesId);
        expect(instance.google_event_id).toBeTruthy();
        const wallClock = zonedWallClockParts(instance.start_time);
        expect(wallClock.weekday).toBe(firstWallClock.weekday);
        expect(wallClock.time).toBe(firstWallClock.time);
      }
      for (let i = 1; i < result.instances.length; i++) {
        const prev = zonedWallClockParts(result.instances[i - 1].start_time);
        const curr = zonedWallClockParts(result.instances[i].start_time);
        const prevDate = new Date(`${prev.date}T00:00:00.000Z`);
        const currDate = new Date(`${curr.date}T00:00:00.000Z`);
        expect((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000)).toBe(7);
      }
    });

    it("rejects a series when startDate does not fall on dayOfWeek", async () => {
      await expect(
        createTrainingClass.execute(
          baseData({
            recurrence: { enabled: true, dayOfWeek: 2, startDate: "2026-08-03" },
          }),
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });
  });

  describe("capacity, overlap, and references", () => {
    it("rejects when gym individual capacity (2) would be exceeded", async () => {
      const date = baseData().startDateTime;
      await prisma.trainingClass.create({
        data: {
          class_type: "INDIVIDUAL",
          assigned_coach_id: coach.id,
          start_time: date,
          duration_minutes: 60,
          created_by: admin.id,
        },
      });
      await prisma.trainingClass.create({
        data: {
          class_type: "INDIVIDUAL",
          assigned_coach_id: coach.id,
          start_time: date,
          duration_minutes: 60,
          created_by: admin.id,
        },
      });

      await expect(createTrainingClass.execute(baseData())).rejects.toMatchObject({
        code: "CAPACITY_EXCEEDED",
      });
    });

    it("rejects when the assigned coach already has an overlapping class", async () => {
      const date = baseData().startDateTime;
      await prisma.trainingClass.create({
        data: {
          class_type: "GROUP",
          assigned_coach_id: coach.id,
          level_id: levelIds.Basico,
          start_time: date,
          duration_minutes: 60,
          created_by: admin.id,
        },
      });

      await expect(createTrainingClass.execute(baseData())).rejects.toMatchObject({
        code: "OVERLAP_DETECTED",
      });
    });

    it("rejects when a coachee already has an overlapping class", async () => {
      const date = baseData().startDateTime;
      const otherClass = await prisma.trainingClass.create({
        data: {
          class_type: "INDIVIDUAL",
          assigned_coach_id: coach.id,
          start_time: date,
          duration_minutes: 60,
          created_by: admin.id,
        },
      });
      await prisma.classEnrollment.create({
        data: { class_id: otherClass.id, coachee_id: coachees[0].id },
      });

      await expect(createTrainingClass.execute(baseData())).rejects.toMatchObject({
        code: "OVERLAP_DETECTED",
      });
    });

    it("rejects when the coach has a personal block overlapping the time", async () => {
      const date = baseData().startDateTime;
      await prisma.block.create({
        data: {
          block_type: "PERSONAL",
          coach_id: coach.id,
          start_time: date,
          end_time: new Date(date.getTime() + 60 * 60 * 1000),
          created_by: admin.id,
        },
      });

      await expect(createTrainingClass.execute(baseData())).rejects.toMatchObject({
        code: "OVERLAP_DETECTED",
      });
    });

    it("rejects when the assigned coach is not an active coach", async () => {
      const inactiveCoach = await prisma.user.create({
        data: {
          email: `use-case-inactive-coach-${Date.now()}@example.com`,
          password_hash: "not-used",
          name: "Inactive Coach",
          phone: "+34 600 000 009",
          role: "COACH",
          status: "INACTIVE",
        },
      });
      await expect(
        createTrainingClass.execute(baseData({ assignedCoachId: inactiveCoach.id })),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
      await prisma.user.delete({ where: { id: inactiveCoach.id } });
    });
  });
});
