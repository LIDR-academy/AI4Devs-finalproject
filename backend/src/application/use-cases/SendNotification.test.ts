import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DeviceTokenRepository } from "../../domain/ports/DeviceTokenRepository.js";
import type { NotificationRepository } from "../../domain/ports/NotificationRepository.js";
import type { NotificationSender } from "../../domain/ports/NotificationSender.js";

function createMockNotificationRepo(): NotificationRepository {
  return {
    create: vi.fn().mockResolvedValue({ id: "notif-1" }),
    findById: vi.fn().mockResolvedValue(null),
    listByRecipient: vi.fn().mockResolvedValue({
      data: [],
      meta: { hasMore: false, nextCursor: null, totalCount: 0, unreadCount: 0 },
    }),
    countUnreadByRecipient: vi.fn().mockResolvedValue(0),
    markAsRead: vi.fn().mockResolvedValue({ id: "notif-1", isRead: true }),
  };
}

function createMockDeviceTokenRepo(tokens: string[] = ["tok-1", "tok-2"]): DeviceTokenRepository {
  return {
    upsert: vi.fn().mockResolvedValue({ id: "dt-1" }),
    listActiveTokens: vi.fn().mockResolvedValue(tokens),
    deactivate: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockSender(overrides?: Partial<NotificationSender>): NotificationSender {
  return {
    send: vi.fn().mockResolvedValue({ succeeded: ["tok-1", "tok-2"], failed: [] }),
    ...overrides,
  };
}

describe("SendNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists the notification BEFORE calling the sender", async () => {
    const { SendNotification } = await import("./SendNotification");

    const callOrder: string[] = [];
    const notificationRepo = createMockNotificationRepo();
    const deviceTokenRepo = createMockDeviceTokenRepo();
    const sender = createMockSender();

    notificationRepo.create = vi.fn().mockImplementation(async () => {
      callOrder.push("create");
      return { id: "notif-1" };
    });
    sender.send = vi.fn().mockImplementation(async () => {
      callOrder.push("send");
      return { succeeded: ["tok-1", "tok-2"], failed: [] };
    });

    const useCase = new SendNotification(notificationRepo, deviceTokenRepo, sender);
    await useCase.send({
      recipientId: "user-1",
      type: 1,
      content: "Test notification",
    });

    expect(callOrder).toEqual(["create", "send"]);
  });

  it("fans out to every active token of the recipient", async () => {
    const { SendNotification } = await import("./SendNotification");

    const notificationRepo = createMockNotificationRepo();
    const deviceTokenRepo = createMockDeviceTokenRepo(["tok-a", "tok-b", "tok-c"]);
    const sender = createMockSender();

    const useCase = new SendNotification(notificationRepo, deviceTokenRepo, sender);
    await useCase.send({
      recipientId: "user-1",
      type: 1,
      content: "Fan-out test",
    });

    expect(sender.send).toHaveBeenCalledOnce();
    expect(sender.send).toHaveBeenCalledWith(expect.objectContaining({ content: "Fan-out test" }), [
      "tok-a",
      "tok-b",
      "tok-c",
    ]);
  });

  it("still creates a record when there are zero registered devices", async () => {
    const { SendNotification } = await import("./SendNotification");

    const notificationRepo = createMockNotificationRepo();
    const deviceTokenRepo = createMockDeviceTokenRepo([]);
    const sender = createMockSender();

    const useCase = new SendNotification(notificationRepo, deviceTokenRepo, sender);
    await useCase.send({
      recipientId: "user-1",
      type: 1,
      content: "No devices",
    });

    expect(notificationRepo.create).toHaveBeenCalledOnce();
    expect(sender.send).not.toHaveBeenCalled();
  });

  it("resolves void even when sender rejects", async () => {
    const { SendNotification } = await import("./SendNotification");

    const notificationRepo = createMockNotificationRepo();
    const deviceTokenRepo = createMockDeviceTokenRepo(["tok-1"]);
    const sender = createMockSender({
      send: vi.fn().mockRejectedValue(new Error("FCM down")),
    });

    const useCase = new SendNotification(notificationRepo, deviceTokenRepo, sender);

    await expect(
      useCase.send({
        recipientId: "user-1",
        type: 1,
        content: "Should not throw",
      }),
    ).resolves.toBeUndefined();
  });

  it("resolves void even when sender throws synchronously", async () => {
    const { SendNotification } = await import("./SendNotification");

    const notificationRepo = createMockNotificationRepo();
    const deviceTokenRepo = createMockDeviceTokenRepo(["tok-1"]);
    const sender = createMockSender({
      send: vi.fn().mockImplementation(() => {
        throw new Error("Sync crash");
      }),
    });

    const useCase = new SendNotification(notificationRepo, deviceTokenRepo, sender);

    await expect(
      useCase.send({
        recipientId: "user-1",
        type: 1,
        content: "Should not throw",
      }),
    ).resolves.toBeUndefined();
  });

  it("resolves with partial failures — successes kept, each failure logged", async () => {
    const { SendNotification } = await import("./SendNotification");

    const notificationRepo = createMockNotificationRepo();
    const deviceTokenRepo = createMockDeviceTokenRepo(["tok-ok", "tok-fail"]);
    const sender = createMockSender({
      send: vi.fn().mockResolvedValue({
        succeeded: ["tok-ok"],
        failed: [{ token: "tok-fail", reason: "messaging/internal-error", permanent: false }],
      }),
    });

    const useCase = new SendNotification(notificationRepo, deviceTokenRepo, sender);

    await expect(
      useCase.send({
        recipientId: "user-1",
        type: 1,
        content: "Partial failure",
      }),
    ).resolves.toBeUndefined();
  });

  it("deactivates permanently failed tokens after dispatch", async () => {
    const { SendNotification } = await import("./SendNotification");

    const notificationRepo = createMockNotificationRepo();
    const deviceTokenRepo = createMockDeviceTokenRepo(["tok-ok", "tok-dead"]);
    const sender = createMockSender({
      send: vi.fn().mockResolvedValue({
        succeeded: ["tok-ok"],
        failed: [
          {
            token: "tok-dead",
            reason: "messaging/registration-token-not-registered",
            permanent: true,
          },
        ],
      }),
    });

    const useCase = new SendNotification(notificationRepo, deviceTokenRepo, sender);
    await useCase.send({
      recipientId: "user-1",
      type: 1,
      content: "Deactivate test",
    });

    expect(deviceTokenRepo.deactivate).toHaveBeenCalledWith(["tok-dead"]);
  });

  it("does NOT deactivate tokens with non-permanent failures", async () => {
    const { SendNotification } = await import("./SendNotification");

    const notificationRepo = createMockNotificationRepo();
    const deviceTokenRepo = createMockDeviceTokenRepo(["tok-transient"]);
    const sender = createMockSender({
      send: vi.fn().mockResolvedValue({
        succeeded: [],
        failed: [{ token: "tok-transient", reason: "messaging/internal-error", permanent: false }],
      }),
    });

    const useCase = new SendNotification(notificationRepo, deviceTokenRepo, sender);
    await useCase.send({
      recipientId: "user-1",
      type: 1,
      content: "No deactivation",
    });

    expect(deviceTokenRepo.deactivate).not.toHaveBeenCalled();
  });
});
