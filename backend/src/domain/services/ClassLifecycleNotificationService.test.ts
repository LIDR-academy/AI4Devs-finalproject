import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClassRepository, ClassWithRelations } from "../ports/ClassRepository.js";
import type { DeviceTokenRepository } from "../ports/DeviceTokenRepository.js";
import type { NotificationRepository } from "../ports/NotificationRepository.js";
import type { NotificationSender } from "../ports/NotificationSender.js";
import type { UserRepository } from "../ports/UserRepository.js";
import { ClassLifecycleNotificationService } from "./ClassLifecycleNotificationService.js";

function makeClass(overrides: Partial<ClassWithRelations> = {}): ClassWithRelations {
  return {
    id: "class-1",
    classType: "GROUP",
    status: "ACTIVE",
    assignedCoachId: "coach-1",
    createdBy: "coach-1",
    startTime: new Date("2026-08-25T10:00:00Z"),
    enrollments: [{ id: "enrollment-1", coacheeId: "coachee-1" }],
    waitingLists: [],
    level: { id: "level-1", name: "Intermediate", sortOrder: 3 },
    assignedCoach: { id: "coach-1", name: "Coach Pedro" },
    ...overrides,
  };
}

function createMocks() {
  const classRepo = {
    findByIdWithEnrollmentsAndWaitingLists: vi.fn(),
  } as unknown as ClassRepository & {
    findByIdWithEnrollmentsAndWaitingLists: ReturnType<typeof vi.fn>;
  };

  const userRepo = {
    findById: vi.fn(),
    findActiveCoacheesByLevelReach: vi.fn(),
  } as unknown as UserRepository & {
    findById: ReturnType<typeof vi.fn>;
    findActiveCoacheesByLevelReach: ReturnType<typeof vi.fn>;
  };

  const notificationRepo = {
    create: vi.fn().mockResolvedValue({ id: "notif-1" }),
  } as unknown as NotificationRepository & { create: ReturnType<typeof vi.fn> };

  const notificationSender = {
    send: vi.fn().mockResolvedValue({ succeeded: [], failed: [] }),
  } as unknown as NotificationSender & { send: ReturnType<typeof vi.fn> };

  const deviceTokenRepo = {
    listActiveTokens: vi.fn().mockResolvedValue(["token-1"]),
    deactivate: vi.fn().mockResolvedValue(undefined),
  } as unknown as DeviceTokenRepository & {
    listActiveTokens: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
  };

  const service = new ClassLifecycleNotificationService(
    classRepo,
    userRepo,
    notificationRepo,
    notificationSender,
    deviceTokenRepo,
  );

  return { classRepo, userRepo, notificationRepo, notificationSender, deviceTokenRepo, service };
}

