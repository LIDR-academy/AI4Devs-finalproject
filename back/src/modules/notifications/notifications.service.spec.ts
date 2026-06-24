import { NotificationsService } from "./notifications.service";

describe("NotificationsService duplicate prevention", () => {
  const userId = "user-1";
  const itemId = "item-1";

  function createService(deliveryServiceMock?: { deliverExpiry: jest.Mock }) {
    const state = {
      item: {
        id: itemId,
        userId,
        name: "Greek Yogurt",
        quantity: 1,
        unit: "unit",
        expirationDate: new Date("2026-06-13T00:00:00.000Z"),
        lastExpirationAlertAt: null as Date | null,
        createdAt: new Date("2026-06-10T00:00:00.000Z"),
        updatedAt: new Date("2026-06-10T00:00:00.000Z"),
      },
      publishCalls: 0,
    };

    const prismaMock = {
      pantryItem: {
        findMany: jest.fn(async () => [state.item]),
        update: jest.fn(async ({ data }: any) => {
          state.item.lastExpirationAlertAt = data.lastExpirationAlertAt;
          return state.item;
        }),
      },
      user: {
        findUnique: jest.fn(async () => ({ id: userId, email: "user@example.com" })),
      },
    } as any;

    const thresholdServiceMock = {
      daysUntilExpiration: jest.fn(() => 3),
      shouldNotify: jest.fn(() => true),
    } as any;

    const preferencesServiceMock = {
      isExpirationEnabled: jest.fn(async () => true),
    } as any;

    const eventsPublisherMock = {
      publishExpirationEvent: jest.fn(async () => {
        state.publishCalls += 1;
      }),
    } as any;

    const defaultDeliveryMock = { deliverExpiry: jest.fn(async () => undefined) };

    return {
      service: new NotificationsService(
        prismaMock,
        thresholdServiceMock,
        preferencesServiceMock,
        eventsPublisherMock,
        (deliveryServiceMock ?? defaultDeliveryMock) as any,
      ),
      state,
      prismaMock,
      deliveryServiceMock: deliveryServiceMock ?? defaultDeliveryMock,
    };
  }

  it("publishes once and suppresses duplicate on same day", async () => {
    const { service, state } = createService();
    const now = new Date("2026-06-10T09:00:00.000Z");

    const first = await service.evaluateExpiringItems(now);
    const second = await service.evaluateExpiringItems(now);

    expect(first.generated).toBe(1);
    expect(second.generated).toBe(0);
    expect(second.suppressedByDuplicate).toBe(1);
    expect(state.publishCalls).toBe(1);
  });
});

describe("NotificationsService — delivery integration", () => {
  const userId = "user-1";

  function createService(deliveryMock?: { deliverExpiry: jest.Mock }) {
    const item = {
      id: "item-1",
      userId,
      name: "Greek Yogurt",
      quantity: 1,
      unit: "unit",
      expirationDate: new Date("2026-06-13T00:00:00.000Z"),
      lastExpirationAlertAt: null as Date | null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const prismaMock = {
      pantryItem: {
        findMany: jest.fn(async () => [item]),
        update: jest.fn(async ({ data }: any) => {
          item.lastExpirationAlertAt = data.lastExpirationAlertAt;
          return item;
        }),
      },
      user: {
        findUnique: jest.fn(async () => ({ id: userId, email: "user@example.com" })),
      },
    } as any;

    const deliveryServiceMock = deliveryMock ?? { deliverExpiry: jest.fn(async () => undefined) };

    const service = new NotificationsService(
      prismaMock,
      { daysUntilExpiration: jest.fn(() => 3), shouldNotify: jest.fn(() => true) } as any,
      { isExpirationEnabled: jest.fn(async () => true) } as any,
      { publishExpirationEvent: jest.fn(async () => undefined) } as any,
      deliveryServiceMock as any,
    );

    return { service, prismaMock, deliveryServiceMock };
  }

  it("calls deliverExpiry after publishing event", async () => {
    const { service, deliveryServiceMock } = createService();

    await service.evaluateExpiringItems(new Date("2026-06-10T09:00:00.000Z"));

    expect(deliveryServiceMock.deliverExpiry).toHaveBeenCalledWith(
      userId,
      expect.arrayContaining([expect.objectContaining({ name: "Greek Yogurt" })]),
      "user@example.com",
    );
  });

  it("does not call deliverExpiry when item is suppressed by preference", async () => {
    const deliveryMock = { deliverExpiry: jest.fn(async () => undefined) };
    const item = {
      id: "item-2",
      userId,
      name: "Milk",
      quantity: 1,
      unit: "unit",
      expirationDate: new Date("2026-06-13T00:00:00.000Z"),
      lastExpirationAlertAt: null as Date | null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const prismaMock = {
      pantryItem: { findMany: jest.fn(async () => [item]), update: jest.fn() },
      user: { findUnique: jest.fn(async () => ({ id: userId, email: "u@x.com" })) },
    } as any;

    const service = new NotificationsService(
      prismaMock,
      { daysUntilExpiration: jest.fn(() => 3), shouldNotify: jest.fn(() => true) } as any,
      { isExpirationEnabled: jest.fn(async () => false) } as any,
      { publishExpirationEvent: jest.fn() } as any,
      deliveryMock as any,
    );

    await service.evaluateExpiringItems(new Date());

    expect(deliveryMock.deliverExpiry).not.toHaveBeenCalled();
  });

  it("catches deliverExpiry errors without incrementing metrics.errors", async () => {
    const deliveryMock = {
      deliverExpiry: jest.fn(async () => {
        throw new Error("delivery failed");
      }),
    };
    const { service } = createService(deliveryMock);

    const metrics = await service.evaluateExpiringItems(new Date("2026-06-10T09:00:00.000Z"));

    expect(metrics.errors).toBe(0);
    expect(metrics.generated).toBe(1);
  });
});
