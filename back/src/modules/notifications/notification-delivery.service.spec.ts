import { NotificationDeliveryService } from "./notification-delivery.service";
import type { ExpiryItem, PushSubscriptionData } from "./ports/notification-ports";

const userId = "user-1";
const userEmail = "user@example.com";

function makeItems(): ExpiryItem[] {
  return [{ name: "Greek Yogurt", expirationDate: new Date("2026-06-23") }];
}

function makePushSub(): PushSubscriptionData {
  return { endpoint: "https://push.example.com/abc", p256dh: "p256", auth: "auth" };
}

type NotificationLogRow = {
  userId: string;
  type: string;
  channel: string;
  status: string;
  failReason?: string | null;
};

type PushSubRow = PushSubscriptionData & { id: string; userId: string };

function createMocks(opts: {
  expirationEnabled?: boolean;
  existingEmailLog?: boolean;
  existingPushSub?: PushSubscriptionData | null;
  sesThrows?: Error | null;
  pushThrows?: Error | null;
} = {}) {
  const {
    expirationEnabled = true,
    existingEmailLog = false,
    existingPushSub = null,
    sesThrows = null,
    pushThrows = null,
  } = opts;

  const logs: NotificationLogRow[] = [];
  const pushSubs: PushSubRow[] = existingPushSub
    ? [{ id: "sub-1", userId, ...existingPushSub }]
    : [];

  const prismaMock = {
    notificationPreference: {
      findUnique: jest.fn(async () => ({
        id: "pref-1",
        userId,
        expirationEnabled,
        priceDropEnabled: true,
        foodConsumedByOthersEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    },
    notificationLog: {
      findFirst: jest.fn(async () =>
        existingEmailLog
          ? { id: "log-1", userId, type: "EXPIRY", channel: "EMAIL", status: "SENT", sentAt: new Date() }
          : null,
      ),
      create: jest.fn(async ({ data }: { data: NotificationLogRow }) => {
        logs.push(data);
        return { id: "log-new", ...data };
      }),
    },
    pushSubscription: {
      findUnique: jest.fn(async () => (pushSubs.length > 0 ? pushSubs[0] : null)),
      upsert: jest.fn(async ({ create }: { create: PushSubRow }) => {
        const row = { ...create, id: "sub-new" };
        pushSubs.push(row);
        return row;
      }),
      deleteMany: jest.fn(async () => ({ count: pushSubs.splice(0).length })),
    },
  };

  const sesServiceMock = {
    sendEmail: jest.fn(async () => {
      if (sesThrows) throw sesThrows;
    }),
  };

  const webPushServiceMock = {
    sendNotification: jest.fn(async () => {
      if (pushThrows) throw pushThrows;
    }),
  };

  const svc = new NotificationDeliveryService(
    prismaMock as any,
    sesServiceMock as any,
    webPushServiceMock as any,
  );

  return { svc, prismaMock, sesServiceMock, webPushServiceMock, logs, pushSubs };
}

describe("NotificationDeliveryService — deliverExpiry", () => {
  it("skips entirely and writes no log when expirationEnabled is false", async () => {
    const { svc, logs, sesServiceMock } = createMocks({ expirationEnabled: false });

    await svc.deliverExpiry(userId, makeItems(), userEmail);

    expect(sesServiceMock.sendEmail).not.toHaveBeenCalled();
    expect(logs).toHaveLength(0);
  });

  it("skips email when a NotificationLog within 24h already exists", async () => {
    const { svc, sesServiceMock, logs } = createMocks({ existingEmailLog: true });

    await svc.deliverExpiry(userId, makeItems(), userEmail);

    expect(sesServiceMock.sendEmail).not.toHaveBeenCalled();
    expect(logs.filter((l) => l.channel === "EMAIL")).toHaveLength(0);
  });

  it("sends email and writes SENT NotificationLog on success", async () => {
    const { svc, sesServiceMock, logs } = createMocks();

    await svc.deliverExpiry(userId, makeItems(), userEmail);

    expect(sesServiceMock.sendEmail).toHaveBeenCalledTimes(1);
    const emailLog = logs.find((l) => l.channel === "EMAIL");
    expect(emailLog).toBeDefined();
    expect(emailLog?.status).toBe("SENT");
    expect(emailLog?.type).toBe("EXPIRY");
    expect(emailLog?.userId).toBe(userId);
  });

  it("writes FAILED NotificationLog when SES throws, does not rethrow", async () => {
    const { svc, logs } = createMocks({ sesThrows: new Error("SES quota exceeded") });

    await expect(svc.deliverExpiry(userId, makeItems(), userEmail)).resolves.not.toThrow();

    const emailLog = logs.find((l) => l.channel === "EMAIL");
    expect(emailLog?.status).toBe("FAILED");
    expect(emailLog?.failReason).toContain("SES quota exceeded");
  });

  it("sends web push and writes SENT log when PushSubscription exists", async () => {
    const { svc, webPushServiceMock, logs } = createMocks({ existingPushSub: makePushSub() });

    await svc.deliverExpiry(userId, makeItems(), userEmail);

    expect(webPushServiceMock.sendNotification).toHaveBeenCalledTimes(1);
    const pushLog = logs.find((l) => l.channel === "WEB_PUSH");
    expect(pushLog?.status).toBe("SENT");
  });

  it("deletes PushSubscription and writes FAILED log on 410 error", async () => {
    const err410 = Object.assign(new Error("Gone"), { statusCode: 410 });
    const { svc, prismaMock, logs } = createMocks({
      existingPushSub: makePushSub(),
      pushThrows: err410,
    });

    await svc.deliverExpiry(userId, makeItems(), userEmail);

    expect(prismaMock.pushSubscription.deleteMany).toHaveBeenCalledWith({ where: { userId } });
    const pushLog = logs.find((l) => l.channel === "WEB_PUSH");
    expect(pushLog?.status).toBe("FAILED");
  });

  it("writes FAILED log on non-410 push error without deleting subscription", async () => {
    const err500 = Object.assign(new Error("push server error"), { statusCode: 500 });
    const { svc, prismaMock, logs } = createMocks({
      existingPushSub: makePushSub(),
      pushThrows: err500,
    });

    await svc.deliverExpiry(userId, makeItems(), userEmail);

    expect(prismaMock.pushSubscription.deleteMany).not.toHaveBeenCalled();
    const pushLog = logs.find((l) => l.channel === "WEB_PUSH");
    expect(pushLog?.status).toBe("FAILED");
  });

  it("does not throw when both SES and push fail", async () => {
    const { svc } = createMocks({
      existingPushSub: makePushSub(),
      sesThrows: new Error("SES down"),
      pushThrows: Object.assign(new Error("push down"), { statusCode: 500 }),
    });

    await expect(svc.deliverExpiry(userId, makeItems(), userEmail)).resolves.not.toThrow();
  });
});

describe("NotificationDeliveryService — deliverBadge", () => {
  it("sends a web push with the badge label/description and logs BADGE_EARNED when a subscription exists", async () => {
    const { svc, webPushServiceMock, logs } = createMocks({ existingPushSub: makePushSub() });

    await svc.deliverBadge(userId, "First Save", "You consumed your first item before it expired.");

    expect(webPushServiceMock.sendNotification).toHaveBeenCalledTimes(1);
    expect(webPushServiceMock.sendNotification).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        title: expect.stringContaining("badge"),
        body: expect.stringContaining("First Save"),
      }),
    );
    const log = logs.find((l) => l.type === "BADGE_EARNED");
    expect(log?.channel).toBe("WEB_PUSH");
    expect(log?.status).toBe("SENT");
  });

  it("is a no-op (no push, no throw) when the user has no push subscription", async () => {
    const { svc, webPushServiceMock, logs } = createMocks({ existingPushSub: null });

    await expect(
      svc.deliverBadge(userId, "First Save", "desc"),
    ).resolves.not.toThrow();

    expect(webPushServiceMock.sendNotification).not.toHaveBeenCalled();
    expect(logs).toHaveLength(0);
  });

  it("writes a FAILED log without throwing when push delivery errors", async () => {
    const { svc, logs } = createMocks({
      existingPushSub: makePushSub(),
      pushThrows: Object.assign(new Error("push down"), { statusCode: 500 }),
    });

    await expect(svc.deliverBadge(userId, "First Save", "desc")).resolves.not.toThrow();

    const log = logs.find((l) => l.type === "BADGE_EARNED");
    expect(log?.status).toBe("FAILED");
  });
});

