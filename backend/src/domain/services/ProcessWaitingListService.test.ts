import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClassRepository, ClassWithRelations } from "../ports/ClassRepository.js";
import type { DeviceTokenRepository } from "../ports/DeviceTokenRepository.js";
import type { NotificationRepository } from "../ports/NotificationRepository.js";
import type { NotificationSender } from "../ports/NotificationSender.js";
import type { UserRepository } from "../ports/UserRepository.js";
import type { WaitingListEntry, WaitingListRepository } from "../ports/WaitingListRepository.js";
import { ProcessWaitingListService } from "./ProcessWaitingListService.js";

function makeClass(overrides: Partial<ClassWithRelations> = {}): ClassWithRelations {
  return {
    id: "class-1",
    classType: "GROUP",
    status: "ACTIVE",
    assignedCoachId: "coach-1",
    createdBy: "coach-1",
    startTime: new Date("2026-08-25T10:00:00Z"),
    enrollments: [{ id: "enrollment-1", coacheeId: "coachee-enrolled" }],
    waitingLists: [
      { id: "wl-1", coacheeId: "coachee-waiting-1" },
      { id: "wl-2", coacheeId: "coachee-waiting-2" },
    ],
    level: { id: "level-1", name: "Intermediate", sortOrder: 3 },
    assignedCoach: { id: "coach-1", name: "Coach Pedro" },
    ...overrides,
  };
}

function makeWaitingListEntries(
  coacheeIds: string[] = ["coachee-waiting-1", "coachee-waiting-2"],
): WaitingListEntry[] {
  return coacheeIds.map((id, i) => ({
    id: `wl-${i + 1}`,
    classId: "class-1",
    coacheeId: id,
    joinedAt: new Date("2026-08-20T08:00:00Z"),
  }));
}

function createMocks() {
  const classRepo = {
    findByIdWithEnrollmentsAndWaitingLists: vi.fn(),
  } as unknown as ClassRepository & {
    findByIdWithEnrollmentsAndWaitingLists: ReturnType<typeof vi.fn>;
  };
  const waitingListRepo = {
    findByClassId: vi.fn(),
    findByClassIdAndCoacheeId: vi.fn(),
    deleteByClassIdAndCoacheeId: vi.fn(),
  } as unknown as WaitingListRepository & {
    findByClassId: ReturnType<typeof vi.fn>;
    findByClassIdAndCoacheeId: ReturnType<typeof vi.fn>;
    deleteByClassIdAndCoacheeId: ReturnType<typeof vi.fn>;
  };
  const notificationSender = {
    send: vi.fn().mockResolvedValue({ succeeded: [], failed: [] }),
  } as unknown as NotificationSender & { send: ReturnType<typeof vi.fn> };
  const userRepo = {
    findById: vi.fn(),
  } as unknown as UserRepository & { findById: ReturnType<typeof vi.fn> };
  const notificationRepo = {
    create: vi.fn().mockResolvedValue({ id: "notif-1" }),
  } as unknown as NotificationRepository & { create: ReturnType<typeof vi.fn> };
  const deviceTokenRepo = {
    listActiveTokens: vi.fn().mockResolvedValue(["token-1"]),
    deactivate: vi.fn().mockResolvedValue(undefined),
  } as unknown as DeviceTokenRepository & {
    listActiveTokens: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
  };

  const service = new ProcessWaitingListService(
    classRepo,
    waitingListRepo,
    notificationSender,
    userRepo,
    notificationRepo,
    deviceTokenRepo,
  );

  return {
    classRepo,
    waitingListRepo,
    notificationSender,
    userRepo,
    notificationRepo,
    deviceTokenRepo,
    service,
  };
}

