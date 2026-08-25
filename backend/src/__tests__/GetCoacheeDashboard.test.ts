import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  GetCoacheeDashboard,
  type GetCoacheeDashboardParams,
} from "../application/use-cases/GetCoacheeDashboard.js";
import { CoacheeDashboardPolicy } from "../domain/services/CoacheeDashboardPolicy.js";

const NOW = new Date("2026-08-19T00:00:00.000Z");

function classRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "cl-1",
    class_type: "GROUP",
    assigned_coach_id: "coach-1",
    level_id: "lv-1",
    start_time: new Date("2026-08-25T10:00:00.000Z"),
    duration_minutes: 60,
    status: "ACTIVE",
    description: null,
    recurrence_series_id: null,
    google_event_id: null,
    created_by: "creator-1",
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    assignedCoach: { id: "coach-1", name: "Coach Uno" },
    level: { id: "lv-1", name: "Intermedio", color: "#fff", sort_order: 3 },
    enrollments: [] as Array<Record<string, unknown>>,
    waitingLists: [],
    ...overrides,
  };
}

function enrollmentRow(classObj: Record<string, unknown>): Record<string, unknown> {
  return {
    id: "e-1",
    class_id: classObj.id,
    coachee_id: "coachee-1",
    joined_at: new Date("2026-01-01T00:00:00.000Z"),
    class: classObj,
  };
}

function waitingRow(status: "ACTIVE" | "CANCELED" = "ACTIVE"): Record<string, unknown> {
  return {
    id: "w-1",
    class_id: "cl-wl",
    coachee_id: "coachee-1",
    joined_at: new Date("2026-01-01T00:00:00.000Z"),
    class: { id: "cl-wl", status },
  };
}

function makePrismaStub(options: {
  viewer?: { id: string; level: { sort_order: number } | null } | null;
  enrollments?: Record<string, unknown>[];
  candidates?: Record<string, unknown>[];
  waitingLists?: Record<string, unknown>[];
}) {
  const userFindUnique = vi.fn().mockResolvedValue(options.viewer ?? null);
  const enrollmentFindMany = vi.fn().mockResolvedValue(options.enrollments ?? []);
  const trainingClassFindMany = vi.fn().mockResolvedValue(options.candidates ?? []);
  const waitingListFindMany = vi.fn().mockResolvedValue(options.waitingLists ?? []);
  const prisma = {
    user: { findUnique: userFindUnique },
    classEnrollment: { findMany: enrollmentFindMany },
    trainingClass: { findMany: trainingClassFindMany },
    waitingList: { findMany: waitingListFindMany },
  } as unknown as PrismaClient;
  return { prisma, userFindUnique, enrollmentFindMany, trainingClassFindMany, waitingListFindMany };
}

const execute = (prisma: PrismaClient, params: GetCoacheeDashboardParams) =>
  new GetCoacheeDashboard(prisma, new CoacheeDashboardPolicy()).execute(params);

