import { Decimal } from "@prisma/client/runtime/library";
import { PointsService } from "./points.service";

interface FakeEvent {
  id: string;
  userId: string;
  type: "CONSUMED" | "WASTED";
  itemExpirationDate: Date | null;
  occurredAt: Date;
  estimatedValueEur: Decimal | null;
}

function makePrismaMock(event: FakeEvent | null) {
  const created: Array<{ userId: string; delta: number; reason: string; referenceId: string | null }> =
    [];
  const prisma = {
    consumptionEvent: {
      findUnique: jest.fn(async () => event),
    },
    userPoints: {
      create: jest.fn(async ({ data }: { data: any }) => {
        created.push(data);
        return { id: `points-${created.length}`, ...data };
      }),
    },
  } as any;
  return { prisma, created };
}

function makeBadgeMock() {
  return { evaluateBadges: jest.fn(async () => undefined) } as any;
}

const USER_ID = "user-1";
const EVENT_ID = "event-1";

function consumedEvent(overrides: Partial<FakeEvent> = {}): FakeEvent {
  return {
    id: EVENT_ID,
    userId: USER_ID,
    type: "CONSUMED",
    itemExpirationDate: new Date("2026-06-30T00:00:00.000Z"),
    occurredAt: new Date("2026-06-20T00:00:00.000Z"),
    estimatedValueEur: new Decimal("2.50"),
    ...overrides,
  };
}

describe("PointsService.processConsumptionEvent", () => {
  it("awards +10 and a +5 bonus when consumed before expiry with >= 3 days to spare", async () => {
    const { prisma, created } = makePrismaMock(consumedEvent());
    const service = new PointsService(prisma, makeBadgeMock());

    await service.processConsumptionEvent(EVENT_ID);

    expect(created).toHaveLength(2);
    expect(created).toContainEqual(
      expect.objectContaining({ userId: USER_ID, delta: 10, reason: "CONSUMED_BEFORE_EXPIRY", referenceId: EVENT_ID }),
    );
    expect(created).toContainEqual(
      expect.objectContaining({ userId: USER_ID, delta: 5, reason: "BONUS_3_DAYS", referenceId: EVENT_ID }),
    );
  });

  it("awards +10 only when consumed before expiry with less than 3 days to spare", async () => {
    const event = consumedEvent({
      occurredAt: new Date("2026-06-29T00:00:00.000Z"), // 1 day before expiry
    });
    const { prisma, created } = makePrismaMock(event);
    const service = new PointsService(prisma, makeBadgeMock());

    await service.processConsumptionEvent(EVENT_ID);

    expect(created).toHaveLength(1);
    expect(created[0]).toEqual(
      expect.objectContaining({ delta: 10, reason: "CONSUMED_BEFORE_EXPIRY" }),
    );
  });

  it("awards no points when consumed on the expiry date", async () => {
    const event = consumedEvent({
      occurredAt: new Date("2026-06-30T00:00:00.000Z"),
      itemExpirationDate: new Date("2026-06-30T00:00:00.000Z"),
    });
    const { prisma, created } = makePrismaMock(event);
    const service = new PointsService(prisma, makeBadgeMock());

    await service.processConsumptionEvent(EVENT_ID);

    expect(created).toHaveLength(0);
  });

  it("awards no points when consumed after expiry", async () => {
    const event = consumedEvent({
      occurredAt: new Date("2026-07-05T00:00:00.000Z"),
    });
    const { prisma, created } = makePrismaMock(event);
    const service = new PointsService(prisma, makeBadgeMock());

    await service.processConsumptionEvent(EVENT_ID);

    expect(created).toHaveLength(0);
  });

  it("awards no points when the item has no expiry date", async () => {
    const event = consumedEvent({ itemExpirationDate: null });
    const { prisma, created } = makePrismaMock(event);
    const service = new PointsService(prisma, makeBadgeMock());

    await service.processConsumptionEvent(EVENT_ID);

    expect(created).toHaveLength(0);
  });

  it("deducts 5 points when an item is wasted", async () => {
    const event = consumedEvent({ type: "WASTED" });
    const { prisma, created } = makePrismaMock(event);
    const service = new PointsService(prisma, makeBadgeMock());

    await service.processConsumptionEvent(EVENT_ID);

    expect(created).toHaveLength(1);
    expect(created[0]).toEqual(
      expect.objectContaining({ delta: -5, reason: "WASTED", referenceId: EVENT_ID }),
    );
  });

  it("does nothing when the event does not exist", async () => {
    const { prisma, created } = makePrismaMock(null);
    const service = new PointsService(prisma, makeBadgeMock());

    await service.processConsumptionEvent("missing");

    expect(created).toHaveLength(0);
  });
});