describe("ProcessWaitingListService.processSpotOpened", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("notifies all waitlisted coachees and coach when waiting list exists", async () => {
    const {
      classRepo,
      waitingListRepo,
      notificationSender,
      userRepo,
      notificationRepo,
      deviceTokenRepo,
      service,
    } = createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
    waitingListRepo.findByClassId.mockResolvedValue(makeWaitingListEntries());
    userRepo.findById
      .mockResolvedValueOnce({ id: "coachee-waiting-1", name: "Alice", role: "COACHEE" })
      .mockResolvedValueOnce({ id: "coachee-waiting-2", name: "Bob", role: "COACHEE" })
      .mockResolvedValueOnce({ id: "coach-1", name: "Coach Pedro", role: "COACH" });

    const result = await service.processSpotOpened("class-1");

    expect(result.waitingListMembersNotified).toBe(2);
    expect(result.notificationsSent).toBe(3);
    expect(result.coachNotificationType).toBe(4);
    expect(deviceTokenRepo.listActiveTokens).toHaveBeenCalledTimes(3);

    // 2 waitlisted coachees + 1 coach = 3 persisted notification records
    expect(notificationRepo.create).toHaveBeenCalledTimes(3);
    expect(notificationRepo.create).toHaveBeenNthCalledWith(1, {
      recipientId: "coachee-waiting-1",
      type: 1,
      content: expect.stringContaining("spot has opened"),
      classId: "class-1",
    });
    expect(notificationRepo.create).toHaveBeenNthCalledWith(2, {
      recipientId: "coachee-waiting-2",
      type: 1,
      content: expect.stringContaining("spot has opened"),
      classId: "class-1",
    });
    expect(notificationRepo.create).toHaveBeenNthCalledWith(3, {
      recipientId: "coach-1",
      type: 4,
      content: expect.stringContaining("canceled enrollment"),
      classId: "class-1",
    });

    // Push sent with resolved device tokens, not an empty list
    expect(notificationSender.send).toHaveBeenCalledTimes(3);
    expect(notificationSender.send).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ content: expect.stringContaining("spot has opened") }),
      ["token-1"],
    );
    expect(notificationSender.send).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ content: expect.stringContaining("canceled enrollment") }),
      ["token-1"],
    );
  });

  it("persists notifications and sends push when coachee has no device token", async () => {
    const {
      classRepo,
      waitingListRepo,
      userRepo,
      notificationRepo,
      deviceTokenRepo,
      notificationSender,
      service,
    } = createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
      makeClass({ waitingLists: [] }),
    );
    waitingListRepo.findByClassId.mockResolvedValue([]);
    userRepo.findById.mockResolvedValueOnce({ id: "coach-1", name: "Coach Pedro", role: "COACH" });
    deviceTokenRepo.listActiveTokens.mockResolvedValue([]);

    const result = await service.processSpotOpened("class-1");

    expect(result.notificationsSent).toBe(1);
    expect(notificationRepo.create).toHaveBeenCalledTimes(1);
    expect(notificationRepo.create).toHaveBeenCalledWith({
      recipientId: "coach-1",
      type: 5,
      content: expect.stringContaining("spot is now available"),
      classId: "class-1",
    });
    expect(notificationSender.send).not.toHaveBeenCalled();
  });

  it("notifies coach only when no waiting list exists", async () => {
    const { classRepo, waitingListRepo, notificationSender, userRepo, notificationRepo, service } =
      createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
      makeClass({ waitingLists: [] }),
    );
    waitingListRepo.findByClassId.mockResolvedValue([]);
    userRepo.findById.mockResolvedValueOnce({
      id: "coach-1",
      name: "Coach Pedro",
      role: "COACH",
    });

    const result = await service.processSpotOpened("class-1");

    expect(result.waitingListMembersNotified).toBe(0);
    expect(result.notificationsSent).toBe(1);
    expect(result.coachNotificationType).toBe(5);
    expect(notificationSender.send).toHaveBeenCalledTimes(1);
    expect(notificationRepo.create).toHaveBeenCalledTimes(1);
    expect(notificationRepo.create).toHaveBeenCalledWith({
      recipientId: "coach-1",
      type: 5,
      content: expect.stringContaining("canceled enrollment"),
      classId: "class-1",
    });
  });

  it("returns zero notifications when class not found", async () => {
    const { classRepo, service } = createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(null);

    const result = await service.processSpotOpened("nonexistent");

    expect(result.notificationsSent).toBe(0);
    expect(result.waitingListMembersNotified).toBe(0);
  });

  it("handles notification delivery failure without throwing", async () => {
    const { classRepo, waitingListRepo, userRepo, service } = createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
    waitingListRepo.findByClassId.mockResolvedValue(makeWaitingListEntries());
    userRepo.findById.mockRejectedValue(new Error("User service down"));

    const result = await service.processSpotOpened("class-1");

    // Should not throw — delivery failure is isolated
    expect(result).toBeDefined();
  });

  it("sends correct notification content for spot opened", async () => {
    const { classRepo, waitingListRepo, notificationSender, userRepo, service } = createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
    waitingListRepo.findByClassId.mockResolvedValue(makeWaitingListEntries(["coachee-waiting-1"]));
    userRepo.findById
      .mockResolvedValueOnce({
        id: "coachee-waiting-1",
        name: "Alice",
        role: "COACHEE",
      })
      .mockResolvedValueOnce({ id: "coach-1", name: "Coach Pedro", role: "COACH" });

    await service.processSpotOpened("class-1");

    const waitlistCall = notificationSender.send.mock.calls[0];
    expect(waitlistCall[0].content).toContain("spot has opened");
    expect(waitlistCall[0].content).toContain("Intermediate");
    expect(waitlistCall[0].content).toContain("first come, first served");
    expect(waitlistCall[1]).toEqual(["token-1"]);

    const coachCall = notificationSender.send.mock.calls[1];
    expect(coachCall[0].content).toContain("canceled enrollment");
  });

  it("deactivates permanently failed device tokens", async () => {
    const { classRepo, waitingListRepo, userRepo, notificationSender, deviceTokenRepo, service } =
      createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
      makeClass({ waitingLists: [] }),
    );
    waitingListRepo.findByClassId.mockResolvedValue([]);
    userRepo.findById.mockResolvedValueOnce({ id: "coach-1", name: "Coach Pedro", role: "COACH" });
    notificationSender.send.mockResolvedValue({
      succeeded: [],
      failed: [{ token: "token-1", permanent: true }],
    });
    deviceTokenRepo.listActiveTokens.mockResolvedValue(["token-1"]);

    await service.processSpotOpened("class-1");

    expect(deviceTokenRepo.deactivate).toHaveBeenCalledWith(["token-1"]);
  });
});

