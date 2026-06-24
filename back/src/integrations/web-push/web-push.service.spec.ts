import { WebPushService } from "./web-push.service";
import type { PushSubscriptionData, PushPayload } from "../../modules/notifications/ports/notification-ports";

jest.mock("web-push", () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
}));

import * as webPush from "web-push";

function makeSubscription(): PushSubscriptionData {
  return {
    endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
    p256dh: "BHg5YH9KmKs",
    auth: "authSecret123",
  };
}

function makePayload(): PushPayload {
  return { title: "Items expiring soon", body: "Yogurt expires tomorrow" };
}

function makeService(): WebPushService {
  return new WebPushService();
}

describe("WebPushService — sendNotification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls webPush.sendNotification with subscription and serialized payload", async () => {
    const mockSend = webPush.sendNotification as jest.Mock;
    mockSend.mockResolvedValue({});

    const svc = makeService();
    await svc.sendNotification(makeSubscription(), makePayload());

    expect(mockSend).toHaveBeenCalledTimes(1);
    const [sub, payload] = mockSend.mock.calls[0] as [unknown, string];
    expect(sub).toMatchObject({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
      keys: { p256dh: "BHg5YH9KmKs", auth: "authSecret123" },
    });
    expect(JSON.parse(payload)).toMatchObject({ title: "Items expiring soon", body: "Yogurt expires tomorrow" });
  });

  it("throws on non-410 push failure", async () => {
    const mockSend = webPush.sendNotification as jest.Mock;
    const err = Object.assign(new Error("push failed"), { statusCode: 500 });
    mockSend.mockRejectedValue(err);

    const svc = makeService();
    await expect(svc.sendNotification(makeSubscription(), makePayload())).rejects.toThrow("push failed");
  });

  it("throws with statusCode 410 preserved for stale subscription detection", async () => {
    const mockSend = webPush.sendNotification as jest.Mock;
    const err = Object.assign(new Error("Gone"), { statusCode: 410 });
    mockSend.mockRejectedValue(err);

    const svc = makeService();
    const thrown = await svc
      .sendNotification(makeSubscription(), makePayload())
      .catch((e: unknown) => e);

    expect((thrown as { statusCode: number }).statusCode).toBe(410);
  });

  it("calls setVapidDetails in constructor with env vars", () => {
    process.env.VAPID_SUBJECT = "mailto:admin@test.com";
    process.env.VAPID_PUBLIC_KEY = "pub-key";
    process.env.VAPID_PRIVATE_KEY = "priv-key";

    makeService();

    expect(webPush.setVapidDetails).toHaveBeenCalledWith(
      "mailto:admin@test.com",
      "pub-key",
      "priv-key",
    );

    delete process.env.VAPID_SUBJECT;
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
  });
});
