// @vitest-environment node

import { getToken } from "firebase/messaging";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerDeviceToken } from "@/infrastructure/repositories/notificationsRepository";
import { getMessagingClient, isFirebaseConfigured } from "./firebaseClient";
import { runPushRegistration } from "./pushManager";

vi.mock("@/infrastructure/repositories/notificationsRepository", () => ({
  registerDeviceToken: vi.fn(),
}));

vi.mock("./firebaseClient", () => ({
  getMessagingClient: vi.fn(),
  isFirebaseConfigured: vi.fn().mockReturnValue(true),
}));

vi.mock("firebase/messaging", () => ({
  getToken: vi.fn(),
}));

const mockRegisterDeviceToken = vi.mocked(registerDeviceToken);
const mockGetMessagingClient = vi.mocked(getMessagingClient);
const mockIsFirebaseConfigured = vi.mocked(isFirebaseConfigured);
const mockGetToken = vi.mocked(getToken);

const FakeNotification = {
  permission: "default" as NotificationPermission,
  requestPermission: vi.fn(async (): Promise<NotificationPermission> => "granted"),
};

let storageStore: Map<string, string>;

function installGlobals(permission: NotificationPermission = "default") {
  storageStore = new Map<string, string>();

  vi.stubGlobal("window", { PushManager: {}, Notification: FakeNotification });
  vi.stubGlobal("Notification", FakeNotification);
  vi.stubGlobal("navigator", {
    serviceWorker: {
      getRegistrations: vi.fn().mockResolvedValue([{ active: true }]),
      register: vi.fn().mockResolvedValue({ active: true }),
    },
  });
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storageStore.get(key) ?? null,
    setItem: (key: string, value: string) => void storageStore.set(key, value),
    removeItem: (key: string) => void storageStore.delete(key),
  });

  FakeNotification.permission = permission;
  FakeNotification.requestPermission.mockReset();
  FakeNotification.requestPermission.mockResolvedValue("granted");

  mockRegisterDeviceToken.mockReset();
  mockRegisterDeviceToken.mockResolvedValue({} as never);
  mockGetMessagingClient.mockReset();
  mockGetMessagingClient.mockResolvedValue({ messaging: {}, vapidKey: "vapid" });
  mockIsFirebaseConfigured.mockReset();
  mockIsFirebaseConfigured.mockReturnValue(true);
  mockGetToken.mockReset();
  mockGetToken.mockResolvedValue("device-token-123");
}

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("runPushRegistration", () => {
  it("skips entirely (no prompt, no network) when the browser is unsupported", async () => {
    installGlobals();
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", {});

    const result = await runPushRegistration();

    expect(result.visible).toBe(false);
    expect(mockRegisterDeviceToken).not.toHaveBeenCalled();
  });

  it("skips entirely when Firebase is not configured", async () => {
    installGlobals();
    mockIsFirebaseConfigured.mockReturnValue(false);

    const result = await runPushRegistration();

    expect(result.visible).toBe(false);
    expect(mockRegisterDeviceToken).not.toHaveBeenCalled();
  });

  it("skips entirely while inside the 30-day decline cooldown", async () => {
    installGlobals("default");
    storageStore.set("pushDeclinedAt", String(Date.now()));

    const result = await runPushRegistration();

    expect(result.visible).toBe(false);
    expect(mockRegisterDeviceToken).not.toHaveBeenCalled();
  });

  it("offers the prompt affordance when permission is default", async () => {
    installGlobals("default");

    const result = await runPushRegistration();

    expect(result.visible).toBe(true);
    expect(result.variant).toBe("prompt");
  });

  it("registers the device token when the user accepts the prompt and grants permission", async () => {
    installGlobals("default");
    FakeNotification.requestPermission.mockResolvedValue("granted");

    const result = await runPushRegistration();
    await result.onAccept();

    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockRegisterDeviceToken).toHaveBeenCalledTimes(1);
    expect(mockRegisterDeviceToken).toHaveBeenCalledWith({
      token: "device-token-123",
      platform: "WEB",
    });
    expect(storageStore.get("pushDeclinedAt")).toBeUndefined();
  });

  it("stamps the 30-day cooldown when the OS prompt is declined", async () => {
    installGlobals("default");
    FakeNotification.requestPermission.mockResolvedValue("denied");

    const result = await runPushRegistration();
    await result.onAccept();

    expect(mockRegisterDeviceToken).not.toHaveBeenCalled();
    expect(storageStore.get("pushDeclinedAt")).not.toBeNull();
  });

  it("stamps the 30-day cooldown when the user taps 'Not now'", async () => {
    installGlobals("default");

    const result = await runPushRegistration();
    result.onDismiss();

    expect(mockRegisterDeviceToken).not.toHaveBeenCalled();
    expect(storageStore.get("pushDeclinedAt")).not.toBeNull();
  });

  it("swallows repository failures so the UI never breaks", async () => {
    installGlobals("default");
    mockRegisterDeviceToken.mockRejectedValue(new Error("network down"));

    const result = await runPushRegistration();
    await expect(result.onAccept()).resolves.toBeUndefined();
  });

  it("auto-registers silently when permission is already granted", async () => {
    installGlobals("granted");

    const result = await runPushRegistration();

    expect(result.visible).toBe(false);
    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockRegisterDeviceToken).toHaveBeenCalledTimes(1);
  });

  it("shows the blocked banner when notifications are off (permission denied)", async () => {
    installGlobals("denied");

    const result = await runPushRegistration();

    expect(result.visible).toBe(true);
    expect(result.variant).toBe("blocked");
    expect(mockRegisterDeviceToken).not.toHaveBeenCalled();
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  it("stamps the cooldown when the blocked banner is dismissed", async () => {
    installGlobals("denied");

    const result = await runPushRegistration();
    result.onDismiss();

    expect(storageStore.get("pushDeclinedAt")).not.toBeNull();
  });
});
