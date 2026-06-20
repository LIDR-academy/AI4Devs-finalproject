import {
  EXPIRING_SOON_THRESHOLD_DAYS,
  NotificationThresholdService,
} from "./notification-threshold.service";

describe("NotificationThresholdService", () => {
  const service = new NotificationThresholdService();

  it("calculates exact 3-day boundary", () => {
    const now = new Date("2026-06-10T12:00:00.000Z");
    const expiration = new Date("2026-06-13T08:00:00.000Z");

    expect(service.daysUntilExpiration(expiration, now)).toBe(3);
    expect(service.shouldNotify(3)).toBe(true);
    expect(EXPIRING_SOON_THRESHOLD_DAYS).toBe(3);
  });

  it("does not notify for non-boundary days", () => {
    expect(service.shouldNotify(4)).toBe(false);
    expect(service.shouldNotify(2)).toBe(false);
  });
});
