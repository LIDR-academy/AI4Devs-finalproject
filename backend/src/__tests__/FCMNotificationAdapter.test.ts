import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSendEachForMulticast = vi.fn();

vi.mock("firebase-admin/app", () => ({
  initializeApp: vi.fn(),
  cert: vi.fn(),
  getApps: vi.fn(() => []),
}));

vi.mock("firebase-admin/messaging", () => ({
  getMessaging: vi.fn(() => ({
    sendEachForMulticast: mockSendEachForMulticast,
  })),
}));

describe("FCMNotificationAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns null when FIREBASE_SERVICE_ACCOUNT_PATH is unset", async () => {
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT_PATH", "");
    const { createFCMAdapter } = await import(
      "../infrastructure/adapters/notifications/FCMNotificationAdapter"
    );
    expect(createFCMAdapter()).toBeNull();
  });

  it("sends the correct HTTP-v1 message structure", async () => {
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT_PATH", "/tmp/fake-sa.json");

    mockSendEachForMulticast.mockResolvedValue({
      responses: [{ success: true }, { success: true }],
    });

    const { createFCMAdapter } = await import(
      "../infrastructure/adapters/notifications/FCMNotificationAdapter"
    );
    const adapter = createFCMAdapter();
    expect(adapter).not.toBeNull();

    const result = await adapter!.send(
      {
        content: "Your class has been rescheduled",
        data: {
          notificationId: "n-123",
          type: "3",
          classId: "c-456",
          link: "/classes/c-456",
        },
      },
      ["token-abc", "token-def"],
    );

    expect(mockSendEachForMulticast).toHaveBeenCalledOnce();
    const call = mockSendEachForMulticast.mock.calls[0][0];
    expect(call.notification).toEqual({
      title: "Coacher",
      body: "Your class has been rescheduled",
    });
    expect(call.data).toEqual({
      notificationId: "n-123",
      type: "3",
      classId: "c-456",
      link: "/classes/c-456",
    });
    expect(call.tokens).toEqual(["token-abc", "token-def"]);

    expect(result.succeeded).toEqual(["token-abc", "token-def"]);
    expect(result.failed).toEqual([]);
  });

  it("maps registration-token-not-registered to permanent failure", async () => {
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT_PATH", "/tmp/fake-sa.json");

    mockSendEachForMulticast.mockResolvedValue({
      responses: [
        { success: false, error: { code: "messaging/registration-token-not-registered" } },
        { success: true },
      ],
    });

    const { createFCMAdapter } = await import(
      "../infrastructure/adapters/notifications/FCMNotificationAdapter"
    );
    const adapter = createFCMAdapter()!;

    const result = await adapter.send(
      { content: "test", data: { notificationId: "n-1", type: "1" } },
      ["dead-token", "alive-token"],
    );

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]).toEqual({
      token: "dead-token",
      reason: "messaging/registration-token-not-registered",
      permanent: true,
    });
    expect(result.succeeded).toEqual(["alive-token"]);
  });

  it("maps other errors as non-permanent", async () => {
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT_PATH", "/tmp/fake-sa.json");

    mockSendEachForMulticast.mockResolvedValue({
      responses: [{ success: false, error: { code: "messaging/internal-error" } }],
    });

    const { createFCMAdapter } = await import(
      "../infrastructure/adapters/notifications/FCMNotificationAdapter"
    );
    const adapter = createFCMAdapter()!;

    const result = await adapter.send(
      { content: "test", data: { notificationId: "n-1", type: "1" } },
      ["token-x"],
    );

    expect(result.failed[0].permanent).toBe(false);
  });
});
