import { NotificationsController } from "./notifications.controller";
import type { CreatePushSubscriptionDto } from "./dto/create-push-subscription.dto";

const userId = "user-1";
const userEmail = "user@example.com";

function makeRequest() {
  return { user: { id: userId, email: userEmail } };
}

function createController() {
  const deliveryServiceMock = {
    savePushSubscription: jest.fn(async () => "sub-abc"),
    deletePushSubscription: jest.fn(async () => undefined),
  };

  const preferencesServiceMock = {
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
  };

  const notificationsServiceMock = {
    evaluateExpiringItems: jest.fn(),
    resetUserAlertMarks: jest.fn(),
  };

  const eventsPublisherMock = {
    listUserEvents: jest.fn(() => []),
    clearUserEvents: jest.fn(),
  };

  const controller = new NotificationsController(
    preferencesServiceMock as any,
    notificationsServiceMock as any,
    eventsPublisherMock as any,
    deliveryServiceMock as any,
  );

  return { controller, deliveryServiceMock };
}

describe("NotificationsController — push subscription endpoints", () => {
  it("subscribePush calls savePushSubscription and returns the subscription id", async () => {
    const { controller, deliveryServiceMock } = createController();
    const body: CreatePushSubscriptionDto = {
      endpoint: "https://push.example.com/abc",
      keys: { p256dh: "BHg5YH9KmKs", auth: "authSecret123" },
    };

    const result = await controller.subscribePush(makeRequest() as any, body);

    expect(deliveryServiceMock.savePushSubscription).toHaveBeenCalledWith(userId, {
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    });
    expect(result).toEqual({ id: "sub-abc" });
  });

  it("unsubscribePush calls deletePushSubscription for the user", async () => {
    const { controller, deliveryServiceMock } = createController();

    await controller.unsubscribePush(makeRequest() as any);

    expect(deliveryServiceMock.deletePushSubscription).toHaveBeenCalledWith(userId);
  });
});
