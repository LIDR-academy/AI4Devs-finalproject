import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/features/auth/session", () => ({
  getAccessToken: vi.fn(() => "test-token"),
}));

const mockSubscribe = vi.fn();
const mockRegister = vi.fn();

function setupBrowserMocks(opts: {
  permission?: NotificationPermission;
  supported?: boolean;
} = {}) {
  const { permission = "granted", supported = true } = opts;

  if (supported) {
    Object.defineProperty(global, "Notification", {
      value: {
        permission,
        requestPermission: vi.fn().mockResolvedValue(permission),
      },
      writable: true,
      configurable: true,
    });

    const pushSub = {
      toJSON: () => ({
        endpoint: "https://push.example.com/abc",
        keys: { p256dh: "BHg5YH9KmKs", auth: "authSecret123" },
      }),
    };

    mockSubscribe.mockResolvedValue(pushSub);
    mockRegister.mockResolvedValue({
      pushManager: { subscribe: mockSubscribe },
    });

    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        register: mockRegister,
        ready: Promise.resolve({ pushManager: { subscribe: mockSubscribe } }),
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, "PushManager", {
      value: {},
      writable: true,
      configurable: true,
    });
  } else {
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    // @ts-expect-error intentional
    delete global.PushManager;
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: "sub-1" }),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("subscribeToPush", () => {
  it("returns false if push is not supported in the browser", async () => {
    setupBrowserMocks({ supported: false });
    const { subscribeToPush } = await import("./push-subscription");
    const result = await subscribeToPush();
    expect(result).toBe(false);
  });

  it("returns false if notification permission is denied", async () => {
    setupBrowserMocks({ permission: "denied" });
    const { subscribeToPush } = await import("./push-subscription");
    const result = await subscribeToPush();
    expect(result).toBe(false);
  });

  it("registers service worker and subscribes with VAPID key", async () => {
    setupBrowserMocks();
    const { subscribeToPush } = await import("./push-subscription");
    await subscribeToPush();
    expect(mockRegister).toHaveBeenCalledWith("/sw.js");
    expect(mockSubscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true }),
    );
  });

  it("calls POST /notifications/push-subscription with subscription data", async () => {
    setupBrowserMocks();
    const { subscribeToPush } = await import("./push-subscription");
    const result = await subscribeToPush();
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/notifications/push-subscription"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      }),
    );
  });
});

describe("unsubscribeFromPush", () => {
  it("calls DELETE /notifications/push-subscription", async () => {
    setupBrowserMocks();
    const { unsubscribeFromPush } = await import("./push-subscription");
    await unsubscribeFromPush();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/notifications/push-subscription"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
