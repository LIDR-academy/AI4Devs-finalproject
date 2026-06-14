import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Decimal } from "@prisma/client/runtime/library";
import {
  computeEstimatedValue,
  daysPastExpiry,
  isFarPastExpiry,
  PantryService,
} from "./pantry.service";
import { PantryConsumptionEventType } from "./dto/register-consumption-event.dto";

// ── Pure-function unit tests ─────────────────────────────────────────────────

describe("daysPastExpiry", () => {
  const now = new Date("2026-06-14T10:00:00.000Z");

  it("returns 0 when expiry is today", () => {
    expect(daysPastExpiry(new Date("2026-06-14T00:00:00.000Z"), now)).toBe(0);
  });

  it("returns positive days when item has expired", () => {
    expect(daysPastExpiry(new Date("2026-06-07T00:00:00.000Z"), now)).toBe(7);
    expect(daysPastExpiry(new Date("2026-06-13T00:00:00.000Z"), now)).toBe(1);
  });

  it("returns negative days when item expires in the future", () => {
    expect(daysPastExpiry(new Date("2026-06-21T00:00:00.000Z"), now)).toBe(-7);
  });
});

describe("isFarPastExpiry", () => {
  const now = new Date("2026-06-14T10:00:00.000Z");

  it("returns false for item with no expiration date", () => {
    expect(isFarPastExpiry({ expirationDate: null }, now)).toBe(false);
  });

  it("returns false for item expired 6 days ago (below threshold)", () => {
    expect(isFarPastExpiry({ expirationDate: new Date("2026-06-08T00:00:00.000Z") }, now)).toBe(false);
  });

  it("returns true for item expired exactly 7 days ago (at threshold)", () => {
    expect(isFarPastExpiry({ expirationDate: new Date("2026-06-07T00:00:00.000Z") }, now)).toBe(true);
  });

  it("returns true for item expired 8+ days ago (beyond threshold)", () => {
    expect(isFarPastExpiry({ expirationDate: new Date("2026-06-01T00:00:00.000Z") }, now)).toBe(true);
  });

  it("returns false for item that expires in the future", () => {
    expect(isFarPastExpiry({ expirationDate: new Date("2026-06-21T00:00:00.000Z") }, now)).toBe(false);
  });
});

describe("computeEstimatedValue", () => {
  it("returns null when pricePaid is null", () => {
    expect(computeEstimatedValue(null, 4, 2)).toBeNull();
  });

  it("returns null when originalQuantity is 0", () => {
    expect(computeEstimatedValue(new Decimal("4.00"), 0, 2)).toBeNull();
  });

  it("returns null when eventQuantity is 0", () => {
    expect(computeEstimatedValue(new Decimal("4.00"), 4, 0)).toBeNull();
  });

  it("computes proportional value for partial waste", () => {
    const result = computeEstimatedValue(new Decimal("4.00"), 4, 2);
    expect(result).toBeCloseTo(2.0);
  });

  it("returns full price when entire quantity is wasted", () => {
    const result = computeEstimatedValue(new Decimal("3.99"), 3, 3);
    expect(result).toBeCloseTo(3.99);
  });

  it("handles decimal price correctly", () => {
    const result = computeEstimatedValue(new Decimal("1.50"), 3, 1);
    expect(result).toBeCloseTo(0.5);
  });
});

// ── PantryService integration tests (mocked Prisma) ──────────────────────────

const MOCK_USER = { id: "user-1", email: "test@example.com", password: "hashed", createdAt: new Date(), updatedAt: new Date() };

