import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  ListTrainingClasses,
  type TrainingClassWithRelations,
} from "../application/use-cases/ListTrainingClasses.js";

function classRow(overrides: object = {}): TrainingClassWithRelations {
  return {
    id: "cl-1",
    class_type: "GROUP",
    assigned_coach_id: "coach-1",
    level_id: "lv-1",
    start_time: new Date("2026-08-19T10:00:00.000Z"),
    duration_minutes: 60,
    status: "ACTIVE",
    description: null,
    recurrence_series_id: null,
    google_event_id: null,
    created_by: "creator-1",
    created_at: new Date(),
    updated_at: new Date(),
    assignedCoach: { id: "coach-1", name: "Coach Uno" },
    level: { id: "lv-1", name: "Intermedio", color: "#fff", sort_order: 3 },
    enrollments: [
      {
        id: "e1",
        class_id: "cl-1",
        coachee_id: "c1",
        joined_at: new Date(),
        coachee: { id: "c1", name: "C1" },
      },
    ],
    waitingLists: [],
    ...overrides,
  } as unknown as TrainingClassWithRelations;
}

function makePrismaStub(options: {
  rows: TrainingClassWithRelations[];
  total: number;
  viewer?: { level: { sort_order: number } | null };
}) {
  const findMany = vi.fn().mockResolvedValue(options.rows);
  const count = vi.fn().mockResolvedValue(options.total);
  const findUnique = vi.fn().mockResolvedValue(options.viewer ?? null);
  const prisma = {
    trainingClass: { findMany, count },
    user: { findUnique },
  } as unknown as PrismaClient;
  return { prisma, findMany, count, findUnique };
}

describe("ListTrainingClasses", () => {
  it("queries with date range and pagination for an admin", async () => {
    const row = classRow();
    const { prisma, findMany } = makePrismaStub({ rows: [row], total: 1 });

    const result = await new ListTrainingClasses(prisma).execute({
      start: new Date("2026-08-19T00:00:00.000Z"),
      end: new Date("2026-08-19T23:59:59.000Z"),
      page: 1,
      limit: 20,
      viewerRole: "ADMIN",
      viewerId: "admin-1",
    });

    expect(findMany).toHaveBeenCalledOnce();
    const args = findMany.mock.calls[0][0];
    expect(args.where.start_time).toEqual({ gte: expect.any(Date), lte: expect.any(Date) });
    expect(args.skip).toBe(0);
    expect(args.take).toBe(20);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].visibility).toBeUndefined();
    expect(result.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
  });

  it("applies classType and coachId filters", async () => {
    const { prisma, findMany } = makePrismaStub({ rows: [classRow()], total: 1 });
    await new ListTrainingClasses(prisma).execute({
      start: new Date(),
      end: new Date(),
      classType: "GROUP",
      coachId: "coach-1",
      page: 1,
      limit: 20,
      viewerRole: "ADMIN",
      viewerId: "admin-1",
    });

    const args = findMany.mock.calls[0][0];
    expect(args.where.class_type).toBe("GROUP");
    expect(args.where.assigned_coach_id).toBe("coach-1");
  });

  it("computes pagination meta for a multi-page result", async () => {
    const { prisma } = makePrismaStub({ rows: [], total: 42 });
    const result = await new ListTrainingClasses(prisma).execute({
      start: new Date(),
      end: new Date(),
      page: 2,
      limit: 20,
      viewerRole: "ADMIN",
      viewerId: "admin-1",
    });
    expect(result.meta).toEqual({ page: 2, limit: 20, total: 42, totalPages: 3 });
  });

  it("clamps page and limit", async () => {
    const { prisma, findMany } = makePrismaStub({ rows: [], total: 0 });
    await new ListTrainingClasses(prisma).execute({
      start: new Date(),
      end: new Date(),
      page: 0,
      limit: 1000,
      viewerRole: "ADMIN",
      viewerId: "admin-1",
    });
    const args = findMany.mock.calls[0][0];
    expect(args.skip).toBe(0);
    expect(args.take).toBe(100);
  });

  it("computes visibility for the coachee role using the viewer level", async () => {
    const enrolledRow = classRow({
      id: "cl-blue",
      level: { id: "lv-1", name: "Intermedio", color: "#fff", sort_order: 3 },
      enrollments: [
        {
          id: "e1",
          class_id: "cl-blue",
          coachee_id: "v",
          joined_at: new Date(),
          coachee: { id: "v", name: "Viewer" },
        },
        {
          id: "e2",
          class_id: "cl-blue",
          coachee_id: "c2",
          joined_at: new Date(),
          coachee: { id: "c2", name: "C2" },
        },
      ],
    });
    const openGroup = classRow({
      id: "cl-green",
      level: { id: "lv-2", name: "Avanzado", color: "#fff", sort_order: 4 },
      enrollments: [
        {
          id: "e3",
          class_id: "cl-green",
          coachee_id: "c3",
          joined_at: new Date(),
          coachee: { id: "c3", name: "C3" },
        },
      ],
    });
    const { prisma } = makePrismaStub({
      rows: [enrolledRow, openGroup],
      total: 2,
      viewer: { level: { sort_order: 3 } },
    });

    const result = await new ListTrainingClasses(prisma).execute({
      start: new Date(),
      end: new Date(),
      page: 1,
      limit: 20,
      viewerRole: "COACHEE",
      viewerId: "v",
    });

    const byId = new Map(result.data.map((item) => [item.row.id, item.visibility]));
    expect(byId.get("cl-blue")).toBe("blue");
    expect(byId.get("cl-green")).toBe("green");
  });

  it("returns gray for a full group class not enrolled", async () => {
    const full = classRow({
      id: "cl-gray",
      level: { id: "lv-1", name: "Intermedio", color: "#fff", sort_order: 3 },
      enrollments: [
        {
          id: "e1",
          class_id: "cl-gray",
          coachee_id: "c1",
          joined_at: new Date(),
          coachee: { id: "c1", name: "C1" },
        },
        {
          id: "e2",
          class_id: "cl-gray",
          coachee_id: "c2",
          joined_at: new Date(),
          coachee: { id: "c2", name: "C2" },
        },
        {
          id: "e3",
          class_id: "cl-gray",
          coachee_id: "c3",
          joined_at: new Date(),
          coachee: { id: "c3", name: "C3" },
        },
        {
          id: "e4",
          class_id: "cl-gray",
          coachee_id: "c4",
          joined_at: new Date(),
          coachee: { id: "c4", name: "C4" },
        },
      ],
    });
    const { prisma } = makePrismaStub({
      rows: [full],
      total: 1,
      viewer: { level: { sort_order: 3 } },
    });

    const result = await new ListTrainingClasses(prisma).execute({
      start: new Date(),
      end: new Date(),
      page: 1,
      limit: 20,
      viewerRole: "COACHEE",
      viewerId: "v",
    });

    expect(result.data[0].visibility).toBe("gray");
  });
});
