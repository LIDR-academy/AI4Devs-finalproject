import { Decimal } from "@prisma/client/runtime/library";
import { BadgeService } from "./badge.service";

const USER_ID = "user-1";

interface MockOpts {
  beforeExpiryCount: number;
  valueSaved: number;
  earned?: string[];
  createThrows?: boolean;
}

function makeMocks(opts: MockOpts) {
  const earned = opts.earned ?? [];
  const created: string[] = [];
  const prisma = {
    userPoints: {
      count: jest.fn(async () => opts.beforeExpiryCount),
    },
    consumptionEvent: {
      findMany: jest.fn(async () =>
        opts.valueSaved > 0
          ? [
              {
                type: "CONSUMED",
                itemExpirationDate: new Date("2026-06-30T00:00:00.000Z"),
                occurredAt: new Date("2026-06-20T00:00:00.000Z"),
                estimatedValueEur: new Decimal(opts.valueSaved.toString()),
              },
            ]
          : [],
      ),
    },
    userBadge: {
      findMany: jest.fn(async () => earned.map((code) => ({ code }))),
      create: jest.fn(async ({ data }: { data: { code: string } }) => {
        if (opts.createThrows) {
          const err: any = new Error("Unique constraint failed");
          err.code = "P2002";
          throw err;
        }
        created.push(data.code);
        return { id: `badge-${created.length}`, ...data };
      }),
    },
  } as any;

  const notificationDelivery = { deliverBadge: jest.fn(async () => undefined) } as any;
  return { prisma, notificationDelivery, created };
}

describe("BadgeService.evaluateBadges", () => {
  it("awards FIRST_SAVE on the first before-expiry consume", async () => {
    const { prisma, notificationDelivery, created } = makeMocks({ beforeExpiryCount: 1, valueSaved: 0 });
    const service = new BadgeService(prisma, notificationDelivery);

    await service.evaluateBadges(USER_ID);

    expect(created).toContain("FIRST_SAVE");
  });

  it("awards SAVER_10 at 10 before-expiry consumes without re-awarding FIRST_SAVE", async () => {
    const { prisma, created } = makeMocks({
      beforeExpiryCount: 10,
      valueSaved: 0,
      earned: ["FIRST_SAVE"],
    });
    const service = new BadgeService(prisma, { deliverBadge: jest.fn() } as any);

    await service.evaluateBadges(USER_ID);

    expect(created).toContain("SAVER_10");
    expect(created).not.toContain("FIRST_SAVE");
  });

  it("awards MONEY_SAVER_10 when value saved reaches €10", async () => {
    const { prisma, created } = makeMocks({ beforeExpiryCount: 1, valueSaved: 12.5, earned: ["FIRST_SAVE"] });
    const service = new BadgeService(prisma, { deliverBadge: jest.fn() } as any);

    await service.evaluateBadges(USER_ID);

    expect(created).toContain("MONEY_SAVER_10");
  });

  it("does not re-create a badge that is already earned", async () => {
    const { prisma, created } = makeMocks({
      beforeExpiryCount: 1,
      valueSaved: 0,
      earned: ["FIRST_SAVE"],
    });
    const service = new BadgeService(prisma, { deliverBadge: jest.fn() } as any);

    await service.evaluateBadges(USER_ID);

    expect(created).not.toContain("FIRST_SAVE");
    expect(prisma.userBadge.create).not.toHaveBeenCalled();
  });

  it("sends a notification for each newly awarded badge", async () => {
    const { prisma, notificationDelivery } = makeMocks({ beforeExpiryCount: 1, valueSaved: 0 });
    const service = new BadgeService(prisma, notificationDelivery);

    await service.evaluateBadges(USER_ID);

    expect(notificationDelivery.deliverBadge).toHaveBeenCalledWith(
      USER_ID,
      "First Save",
      expect.stringContaining("first item"),
    );
  });

  it("treats a unique-constraint conflict as a no-op (no throw)", async () => {
    const { prisma, notificationDelivery } = makeMocks({
      beforeExpiryCount: 1,
      valueSaved: 0,
      createThrows: true,
    });
    const service = new BadgeService(prisma, notificationDelivery);

    await expect(service.evaluateBadges(USER_ID)).resolves.toBeUndefined();
    // A conflicting (already-awarded) badge must not fire a duplicate notification.
    expect(notificationDelivery.deliverBadge).not.toHaveBeenCalled();
  });
});
