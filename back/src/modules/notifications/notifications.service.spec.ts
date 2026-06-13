import { NotificationsService } from "./notifications.service";

describe("NotificationsService duplicate prevention", () => {
  const userId = "user-1";
  const itemId = "item-1";

  function createService() {
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

    return {
      service: new NotificationsService(
        prismaMock,
        thresholdServiceMock,
        preferencesServiceMock,
        eventsPublisherMock,
      ),
      state,
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
