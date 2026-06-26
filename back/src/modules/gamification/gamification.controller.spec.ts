import { GamificationController } from "./gamification.controller";
import type { GamificationService } from "./gamification.service";

const SUMMARY = {
  totalPoints: 35,
  totalValueSavedEur: 12.5,
  totalValueWastedEur: 3,
  consumedBeforeExpiryCount: 3,
  wastedCount: 1,
  badges: [],
  weeklyStreak: 2,
};

const HISTORY = { events: [], total: 0 };

function makeController(serviceOverrides: Partial<GamificationService> = {}) {
  const service = {
    getSummary: jest.fn(async () => SUMMARY),
    getHistory: jest.fn(async () => HISTORY),
    ...serviceOverrides,
  } as unknown as GamificationService;
  return { controller: new GamificationController(service), service };
}

describe("GamificationController", () => {
  it("returns the summary for the authenticated user", async () => {
    const { controller, service } = makeController();
    const req = { user: { id: "user-1", email: "user@example.com" } };

    const result = await controller.getSummary(req as any);

    expect(service.getSummary).toHaveBeenCalledWith("user-1");
    expect(result).toBe(SUMMARY);
  });

  it("derives the user id only from the request, never from a parameter", async () => {
    const { controller, service } = makeController();
    const req = { user: { id: "user-2", email: "two@example.com" } };

    await controller.getSummary(req as any);

    expect(service.getSummary).toHaveBeenCalledWith("user-2");
  });

  it("forwards pagination params and the authenticated user id to getHistory", async () => {
    const { controller, service } = makeController();
    const req = { user: { id: "user-1", email: "user@example.com" } };

    const result = await controller.getHistory(req as any, { limit: 10, offset: 20 });

    expect(service.getHistory).toHaveBeenCalledWith("user-1", 10, 20);
    expect(result).toBe(HISTORY);
  });

  it("applies default pagination when query params are omitted", async () => {
    const { controller, service } = makeController();
    const req = { user: { id: "user-1", email: "user@example.com" } };

    await controller.getHistory(req as any, {});

    expect(service.getHistory).toHaveBeenCalledWith("user-1", 20, 0);
  });
});
