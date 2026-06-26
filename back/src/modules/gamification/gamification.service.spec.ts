import { Decimal } from "@prisma/client/runtime/library";
import { GamificationService } from "./gamification.service";
import { computeWeeklyStreak } from "./week";

interface FakeEvent {
  type: "CONSUMED" | "WASTED";
  itemExpirationDate: Date | null;
  occurredAt: Date;
  estimatedValueEur: Decimal | null;
}

const USER_ID = "user-1";

function makePrismaMock(opts: {
  pointsSum: number | null;
  events: FakeEvent[];
  badges: Array<{ id: string; code: string; earnedAt: Date }>;
}) {
  return {
    userPoints: {
      aggregate: jest.fn(async () => ({ _sum: { delta: opts.pointsSum } })),
    },
    consumptionEvent: {
      findMany: jest.fn(async () => opts.events),
    },
    userBadge: {
      findMany: jest.fn(async () => opts.badges),
    },
  } as any;
}

describe("GamificationService.getSummary", () => {
  it("clamps a negative total to 0", async () => {
    const prisma = makePrismaMock({ pointsSum: -15, events: [], badges: [] });
    const service = new GamificationService(prisma);

    const summary = await service.getSummary(USER_ID);

    expect(summary.totalPoints).toBe(0);
  });

  it("returns the raw positive total when above zero", async () => {
    const prisma = makePrismaMock({ pointsSum: 35, events: [], badges: [] });
    const service = new GamificationService(prisma);

    const summary = await service.getSummary(USER_ID);

    expect(summary.totalPoints).toBe(35);
  });

  it("counts before-expiry consumes and sums value saved", async () => {
    const events: FakeEvent[] = [
      {
        type: "CONSUMED",
        itemExpirationDate: new Date("2026-06-30T00:00:00.000Z"),
        occurredAt: new Date("2026-06-20T00:00:00.000Z"),
        estimatedValueEur: new Decimal("2.50"),
      },
      {
        type: "CONSUMED",
        itemExpirationDate: new Date("2026-06-10T00:00:00.000Z"),
        occurredAt: new Date("2026-06-12T00:00:00.000Z"), // after expiry, not saved
        estimatedValueEur: new Decimal("9.99"),
      },
      {
        type: "WASTED",
        itemExpirationDate: new Date("2026-06-05T00:00:00.000Z"),
        occurredAt: new Date("2026-06-06T00:00:00.000Z"),
        estimatedValueEur: new Decimal("3.00"),
      },
    ];
    const prisma = makePrismaMock({ pointsSum: 10, events, badges: [] });
    const service = new GamificationService(prisma);

    const summary = await service.getSummary(USER_ID);

    expect(summary.consumedBeforeExpiryCount).toBe(1);
    expect(summary.totalValueSavedEur).toBe(2.5);
    expect(summary.wastedCount).toBe(1);
    expect(summary.totalValueWastedEur).toBe(3);
  });

  it("enriches earned badges with catalog label and description", async () => {
    const prisma = makePrismaMock({
      pointsSum: 10,
      events: [],
      badges: [{ id: "b1", code: "FIRST_SAVE", earnedAt: new Date("2026-06-26T10:00:00.000Z") }],
    });
    const service = new GamificationService(prisma);

    const summary = await service.getSummary(USER_ID);

    expect(summary.badges).toHaveLength(1);
    expect(summary.badges[0]).toEqual(
      expect.objectContaining({
        code: "FIRST_SAVE",
        label: "First Save",
        earnedAt: "2026-06-26T10:00:00.000Z",
      }),
    );
    expect(summary.badges[0].description).toContain("first item");
  });

  it("returns an empty badge list and zero streak for a new user", async () => {
    const prisma = makePrismaMock({ pointsSum: null, events: [], badges: [] });
    const service = new GamificationService(prisma);

    const summary = await service.getSummary(USER_ID);

    expect(summary.totalPoints).toBe(0);
    expect(summary.badges).toEqual([]);
    expect(summary.weeklyStreak).toBe(0);
  });
});

function makeHistoryPrismaMock(
  points: Array<{ id: string; delta: number; reason: string; occurredAt: Date }>,
  badges: Array<{ id: string; code: string; earnedAt: Date }>,
) {
  return {
    userPoints: {
      findMany: jest.fn(async () => points),
    },
    userBadge: {
      findMany: jest.fn(async () => badges),
    },
  } as any;
}