describe("GetCoacheeDashboard", () => {
  it("exposes waitlistEligibleClasses for full within-reach group classes with a free slot", async () => {
    const full = classRow({
      id: "cl-wl",
      start_time: new Date("2026-08-25T10:00:00.000Z"),
      enrollments: [
        { id: "a", coachee_id: "other-1" },
        { id: "b", coachee_id: "other-2" },
        { id: "c", coachee_id: "other-3" },
        { id: "d", coachee_id: "other-4" },
      ],
    });
    const { prisma, trainingClassFindMany } = makePrismaStub({
      viewer: { id: "coachee-1", level: { sort_order: 3 } },
      candidates: [full],
    });

    const result = await execute(prisma, { coacheeId: "coachee-1", now: NOW });

    expect(result.waitlistEligibleClasses.map((c) => c.id)).toEqual(["cl-wl"]);
    expect(result.joinableClasses.map((c) => c.id)).toEqual([]);
    expect(trainingClassFindMany.mock.calls[0][0].include).toMatchObject({ waitingLists: true });
  });

  it("excludes enrolled, on-list, list-full, out-of-reach, not-full, canceled and individual classes", async () => {
    const cases: Array<{ id: string; row: Record<string, unknown> }> = [
      {
        id: "enrolled",
        row: classRow({
          id: "enrolled",
          enrollments: [
            { id: "a", coachee_id: "other-1" },
            { id: "b", coachee_id: "other-2" },
            { id: "c", coachee_id: "other-3" },
            { id: "c2", coachee_id: "coachee-1" },
          ],
        }),
      },
      {
        id: "on-list",
        row: classRow({
          id: "on-list",
          enrollments: [
            { id: "a", coachee_id: "other-1" },
            { id: "b", coachee_id: "other-2" },
            { id: "c", coachee_id: "other-3" },
            { id: "d", coachee_id: "other-4" },
          ],
          waitingLists: [{ id: "w", coachee_id: "coachee-1" }],
        }),
      },
      {
        id: "list-full",
        row: classRow({
          id: "list-full",
          enrollments: [
            { id: "a", coachee_id: "other-1" },
            { id: "b", coachee_id: "other-2" },
            { id: "c", coachee_id: "other-3" },
            { id: "d", coachee_id: "other-4" },
          ],
          waitingLists: [
            { id: "w1", coachee_id: "coachee-1" },
            { id: "w2", coachee_id: "coachee-2" },
            { id: "w3", coachee_id: "coachee-3" },
            { id: "w4", coachee_id: "coachee-4" },
          ],
        }),
      },
      {
        id: "out-of-reach",
        row: classRow({
          id: "out-of-reach",
          level: { id: "lv-5", name: "Extremo", color: "#000", sort_order: 5 },
          enrollments: [
            { id: "a", coachee_id: "other-1" },
            { id: "b", coachee_id: "other-2" },
            { id: "c", coachee_id: "other-3" },
            { id: "d", coachee_id: "other-4" },
          ],
        }),
      },
      {
        id: "not-full",
        row: classRow({ id: "not-full", enrollments: [{ id: "a", coachee_id: "other-1" }] }),
      },
      { id: "canceled", row: classRow({ id: "canceled", status: "CANCELED" }) },
      { id: "individual", row: classRow({ id: "individual", class_type: "INDIVIDUAL" }) },
    ];
    const { prisma } = makePrismaStub({
      viewer: { id: "coachee-1", level: { sort_order: 3 } },
      candidates: cases.map((c) => c.row),
    });

    const result = await execute(prisma, { coacheeId: "coachee-1", now: NOW });

    expect(result.waitlistEligibleClasses).toEqual([]);
  });

  it("returns an empty waitlist-eligible list when the Coachee has no level", async () => {
    const full = classRow({
      id: "cl-wl",
      enrollments: [
        { id: "a", coachee_id: "other-1" },
        { id: "b", coachee_id: "other-2" },
        { id: "c", coachee_id: "other-3" },
        { id: "d", coachee_id: "other-4" },
      ],
    });
    const { prisma } = makePrismaStub({
      viewer: { id: "coachee-1", level: null },
      candidates: [full],
    });

    const result = await execute(prisma, { coacheeId: "coachee-1", now: NOW });

    expect(result.waitlistEligibleClasses).toEqual([]);
  });

  it("preserves ascending start-time order in waitlistEligibleClasses", async () => {
    const later = classRow({
      id: "wl-later",
      start_time: new Date("2026-08-27T10:00:00.000Z"),
      enrollments: [
        { id: "a", coachee_id: "other-1" },
        { id: "b", coachee_id: "other-2" },
        { id: "c", coachee_id: "other-3" },
        { id: "d", coachee_id: "other-4" },
      ],
    });
    const earlier = classRow({
      id: "wl-earlier",
      start_time: new Date("2026-08-25T10:00:00.000Z"),
      enrollments: [
        { id: "a", coachee_id: "other-1" },
        { id: "b", coachee_id: "other-2" },
        { id: "c", coachee_id: "other-3" },
        { id: "d", coachee_id: "other-4" },
      ],
    });
    const { prisma } = makePrismaStub({
      viewer: { id: "coachee-1", level: { sort_order: 3 } },
      candidates: [later, earlier],
    });

    const result = await execute(prisma, { coacheeId: "coachee-1", now: NOW });

    expect(result.waitlistEligibleClasses.map((c) => c.id)).toEqual(["wl-earlier", "wl-later"]);
  });

  it("delegates the waitlist-eligible filter to CoacheeDashboardPolicy", async () => {
    const full = classRow({
      id: "cl-wl",
      enrollments: [
        { id: "a", coachee_id: "other-1" },
        { id: "b", coachee_id: "other-2" },
        { id: "c", coachee_id: "other-3" },
        { id: "d", coachee_id: "other-4" },
      ],
    });
    const policy = new CoacheeDashboardPolicy();
    const filterWaitlistEligible = vi.spyOn(policy, "filterWaitlistEligible");
    const { prisma } = makePrismaStub({
      viewer: { id: "coachee-1", level: { sort_order: 3 } },
      candidates: [full],
    });

    await new GetCoacheeDashboard(prisma, policy).execute({ coacheeId: "coachee-1", now: NOW });

    expect(filterWaitlistEligible).toHaveBeenCalledOnce();
  });

  it("returns the full dashboard on the happy path (next class, joinable list, active count)", async () => {
    const next = classRow({ id: "cl-next", start_time: new Date("2026-08-20T09:00:00.000Z") });
    const joinable = classRow({
      id: "cl-join",
      start_time: new Date("2026-08-25T10:00:00.000Z"),
      enrollments: [
        { id: "a", coachee_id: "other-1" },
        { id: "b", coachee_id: "other-2" },
      ],
    });
    const {
      prisma,
      enrollmentFindMany,
      trainingClassFindMany,
      waitingListFindMany,
      userFindUnique,
    } = makePrismaStub({
      viewer: { id: "coachee-1", level: { sort_order: 3 } },
      enrollments: [enrollmentRow(next)],
      candidates: [joinable],
      waitingLists: [waitingRow("ACTIVE"), waitingRow("CANCELED")],
    });

    const result = await execute(prisma, { coacheeId: "coachee-1", now: NOW });

    expect(result.nextClass?.id).toBe("cl-next");
    expect(result.nextClass?.class_type).toBe("GROUP");
    expect(result.nextClass?.status).toBe("ACTIVE");
    expect(result.nextClass?.assignedCoach).toMatchObject({ id: "coach-1", name: "Coach Uno" });
    expect(result.nextClass?.level).toMatchObject({ id: "lv-1", sort_order: 3 });
    expect(result.joinableClasses.map((c) => c.id)).toEqual(["cl-join"]);
    expect(result.activeWaitingListCount).toBe(1);

    expect(enrollmentFindMany).toHaveBeenCalledOnce();
    expect(enrollmentFindMany.mock.calls[0][0].where.coachee_id).toBe("coachee-1");

    expect(trainingClassFindMany).toHaveBeenCalledOnce();
    expect(trainingClassFindMany.mock.calls[0][0].where).toEqual({
      class_type: "GROUP",
      status: "ACTIVE",
      start_time: {
        gte: new Date("2026-08-18T22:00:00.000Z"),
        lte: new Date("2026-08-28T22:00:00.000Z"),
      },
    });
    expect(trainingClassFindMany.mock.calls[0][0].orderBy).toEqual({ start_time: "asc" });

    expect(waitingListFindMany).toHaveBeenCalledOnce();
    expect(waitingListFindMany.mock.calls[0][0].where.coachee_id).toBe("coachee-1");

    expect(userFindUnique).toHaveBeenCalledTimes(1);
    expect(userFindUnique.mock.calls[0][0].where.id).toBe("coachee-1");
  });

  it("returns nextClass null when the only enrollment is in the past", async () => {
    const past = classRow({ id: "cl-past", start_time: new Date("2026-08-18T09:00:00.000Z") });
    const { prisma } = makePrismaStub({
      viewer: { id: "coachee-1", level: { sort_order: 3 } },
      enrollments: [enrollmentRow(past)],
    });

    const result = await execute(prisma, { coacheeId: "coachee-1", now: NOW });

    expect(result.nextClass).toBeNull();
    expect(result.joinableClasses).toEqual([]);
    expect(result.activeWaitingListCount).toBe(0);
  });

  it("returns an empty joinable list when the Coachee has no level", async () => {
    const next = classRow({ id: "cl-next", start_time: new Date("2026-08-20T09:00:00.000Z") });
    const open = classRow({ id: "cl-open", start_time: new Date("2026-08-25T10:00:00.000Z") });
    const { prisma } = makePrismaStub({
      viewer: { id: "coachee-1", level: null },
      enrollments: [enrollmentRow(next)],
      candidates: [open],
    });

    const result = await execute(prisma, { coacheeId: "coachee-1", now: NOW });

    expect(result.nextClass?.id).toBe("cl-next");
    expect(result.joinableClasses).toEqual([]);
  });

  it("returns zero for the waiting-list count when there are no entries", async () => {
    const { prisma } = makePrismaStub({
      viewer: { id: "coachee-1", level: { sort_order: 3 } },
    });

    const result = await execute(prisma, { coacheeId: "coachee-1", now: NOW });

    expect(result.nextClass).toBeNull();
    expect(result.joinableClasses).toEqual([]);
    expect(result.activeWaitingListCount).toBe(0);
  });

  it("uses the Coachee level lookup to filter out-of-reach classes", async () => {
    const far = classRow({
      id: "cl-far",
      level: { id: "lv-5", name: "Extremo", color: "#000", sort_order: 5 },
    });
    const { prisma, userFindUnique } = makePrismaStub({
      viewer: { id: "coachee-1", level: { sort_order: 1 } },
      candidates: [far],
    });

    const result = await execute(prisma, { coacheeId: "coachee-1", now: NOW });

    expect(userFindUnique).toHaveBeenCalledTimes(1);
    expect(result.joinableClasses).toEqual([]);
  });

  it("delegates selection, filtering, and counting to CoacheeDashboardPolicy", async () => {
    const next = classRow({ id: "cl-next", start_time: new Date("2026-08-20T09:00:00.000Z") });
    const joinable = classRow({ id: "cl-join", start_time: new Date("2026-08-25T10:00:00.000Z") });
    const policy = new CoacheeDashboardPolicy();
    const pickNextClass = vi.spyOn(policy, "pickNextClass");
    const joinableWindow = vi.spyOn(policy, "joinableWindow");
    const filterJoinable = vi.spyOn(policy, "filterJoinable");
    const countActiveWaitingLists = vi.spyOn(policy, "countActiveWaitingLists");
    const { prisma } = makePrismaStub({
      viewer: { id: "coachee-1", level: { sort_order: 3 } },
      enrollments: [enrollmentRow(next)],
      candidates: [joinable],
      waitingLists: [waitingRow("ACTIVE")],
    });

    await new GetCoacheeDashboard(prisma, policy).execute({ coacheeId: "coachee-1", now: NOW });

    expect(pickNextClass).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ class: expect.objectContaining({ id: "cl-next" }) }),
      ]),
      NOW,
    );
    expect(joinableWindow).toHaveBeenCalledWith(NOW);
    expect(filterJoinable).toHaveBeenCalledOnce();
    expect(countActiveWaitingLists).toHaveBeenCalledOnce();
  });
});
