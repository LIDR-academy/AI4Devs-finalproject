import { ForbiddenException } from "@nestjs/common";
import { NotificationPreferencesService } from "./notification-preferences.service";

describe("NotificationPreferencesService", () => {
  const user = { id: "user-1", email: "user@example.com" };

  function createService() {
    const prefsByUser = new Map<
      string,
      {
        expirationEnabled: boolean;
        priceDropEnabled: boolean;
        foodConsumedByOthersEnabled: boolean;
      }
    >();

    const prismaMock = {
      notificationPreference: {
        upsert: jest.fn(async ({ where, create, update }: any) => {
          const existing = prefsByUser.get(where.userId);
          if (!existing) {
            const created = {
              userId: create.userId,
              expirationEnabled: create.expirationEnabled,
              priceDropEnabled: create.priceDropEnabled,
              foodConsumedByOthersEnabled: create.foodConsumedByOthersEnabled,
            };
            prefsByUser.set(where.userId, created);
            return created;
          }

          const merged = {
            userId: where.userId,
            expirationEnabled:
              typeof update.expirationEnabled === "boolean"
                ? update.expirationEnabled
                : existing.expirationEnabled,
            priceDropEnabled:
              typeof update.priceDropEnabled === "boolean"
                ? update.priceDropEnabled
                : existing.priceDropEnabled,
            foodConsumedByOthersEnabled:
              typeof update.foodConsumedByOthersEnabled === "boolean"
                ? update.foodConsumedByOthersEnabled
                : existing.foodConsumedByOthersEnabled,
          };
          prefsByUser.set(where.userId, merged);
          return merged;
        }),
        findUnique: jest.fn(async ({ where }: any) => {
          return prefsByUser.get(where.userId) ?? null;
        }),
      },
    } as any;

    const usersServiceMock = {
      findById: jest.fn(async (id: string) => (id === user.id ? user : null)),
    } as any;

    return {
      service: new NotificationPreferencesService(prismaMock, usersServiceMock),
    };
  }

  it("defaults to enabled preference when record is missing", async () => {
    const { service } = createService();

    const prefs = await service.getPreferences(user.id);

    expect(prefs.expirationEnabled).toBe(true);
    expect(prefs.priceDropEnabled).toBe(true);
    expect(prefs.foodConsumedByOthersEnabled).toBe(true);
  });

  it("persists updated preference", async () => {
    const { service } = createService();

    const updated = await service.updatePreferences(user.id, {
      expirationEnabled: false,
      priceDropEnabled: false,
      foodConsumedByOthersEnabled: true,
    });

    expect(updated.expirationEnabled).toBe(false);
    expect(updated.priceDropEnabled).toBe(false);
    expect(updated.foodConsumedByOthersEnabled).toBe(true);
    await expect(service.isExpirationEnabled(user.id)).resolves.toBe(false);
  });

  it("rejects unknown user access", async () => {
    const { service } = createService();

    await expect(service.getPreferences("missing")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});

describe("NotificationPreferencesService — auto-expiry settings", () => {
  const user = { id: "user-ax", email: "ax@example.com" };

  function createService() {
    const store = new Map<string, { autoExpiryEnabled: boolean; autoExpiryThresholdDays: number }>();
    const prismaMock = {
      notificationPreference: {
        upsert: jest.fn(async ({ where, create, update }: any) => {
          const existing = store.get(where.userId);
          if (!existing) {
            const created = {
              userId: where.userId,
              autoExpiryEnabled: create.autoExpiryEnabled ?? true,
              autoExpiryThresholdDays: create.autoExpiryThresholdDays ?? 14,
            };
            store.set(where.userId, created);
            return created;
          }
          const merged = {
            ...existing,
            autoExpiryEnabled:
              typeof update.autoExpiryEnabled === "boolean"
                ? update.autoExpiryEnabled
                : existing.autoExpiryEnabled,
            autoExpiryThresholdDays:
              typeof update.autoExpiryThresholdDays === "number"
                ? update.autoExpiryThresholdDays
                : existing.autoExpiryThresholdDays,
          };
          store.set(where.userId, merged);
          return merged;
        }),
      },
    } as any;
    const usersServiceMock = { findById: jest.fn(async (id: string) => (id === user.id ? user : null)) } as any;
    return { service: new NotificationPreferencesService(prismaMock, usersServiceMock) };
  }

  it("returns the defaults (enabled, 14 days) when no row exists", async () => {
    const { service } = createService();
    expect(await service.getAutoExpiry(user.id)).toEqual({ enabled: true, thresholdDays: 14 });
  });

  it("persists an enabled=false update", async () => {
    const { service } = createService();
    const updated = await service.updateAutoExpiry(user.id, { enabled: false });
    expect(updated.enabled).toBe(false);
    expect((await service.getAutoExpiry(user.id)).enabled).toBe(false);
  });

  it("persists a custom threshold", async () => {
    const { service } = createService();
    const updated = await service.updateAutoExpiry(user.id, { enabled: true, thresholdDays: 30 });
    expect(updated.thresholdDays).toBe(30);
  });
});
