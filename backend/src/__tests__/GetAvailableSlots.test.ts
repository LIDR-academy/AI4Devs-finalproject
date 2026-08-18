import { describe, expect, it, vi } from "vitest";
import { GetAvailableSlots } from "../application/use-cases/GetAvailableSlots.js";
import type { CalendarProvider } from "../domain/ports/CalendarProvider.js";
import { zonedDateTimeToUtc } from "../domain/services/TimeZoneMath.js";

function makeCalendar(): CalendarProvider {
  return {
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
    queryFreeBusy: vi.fn().mockResolvedValue({ busySlots: [], queriedCalendar: "stub" }),
  };
}

describe("GetAvailableSlots", () => {
  it("returns every operating-hour slot on a fully free day", async () => {
    const calendar = makeCalendar();
    const prisma = {
      trainingClass: { findMany: vi.fn().mockResolvedValue([]) },
      block: { findMany: vi.fn().mockResolvedValue([]) },
    };

    const useCase = new GetAvailableSlots(prisma as never, calendar);
    const result = await useCase.execute({
      date: "2026-08-17",
      coachId: "coach-1",
      classType: "INDIVIDUAL",
    });

    expect(result.availableSlots).toHaveLength(16);
    expect(result.availableSlots[0].start).toBe("07:00");
    expect(result.availableSlots[15].start).toBe("22:00");
    expect(result.availableSlots.every((s) => s.capacityAvailable === "both")).toBe(true);
  });

  it("marks a slot busy when the coach has a class at that Madrid wall-clock hour", async () => {
    const calendar = makeCalendar();
    const prisma = {
      trainingClass: {
        findMany: vi.fn().mockImplementation((args?: { include?: unknown }) => {
          if (args?.include) return [];
          return [
            {
              class_type: "INDIVIDUAL",
              assigned_coach_id: "coach-1",
              start_time: zonedDateTimeToUtc("2026-08-17", "15:00"),
              duration_minutes: 60,
              enrollments: [],
            },
          ];
        }),
      },
      block: { findMany: vi.fn().mockResolvedValue([]) },
    };

    const useCase = new GetAvailableSlots(prisma as never, calendar);
    const result = await useCase.execute({
      date: "2026-08-17",
      coachId: "coach-1",
      classType: "INDIVIDUAL",
    });

    const starts = result.availableSlots.map((s) => s.start);
    expect(starts).not.toContain("15:00");
    expect(starts).toContain("14:00");
    expect(starts).toContain("16:00");
  });

  it("excludes an individual slot once two individual classes occupy it but keeps group", async () => {
    const calendar = makeCalendar();

    const busySlot = zonedDateTimeToUtc("2026-08-17", "11:00");
    const classes = [
      {
        class_type: "INDIVIDUAL",
        assigned_coach_id: "coach-1",
        start_time: busySlot,
        duration_minutes: 60,
        enrollments: [],
      },
      {
        class_type: "INDIVIDUAL",
        assigned_coach_id: "coach-2",
        start_time: busySlot,
        duration_minutes: 60,
        enrollments: [],
      },
    ];

    const prisma = {
      trainingClass: {
        findMany: vi
          .fn()
          .mockImplementation((args?: { include?: unknown }) => (args?.include ? classes : [])),
      },
      block: { findMany: vi.fn().mockResolvedValue([]) },
    };

    const useCase = new GetAvailableSlots(prisma as never, calendar);
    const individual = await useCase.execute({
      date: "2026-08-17",
      coachId: "coach-1",
      classType: "INDIVIDUAL",
    });
    expect(individual.availableSlots.map((s) => s.start)).not.toContain("11:00");

    const group = await useCase.execute({
      date: "2026-08-17",
      coachId: "coach-1",
      classType: "GROUP",
    });
    const groupSlot = group.availableSlots.find((s) => s.start === "11:00");
    expect(groupSlot).toBeDefined();
    expect(groupSlot?.capacityAvailable).toBe("group");
  });

  it("excludes a slot covered by an ACTIVE block", async () => {
    const slot = zonedDateTimeToUtc("2026-08-17", "12:00");
    const calendar = makeCalendar();
    const prisma = {
      trainingClass: {
        findMany: vi
          .fn()
          .mockImplementation((args?: { include?: unknown }) => (args?.include ? [] : [])),
      },
      block: {
        findMany: vi.fn().mockImplementation((args?: { where?: { status?: string } }) => {
          if (args?.where?.status !== "ACTIVE") {
            throw new Error("expected block findMany to filter status ACTIVE");
          }
          return [
            {
              block_type: "PERSONAL",
              status: "ACTIVE",
              start_time: slot,
              end_time: new Date(slot.getTime() + 60 * 60 * 1000),
            },
          ];
        }),
      },
    };

    const useCase = new GetAvailableSlots(prisma as never, calendar);
    const result = await useCase.execute({
      date: "2026-08-17",
      coachId: "coach-1",
      classType: "INDIVIDUAL",
    });

    const starts = result.availableSlots.map((s) => s.start);
    expect(starts).not.toContain("12:00");
  });

  it("requests only ACTIVE blocks so canceled blocks do not exclude slots", async () => {
    const calendar = makeCalendar();
    const blockFindMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      trainingClass: { findMany: vi.fn().mockResolvedValue([]) },
      block: { findMany: blockFindMany },
    };

    const useCase = new GetAvailableSlots(prisma as never, calendar);
    await useCase.execute({
      date: "2026-08-17",
      coachId: "coach-1",
      classType: "GROUP",
    });

    expect(blockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "ACTIVE" }),
      }),
    );
  });
});