describe("ProcessWaitingListService.processClaim", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enrolls coachee and removes waiting list entry on successful claim", async () => {
    const {
      classRepo,
      waitingListRepo,
      userRepo,
      notificationRepo,
      notificationSender,
      deviceTokenRepo,
      service,
    } = createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
      makeClass({
        enrollments: [],
        waitingLists: [{ id: "wl-1", coacheeId: "claimant" }],
      }),
    );
    waitingListRepo.findByClassIdAndCoacheeId.mockResolvedValue({
      id: "wl-1",
      classId: "class-1",
      coacheeId: "claimant",
      joinedAt: new Date(),
    });
    userRepo.findById
      .mockResolvedValueOnce({ id: "claimant", name: "Claimant", role: "COACHEE" })
      .mockResolvedValueOnce({ id: "coach-1", name: "Coach Pedro", role: "COACH" });

    const result = await service.processClaim("class-1", "claimant");

    expect(result.success).toBe(true);
    expect(result.enrollmentCreated).toBe(true);
    expect(result.waitingListRemoved).toBe(true);
    expect(result.notificationsSent).toBe(2); // #9 to claimant, #6 to coach

    expect(notificationRepo.create).toHaveBeenCalledTimes(2);
    expect(notificationRepo.create).toHaveBeenNthCalledWith(1, {
      recipientId: "claimant",
      type: 9,
      content: expect.stringContaining("You joined"),
      classId: "class-1",
    });
    expect(notificationRepo.create).toHaveBeenNthCalledWith(2, {
      recipientId: "coach-1",
      type: 6,
      content: expect.stringContaining("claimed the spot"),
      classId: "class-1",
    });
    expect(notificationSender.send).toHaveBeenCalledTimes(2);
    expect(notificationSender.send).toHaveBeenNthCalledWith(1, expect.anything(), ["token-1"]);
    expect(notificationSender.send).toHaveBeenNthCalledWith(2, expect.anything(), ["token-1"]);
    expect(deviceTokenRepo.listActiveTokens).toHaveBeenCalledTimes(2);
  });

  it("fails when coachee is not on the waiting list", async () => {
    const { classRepo, waitingListRepo, service } = createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
    waitingListRepo.findByClassIdAndCoacheeId.mockResolvedValue(null);

    const result = await service.processClaim("class-1", "not-waiting");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("NOT_ON_WAITING_LIST");
  });

  it("fails when class is canceled", async () => {
    const { classRepo, waitingListRepo, service } = createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
      makeClass({ status: "CANCELED" }),
    );
    waitingListRepo.findByClassIdAndCoacheeId.mockResolvedValue({
      id: "wl-1",
      classId: "class-1",
      coacheeId: "claimant",
      joinedAt: new Date(),
    });

    const result = await service.processClaim("class-1", "claimant");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("CANCELED_CLASS");
  });

  it("fails when class is already full", async () => {
    const { classRepo, waitingListRepo, service } = createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
      makeClass({
        enrollments: [
          { id: "e1", coacheeId: "c1" },
          { id: "e2", coacheeId: "c2" },
          { id: "e3", coacheeId: "c3" },
          { id: "e4", coacheeId: "c4" },
        ],
      }),
    );
    waitingListRepo.findByClassIdAndCoacheeId.mockResolvedValue({
      id: "wl-1",
      classId: "class-1",
      coacheeId: "claimant",
      joinedAt: new Date(),
    });

    const result = await service.processClaim("class-1", "claimant");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("SPOT_TAKEN");
  });

  it("fails when coachee is already enrolled", async () => {
    const { classRepo, waitingListRepo, service } = createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
      makeClass({
        enrollments: [{ id: "e1", coacheeId: "claimant" }],
      }),
    );
    waitingListRepo.findByClassIdAndCoacheeId.mockResolvedValue({
      id: "wl-1",
      classId: "class-1",
      coacheeId: "claimant",
      joinedAt: new Date(),
    });

    const result = await service.processClaim("class-1", "claimant");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("ALREADY_ENROLLED");
  });

  it("returns not found when class does not exist", async () => {
    const { classRepo, service } = createMocks();

    classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(null);

    const result = await service.processClaim("nonexistent", "claimant");

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("CLASS_NOT_FOUND");
  });
});