describe("ClassLifecycleNotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("notifyNewClassAvailable", () => {
    it("returns 0 when class not found", async () => {
      const { classRepo, service } = createMocks();
      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(null);

      const result = await service.notifyNewClassAvailable("class-1");

      expect(result.notificationsSent).toBe(0);
    });

    it("returns 0 when class has no level", async () => {
      const { classRepo, service } = createMocks();
      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
        makeClass({ level: null }),
      );

      const result = await service.notifyNewClassAvailable("class-1");

      expect(result.notificationsSent).toBe(0);
    });

    it("sends notification to eligible coachees", async () => {
      const {
        classRepo,
        userRepo,
        notificationRepo,
        notificationSender,
        deviceTokenRepo,
        service,
      } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
      userRepo.findActiveCoacheesByLevelReach.mockResolvedValue([
        { id: "coachee-1", name: "Alice", role: "COACHEE", levelSortOrder: 3 },
        { id: "coachee-2", name: "Bob", role: "COACHEE", levelSortOrder: 4 },
      ]);

      const result = await service.notifyNewClassAvailable("class-1");

      expect(result.notificationsSent).toBe(2);
      expect(notificationRepo.create).toHaveBeenCalledTimes(2);
      expect(notificationSender.send).toHaveBeenCalledTimes(2);
      expect(deviceTokenRepo.listActiveTokens).toHaveBeenCalledTimes(2);
    });

    it("skips coachees not within reach", async () => {
      const { classRepo, userRepo, notificationRepo, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
      userRepo.findActiveCoacheesByLevelReach.mockResolvedValue([
        { id: "coachee-1", name: "Alice", role: "COACHEE", levelSortOrder: 3 },
        { id: "coachee-2", name: "Bob", role: "COACHEE", levelSortOrder: 1 },
      ]);

      const result = await service.notifyNewClassAvailable("class-1");

      expect(result.notificationsSent).toBe(1);
      expect(notificationRepo.create).toHaveBeenCalledTimes(1);
    });

    it("deactivates tokens on permanent failure", async () => {
      const { classRepo, userRepo, notificationSender, deviceTokenRepo, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
      userRepo.findActiveCoacheesByLevelReach.mockResolvedValue([
        { id: "coachee-1", name: "Alice", role: "COACHEE", levelSortOrder: 3 },
      ]);
      notificationSender.send.mockResolvedValue({
        succeeded: [],
        failed: [{ token: "token-1", reason: "permanent", permanent: true }],
      });

      const result = await service.notifyNewClassAvailable("class-1");

      expect(result.notificationsSent).toBe(1);
      expect(deviceTokenRepo.deactivate).toHaveBeenCalledWith(["token-1"]);
    });

    it("does not deactivate tokens on transient failure", async () => {
      const { classRepo, userRepo, notificationSender, deviceTokenRepo, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
      userRepo.findActiveCoacheesByLevelReach.mockResolvedValue([
        { id: "coachee-1", name: "Alice", role: "COACHEE", levelSortOrder: 3 },
      ]);
      notificationSender.send.mockResolvedValue({
        succeeded: [],
        failed: [{ token: "token-1", reason: "transient", permanent: false }],
      });

      const result = await service.notifyNewClassAvailable("class-1");

      expect(result.notificationsSent).toBe(1);
      expect(deviceTokenRepo.deactivate).not.toHaveBeenCalled();
    });

    it("isolates push failures without throwing", async () => {
      const { classRepo, userRepo, notificationRepo, notificationSender, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
      userRepo.findActiveCoacheesByLevelReach.mockResolvedValue([
        { id: "coachee-1", name: "Alice", role: "COACHEE", levelSortOrder: 3 },
      ]);
      notificationSender.send.mockRejectedValue(new Error("FCM down"));

      const result = await service.notifyNewClassAvailable("class-1");

      expect(result.notificationsSent).toBe(1);
      expect(notificationRepo.create).toHaveBeenCalledTimes(1);
    });

    it("skips coachees when notification persistence fails", async () => {
      const { classRepo, userRepo, notificationRepo, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
      userRepo.findActiveCoacheesByLevelReach.mockResolvedValue([
        { id: "coachee-1", name: "Alice", role: "COACHEE", levelSortOrder: 3 },
      ]);
      notificationRepo.create.mockRejectedValue(new Error("DB error"));

      const result = await service.notifyNewClassAvailable("class-1");

      expect(result.notificationsSent).toBe(0);
    });
  });

  describe("notifyIndividualClassAssigned", () => {
    it("returns 0 when class not found", async () => {
      const { classRepo, service } = createMocks();
      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(null);

      const result = await service.notifyIndividualClassAssigned("class-1", "coachee-1");

      expect(result.notificationsSent).toBe(0);
    });

    it("returns 0 when coach not found", async () => {
      const { classRepo, userRepo, service } = createMocks();
      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
      userRepo.findById.mockResolvedValue(null);

      const result = await service.notifyIndividualClassAssigned("class-1", "coachee-1");

      expect(result.notificationsSent).toBe(0);
    });

    it("returns 0 when coachee not found", async () => {
      const { classRepo, userRepo, service } = createMocks();
      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
      userRepo.findById
        .mockResolvedValueOnce({ id: "coach-1", name: "Coach Pedro", role: "COACH" })
        .mockResolvedValueOnce(null);

      const result = await service.notifyIndividualClassAssigned("class-1", "coachee-1");

      expect(result.notificationsSent).toBe(0);
    });

    it("sends notification to assigned coach", async () => {
      const { classRepo, userRepo, notificationRepo, notificationSender, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(makeClass());
      userRepo.findById
        .mockResolvedValueOnce({ id: "coach-1", name: "Coach Pedro", role: "COACH" })
        .mockResolvedValueOnce({ id: "coachee-1", name: "Alice", role: "COACHEE" });

      const result = await service.notifyIndividualClassAssigned("class-1", "coachee-1");

      expect(result.notificationsSent).toBe(1);
      expect(notificationRepo.create).toHaveBeenCalledWith({
        recipientId: "coach-1",
        type: 8,
        content: expect.stringContaining("Alice"),
        classId: "class-1",
      });
      expect(notificationSender.send).toHaveBeenCalledTimes(1);
    });
  });

  describe("notifyClassCanceled", () => {
    it("returns 0 when class not found", async () => {
      const { classRepo, service } = createMocks();
      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(null);

      const result = await service.notifyClassCanceled("class-1");

      expect(result.notificationsSent).toBe(0);
    });

    it("sends notification to all enrolled coachees", async () => {
      const { classRepo, userRepo, notificationRepo, notificationSender, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
        makeClass({
          enrollments: [
            { id: "enrollment-1", coacheeId: "coachee-1" },
            { id: "enrollment-2", coacheeId: "coachee-2" },
          ],
        }),
      );
      userRepo.findById
        .mockResolvedValueOnce({ id: "coachee-1", name: "Alice", role: "COACHEE" })
        .mockResolvedValueOnce({ id: "coachee-2", name: "Bob", role: "COACHEE" });

      const result = await service.notifyClassCanceled("class-1");

      expect(result.notificationsSent).toBe(2);
      expect(notificationRepo.create).toHaveBeenCalledTimes(2);
      expect(notificationSender.send).toHaveBeenCalledTimes(2);
    });

    it("skips coachees that cannot be found", async () => {
      const { classRepo, userRepo, notificationRepo, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
        makeClass({
          enrollments: [
            { id: "enrollment-1", coacheeId: "coachee-1" },
            { id: "enrollment-2", coacheeId: "coachee-2" },
          ],
        }),
      );
      userRepo.findById
        .mockResolvedValueOnce({ id: "coachee-1", name: "Alice", role: "COACHEE" })
        .mockResolvedValueOnce(null);

      const result = await service.notifyClassCanceled("class-1");

      expect(result.notificationsSent).toBe(1);
      expect(notificationRepo.create).toHaveBeenCalledTimes(1);
    });

    it("returns 0 when no enrollments exist", async () => {
      const { classRepo, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
        makeClass({ enrollments: [] }),
      );

      const result = await service.notifyClassCanceled("class-1");

      expect(result.notificationsSent).toBe(0);
    });
  });

  describe("notifyCoachAssigned", () => {
    it("returns 0 when class not found", async () => {
      const { classRepo, service } = createMocks();
      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(null);

      const result = await service.notifyCoachAssigned("class-1");

      expect(result.notificationsSent).toBe(0);
    });

    it("returns 0 when coach created the class (no notification needed)", async () => {
      const { classRepo, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
        makeClass({ createdBy: "coach-1", assignedCoachId: "coach-1" }),
      );

      const result = await service.notifyCoachAssigned("class-1");

      expect(result.notificationsSent).toBe(0);
    });

    it("sends notification when coach did not create the class", async () => {
      const { classRepo, userRepo, notificationRepo, notificationSender, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
        makeClass({ createdBy: "admin-1", assignedCoachId: "coach-1" }),
      );
      userRepo.findById.mockResolvedValue({ id: "coach-1", name: "Coach Pedro", role: "COACH" });

      const result = await service.notifyCoachAssigned("class-1");

      expect(result.notificationsSent).toBe(1);
      expect(notificationRepo.create).toHaveBeenCalledWith({
        recipientId: "coach-1",
        type: 12,
        content: expect.stringContaining("assigned"),
        classId: "class-1",
      });
      expect(notificationSender.send).toHaveBeenCalledTimes(1);
    });

    it("returns 0 when coach not found", async () => {
      const { classRepo, userRepo, service } = createMocks();

      classRepo.findByIdWithEnrollmentsAndWaitingLists.mockResolvedValue(
        makeClass({ createdBy: "admin-1", assignedCoachId: "coach-1" }),
      );
      userRepo.findById.mockResolvedValue(null);

      const result = await service.notifyCoachAssigned("class-1");

      expect(result.notificationsSent).toBe(0);
    });
  });
});