describe("GamificationService.getHistory", () => {
  const points = [
    { id: "p1", delta: 10, reason: "CONSUMED_BEFORE_EXPIRY", occurredAt: new Date("2026-06-20T10:00:00.000Z") },
    { id: "p2", delta: -5, reason: "WASTED", occurredAt: new Date("2026-06-18T10:00:00.000Z") },
  ];
  const badges = [
    { id: "b1", code: "FIRST_SAVE", earnedAt: new Date("2026-06-22T10:00:00.000Z") },
  ];

  it("merges points and badges into reverse-chronological entries with a total", async () => {
    const prisma = makeHistoryPrismaMock(points, badges);
    const service = new GamificationService(prisma);

    const page = await service.getHistory(USER_ID, 20, 0);

    expect(page.total).toBe(3);
    expect(page.events.map((e) => e.id)).toEqual(["b1", "p1", "p2"]); // newest first
    expect(page.events[0]).toEqual(
      expect.objectContaining({ type: "BADGE_EARNED", badgeCode: "FIRST_SAVE", points: null }),
    );
    expect(page.events[1]).toEqual(
      expect.objectContaining({ type: "POINTS_EARNED", points: 10, badgeCode: null }),
    );
    expect(page.events[2]).toEqual(expect.objectContaining({ type: "POINTS_DEDUCTED", points: -5 }));
  });

  it("paginates by limit and offset while keeping total constant", async () => {
    const prisma = makeHistoryPrismaMock(points, badges);
    const service = new GamificationService(prisma);

    const firstPage = await service.getHistory(USER_ID, 2, 0);
    expect(firstPage.events.map((e) => e.id)).toEqual(["b1", "p1"]);
    expect(firstPage.total).toBe(3);

    const secondPage = await service.getHistory(USER_ID, 2, 2);
    expect(secondPage.events.map((e) => e.id)).toEqual(["p2"]);
    expect(secondPage.total).toBe(3);
  });

  it("provides a human-readable reason for each entry", async () => {
    const prisma = makeHistoryPrismaMock(points, badges);
    const service = new GamificationService(prisma);

    const page = await service.getHistory(USER_ID, 20, 0);

    expect(page.events.find((e) => e.id === "p1")?.reason).toMatch(/before expiry/i);
    expect(page.events.find((e) => e.id === "b1")?.reason).toMatch(/badge/i);
  });
});

describe("computeWeeklyStreak", () => {
  // Reference "now": Wednesday 2026-06-24 (current in-progress week is Mon 22 – Sun 28).
  const now = new Date("2026-06-24T12:00:00.000Z");

  function consumed(date: string): { type: "CONSUMED" | "WASTED"; occurredAt: Date } {
    return { type: "CONSUMED", occurredAt: new Date(date) };
  }
  function wasted(date: string): { type: "CONSUMED" | "WASTED"; occurredAt: Date } {
    return { type: "WASTED", occurredAt: new Date(date) };
  }

  it("counts consecutive completed zero-waste weeks", () => {
    const events = [
      consumed("2026-06-16T10:00:00.000Z"), // week Mon15–Sun21
      consumed("2026-06-09T10:00:00.000Z"), // week Mon08–Sun14
    ];
    expect(computeWeeklyStreak(events, now)).toBe(2);
  });

  it("stops the streak at a week containing a waste event", () => {
    const events = [
      consumed("2026-06-16T10:00:00.000Z"), // week Mon15–Sun21 (clean)
      wasted("2026-06-10T10:00:00.000Z"), // week Mon08–Sun14 (waste)
    ];
    expect(computeWeeklyStreak(events, now)).toBe(1);
  });

  it("returns 0 when the most recent completed week had no activity", () => {
    const events = [
      consumed("2026-06-01T10:00:00.000Z"), // older week, gap before last completed week
    ];
    expect(computeWeeklyStreak(events, now)).toBe(0);
  });

  it("ignores in-progress current week activity", () => {
    const events = [consumed("2026-06-23T10:00:00.000Z")]; // current week only
    expect(computeWeeklyStreak(events, now)).toBe(0);
  });
});
