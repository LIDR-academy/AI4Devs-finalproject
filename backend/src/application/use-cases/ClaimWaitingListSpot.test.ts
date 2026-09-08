import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditLogger } from "../../infrastructure/logging/AuditLogger.js";
import { ClaimWaitingListSpot } from "./ClaimWaitingListSpot.js";

type MockTx = {
  trainingClass: { findUnique: ReturnType<typeof vi.fn> };
  waitingList: { findUnique: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  classEnrollment: { findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  notification: { create: ReturnType<typeof vi.fn> };
};

function createMockPrisma(overrides: Record<string, unknown> = {}) {
  const tx: MockTx = {
    trainingClass: {
      findUnique: vi.fn().mockResolvedValue(overrides.trainingClass ?? null),
    },
    waitingList: {
      findUnique: vi.fn().mockResolvedValue(overrides.waitingList ?? null),
      delete: vi.fn().mockResolvedValue(overrides.deletedWaitingList ?? {}),
    },
    classEnrollment: {
      findUnique: vi.fn().mockResolvedValue(overrides.existingEnrollment ?? null),
      create: vi.fn().mockResolvedValue(
        overrides.createdEnrollment ?? {
          id: "new-enrollment",
          class_id: "class-1",
          coachee_id: "claimant",
          joined_at: new Date(),
        },
      ),
    },
    notification: {
      create: vi.fn().mockResolvedValue({}),
    },
  };

  return {
    trainingClass: tx.trainingClass,
    waitingList: tx.waitingList,
    classEnrollment: tx.classEnrollment,
    notification: tx.notification,
    $transaction: vi.fn(async (fn: (tx: MockTx) => unknown) => fn(tx)),
  } as unknown as PrismaClient;
}

function createMockAuditLogger() {
  return { log: vi.fn().mockResolvedValue(undefined) } as unknown as AuditLogger;
}

describe("ClaimWaitingListSpot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates enrollment and removes waiting list entry on successful claim", async () => {
    const mockClass = {
      id: "class-1",
      class_type: "GROUP",
      status: "ACTIVE",
      assigned_coach_id: "coach-1",
      start_time: new Date(),
      enrollments: [],
      waitingLists: [{ id: "wl-1", coachee_id: "claimant" }],
      level: { id: "l1", name: "Intermediate", sort_order: 3 },
      assignedCoach: { id: "coach-1", name: "Coach Pedro" },
    };
    const mockWaitingList = {
      id: "wl-1",
      class_id: "class-1",
      coachee_id: "claimant",
      joined_at: new Date(),
    };

    const prisma = createMockPrisma({
      trainingClass: mockClass,
      waitingList: mockWaitingList,
    });
    const auditLogger = createMockAuditLogger();

    const useCase = new ClaimWaitingListSpot(prisma, auditLogger);
    const result = await useCase.execute({ classId: "class-1", coacheeId: "claimant" });

    expect(result.message).toContain("joined");
    expect(result.enrollmentId).toBeDefined();
  });

  it("rejects claim when coachee is not on the waiting list", async () => {
    const mockClass = {
      id: "class-1",
      class_type: "GROUP",
      status: "ACTIVE",
      assigned_coach_id: "coach-1",
      start_time: new Date(),
      enrollments: [],
      waitingLists: [],
      level: null,
      assignedCoach: { id: "coach-1", name: "Coach Pedro" },
    };

    const prisma = createMockPrisma({
      trainingClass: mockClass,
      waitingList: null,
    });
    const auditLogger = createMockAuditLogger();

    const useCase = new ClaimWaitingListSpot(prisma, auditLogger);

    await expect(useCase.execute({ classId: "class-1", coacheeId: "not-waiting" })).rejects.toThrow(
      "You are not on the waiting list",
    );
  });

  it("rejects claim when class is canceled", async () => {
    const mockClass = {
      id: "class-1",
      class_type: "GROUP",
      status: "CANCELED",
      assigned_coach_id: "coach-1",
      start_time: new Date(),
      enrollments: [],
      waitingLists: [{ id: "wl-1", coachee_id: "claimant" }],
      level: null,
      assignedCoach: { id: "coach-1", name: "Coach Pedro" },
    };
    const mockWaitingList = {
      id: "wl-1",
      class_id: "class-1",
      coachee_id: "claimant",
      joined_at: new Date(),
    };

    const prisma = createMockPrisma({
      trainingClass: mockClass,
      waitingList: mockWaitingList,
    });
    const auditLogger = createMockAuditLogger();

    const useCase = new ClaimWaitingListSpot(prisma, auditLogger);

    await expect(useCase.execute({ classId: "class-1", coacheeId: "claimant" })).rejects.toThrow(
      "has been canceled",
    );
  });

  it("rejects claim when class is already full", async () => {
    const mockClass = {
      id: "class-1",
      class_type: "GROUP",
      status: "ACTIVE",
      assigned_coach_id: "coach-1",
      start_time: new Date(),
      enrollments: [
        { id: "e1", coachee_id: "c1" },
        { id: "e2", coachee_id: "c2" },
        { id: "e3", coachee_id: "c3" },
        { id: "e4", coachee_id: "c4" },
      ],
      waitingLists: [{ id: "wl-1", coachee_id: "claimant" }],
      level: null,
      assignedCoach: { id: "coach-1", name: "Coach Pedro" },
    };
    const mockWaitingList = {
      id: "wl-1",
      class_id: "class-1",
      coachee_id: "claimant",
      joined_at: new Date(),
    };

    const prisma = createMockPrisma({
      trainingClass: mockClass,
      waitingList: mockWaitingList,
    });
    const auditLogger = createMockAuditLogger();

    const useCase = new ClaimWaitingListSpot(prisma, auditLogger);

    await expect(useCase.execute({ classId: "class-1", coacheeId: "claimant" })).rejects.toThrow(
      "spot has already been claimed",
    );
  });

  it("rejects claim when coachee is already enrolled", async () => {
    const mockClass = {
      id: "class-1",
      class_type: "GROUP",
      status: "ACTIVE",
      assigned_coach_id: "coach-1",
      start_time: new Date(),
      enrollments: [{ id: "e1", coachee_id: "claimant" }],
      waitingLists: [{ id: "wl-1", coachee_id: "claimant" }],
      level: null,
      assignedCoach: { id: "coach-1", name: "Coach Pedro" },
    };
    const mockWaitingList = {
      id: "wl-1",
      class_id: "class-1",
      coachee_id: "claimant",
      joined_at: new Date(),
    };

    const prisma = createMockPrisma({
      trainingClass: mockClass,
      waitingList: mockWaitingList,
    });
    const auditLogger = createMockAuditLogger();

    const useCase = new ClaimWaitingListSpot(prisma, auditLogger);

    await expect(useCase.execute({ classId: "class-1", coacheeId: "claimant" })).rejects.toThrow(
      "already enrolled",
    );
  });

  it("rejects claim when class not found", async () => {
    const prisma = createMockPrisma({ trainingClass: null });
    const auditLogger = createMockAuditLogger();

    const useCase = new ClaimWaitingListSpot(prisma, auditLogger);

    await expect(
      useCase.execute({ classId: "nonexistent", coacheeId: "claimant" }),
    ).rejects.toThrow("Class not found");
  });
});