describe("NotificationDeliveryService — savePushSubscription / deletePushSubscription", () => {
  it("upserts PushSubscription and returns the id", async () => {
    const { svc } = createMocks();
    const id = await svc.savePushSubscription(userId, makePushSub());
    expect(typeof id).toBe("string");
  });

  it("calls deleteMany for the userId", async () => {
    const { svc, prismaMock } = createMocks();
    await svc.deletePushSubscription(userId);
    expect(prismaMock.pushSubscription.deleteMany).toHaveBeenCalledWith({ where: { userId } });
  });
});

describe("NotificationDeliveryService — deliverDigest", () => {
  const digestItems = [{ name: "Old Yogurt", daysExpired: 25 }];

  it("sends the digest email and logs SENT", async () => {
    const { svc, sesServiceMock, logs } = createMocks();

    await svc.deliverDigest(userId, digestItems, userEmail);

    expect(sesServiceMock.sendEmail).toHaveBeenCalledTimes(1);
    expect(logs).toContainEqual(
      expect.objectContaining({ type: "AUTO_EXPIRY_DIGEST", channel: "EMAIL", status: "SENT" }),
    );
  });

  it("never throws and logs FAILED when email delivery is unavailable", async () => {
    const { svc, logs } = createMocks({ sesThrows: new Error("SES down") });

    await expect(svc.deliverDigest(userId, digestItems, userEmail)).resolves.toBeUndefined();
    expect(logs).toContainEqual(
      expect.objectContaining({ type: "AUTO_EXPIRY_DIGEST", channel: "EMAIL", status: "FAILED" }),
    );
  });

  it("also pushes when a subscription exists", async () => {
    const { svc, webPushServiceMock, logs } = createMocks({ existingPushSub: makePushSub() });

    await svc.deliverDigest(userId, digestItems, userEmail);

    expect(webPushServiceMock.sendNotification).toHaveBeenCalledTimes(1);
    expect(logs).toContainEqual(
      expect.objectContaining({ type: "AUTO_EXPIRY_DIGEST", channel: "WEB_PUSH", status: "SENT" }),
    );
  });

  it("never throws when push delivery fails", async () => {
    const { svc, logs } = createMocks({ existingPushSub: makePushSub(), pushThrows: new Error("push down") });

    await expect(svc.deliverDigest(userId, digestItems, userEmail)).resolves.toBeUndefined();
    expect(logs).toContainEqual(
      expect.objectContaining({ type: "AUTO_EXPIRY_DIGEST", channel: "WEB_PUSH", status: "FAILED" }),
    );
  });
});

describe("NotificationDeliveryService — deliverDigestSummary", () => {
  it("sends a summary email and logs SENT", async () => {
    const { svc, sesServiceMock, logs } = createMocks();

    await svc.deliverDigestSummary(userId, 3, userEmail);

    expect(sesServiceMock.sendEmail).toHaveBeenCalledTimes(1);
    expect(logs).toContainEqual(
      expect.objectContaining({ type: "AUTO_EXPIRY_SUMMARY", channel: "EMAIL", status: "SENT" }),
    );
  });

  it("never throws when summary email fails", async () => {
    const { svc, logs } = createMocks({ sesThrows: new Error("SES down") });

    await expect(svc.deliverDigestSummary(userId, 3, userEmail)).resolves.toBeUndefined();
    expect(logs).toContainEqual(
      expect.objectContaining({ type: "AUTO_EXPIRY_SUMMARY", channel: "EMAIL", status: "FAILED" }),
    );
  });
});