const MOCK_ITEM_NO_EXPIRY = {
  id: "item-1",
  userId: "user-1",
  name: "Milk",
  quantity: 4,
  unit: "l",
  pricePaid: null as Decimal | null,
  expirationDate: null as Date | null,
  lastExpirationAlertAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_ITEM_FUTURE_EXPIRY = {
  ...MOCK_ITEM_NO_EXPIRY,
  id: "item-2",
  expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

function makeFarPastExpiryItem(pricePaid: Decimal | null = null) {
  return {
    ...MOCK_ITEM_NO_EXPIRY,
    id: "item-3",
    expirationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    pricePaid,
  };
}

function makePrismaMock(item: typeof MOCK_ITEM_NO_EXPIRY | null = MOCK_ITEM_NO_EXPIRY) {
  const eventResult = { id: "evt-1" };
  const deletedItem = item ?? MOCK_ITEM_NO_EXPIRY;
  return {
    pantryItem: {
      findUnique: jest.fn().mockResolvedValue(item),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    consumptionEvent: {
      create: jest.fn().mockResolvedValue(eventResult),
    },
    householdMember: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    $transaction: jest.fn().mockImplementation((ops: unknown[]) => {
      void deletedItem;
      return Promise.resolve(ops.map((op) => {
        if (op === ops[0]) return eventResult;
        return deletedItem;
      }));
    }),
  } as any;
}

function makeService(prismaMock: ReturnType<typeof makePrismaMock>) {
  const usersServiceMock = { findById: jest.fn().mockResolvedValue(MOCK_USER) } as any;
  return new PantryService(prismaMock, usersServiceMock);
}

describe("PantryService.registerEvent", () => {
  it("registers a CONSUMED event without expiry — no confirmation needed", async () => {
    const prisma = makePrismaMock(MOCK_ITEM_NO_EXPIRY);
    const svc = makeService(prisma);

    const result = await svc.registerEvent("user-1", "item-1", {
      type: PantryConsumptionEventType.CONSUMED,
    });

    expect(result.id).toBe("evt-1");
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("registers a WASTED event on item with no expiry — no confirmation needed", async () => {
    const prisma = makePrismaMock(MOCK_ITEM_NO_EXPIRY);
    const svc = makeService(prisma);

    const result = await svc.registerEvent("user-1", "item-1", {
      type: PantryConsumptionEventType.WASTED,
    });

    expect(result.id).toBe("evt-1");
  });

  it("registers a WASTED event on a recently expired item — no confirmation needed", async () => {
    const item = { ...MOCK_ITEM_NO_EXPIRY, expirationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) };
    const prisma = makePrismaMock(item);
    const svc = makeService(prisma);

    const result = await svc.registerEvent("user-1", "item-1", {
      type: PantryConsumptionEventType.WASTED,
    });

    expect(result.id).toBe("evt-1");
  });

  it("throws ConflictException WASTE_CONFIRMATION_REQUIRED for far-past-expiry without confirmed flag", async () => {
    const prisma = makePrismaMock(makeFarPastExpiryItem());
    const svc = makeService(prisma);

    await expect(
      svc.registerEvent("user-1", "item-3", { type: PantryConsumptionEventType.WASTED }),
    ).rejects.toThrow(ConflictException);

    try {
      await svc.registerEvent("user-1", "item-3", { type: PantryConsumptionEventType.WASTED });
    } catch (err) {
      expect((err as ConflictException).getResponse()).toMatchObject({
        code: "WASTE_CONFIRMATION_REQUIRED",
      });
    }
  });

  it("registers WASTED event on far-past-expiry item when confirmed: true is provided", async () => {
    const prisma = makePrismaMock(makeFarPastExpiryItem());
    const svc = makeService(prisma);

    const result = await svc.registerEvent("user-1", "item-3", {
      type: PantryConsumptionEventType.WASTED,
      confirmed: true,
    });

    expect(result.id).toBe("evt-1");
  });

  it("CONSUMED event on far-past-expiry item does not require confirmation", async () => {
    const prisma = makePrismaMock(makeFarPastExpiryItem());
    const svc = makeService(prisma);

    const result = await svc.registerEvent("user-1", "item-3", {
      type: PantryConsumptionEventType.CONSUMED,
    });

    expect(result.id).toBe("evt-1");
  });

  it("throws NotFoundException when item does not exist", async () => {
    const prisma = makePrismaMock(null);
    const svc = makeService(prisma);

    await expect(
      svc.registerEvent("user-1", "item-x", { type: PantryConsumptionEventType.CONSUMED }),
    ).rejects.toThrow(NotFoundException);
  });

  it("throws NotFoundException when item belongs to another user outside household", async () => {
    const item = { ...MOCK_ITEM_NO_EXPIRY, userId: "user-other" };
    const prisma = makePrismaMock(item);
    const svc = makeService(prisma);

    await expect(
      svc.registerEvent("user-1", "item-1", { type: PantryConsumptionEventType.CONSUMED }),
    ).rejects.toThrow(NotFoundException);
  });

  it("throws ForbiddenException when user is not found", async () => {
    const prisma = makePrismaMock();
    const usersServiceMock = { findById: jest.fn().mockResolvedValue(null) } as any;
    const svc = new PantryService(prisma, usersServiceMock);

    await expect(
      svc.registerEvent("user-x", "item-1", { type: PantryConsumptionEventType.CONSUMED }),
    ).rejects.toThrow(ForbiddenException);
  });

  it("includes estimatedValueEur in consumptionEvent.create when pricePaid is set", async () => {
    const item = { ...MOCK_ITEM_NO_EXPIRY, pricePaid: new Decimal("4.00"), quantity: 4 };
    const prisma = makePrismaMock(item);
    const svc = makeService(prisma);

    await svc.registerEvent("user-1", "item-1", {
      type: PantryConsumptionEventType.WASTED,
      quantity: 2,
    });

    expect(prisma.consumptionEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ estimatedValueEur: 2 }),
      }),
    );
  });
});
