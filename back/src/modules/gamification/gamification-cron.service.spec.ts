import { GamificationCronService } from "./gamification-cron.service";

const USER_ID = "user-1";
// Reference "now": Wednesday 2026-06-24 → most recently completed week is Mon 15 – Sun 21 June.
const NOW = new Date("2026-06-24T12:00:00.000Z");

function makeMocks(events: Array<{ userId: string; type: "CONSUMED" | "WASTED"; occurredAt: Date }>) {
  const prisma = {
    consumptionEvent: {
      findMany: jest.fn(async () => events),
    },
  } as any;
  const badgeService = { awardBadge: jest.fn(async () => undefined) } as any;
  return { prisma, badgeService };
}

describe("GamificationCronService.evaluateZeroWasteWeek", () => {
  it("awards ZERO_WASTE_WEEK to a user with activity and no waste in the completed week", async () => {
    const { prisma, badgeService } = makeMocks([
      { userId: USER_ID, type: "CONSUMED", occurredAt: new Date("2026-06-16T10:00:00.000Z") },
    ]);
    const service = new GamificationCronService(prisma, badgeService);

    await service.evaluateZeroWasteWeek(NOW);

    expect(badgeService.awardBadge).toHaveBeenCalledWith(USER_ID, "ZERO_WASTE_WEEK");
  });

  it("does not award when the completed week contains a waste event", async () => {
    const { prisma, badgeService } = makeMocks([
      { userId: USER_ID, type: "CONSUMED", occurredAt: new Date("2026-06-16T10:00:00.000Z") },
      { userId: USER_ID, type: "WASTED", occurredAt: new Date("2026-06-17T10:00:00.000Z") },
    ]);
    const service = new GamificationCronService(prisma, badgeService);

    await service.evaluateZeroWasteWeek(NOW);

    expect(badgeService.awardBadge).not.toHaveBeenCalled();
  });

  it("does not award when there is no activity in the completed week", async () => {
    const { prisma, badgeService } = makeMocks([]);
    const service = new GamificationCronService(prisma, badgeService);

    await service.evaluateZeroWasteWeek(NOW);

    expect(badgeService.awardBadge).not.toHaveBeenCalled();
  });

  it("evaluates each user independently", async () => {
    const { prisma, badgeService } = makeMocks([
      { userId: "clean-user", type: "CONSUMED", occurredAt: new Date("2026-06-16T10:00:00.000Z") },
      { userId: "wasteful-user", type: "WASTED", occurredAt: new Date("2026-06-18T10:00:00.000Z") },
    ]);
    const service = new GamificationCronService(prisma, badgeService);

    await service.evaluateZeroWasteWeek(NOW);

    expect(badgeService.awardBadge).toHaveBeenCalledWith("clean-user", "ZERO_WASTE_WEEK");
    expect(badgeService.awardBadge).not.toHaveBeenCalledWith("wasteful-user", "ZERO_WASTE_WEEK");
  });
});
