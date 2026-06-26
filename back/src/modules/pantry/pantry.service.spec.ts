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

function makePointsMock() {
  return { processConsumptionEvent: jest.fn().mockResolvedValue(undefined) } as any;
}

function makeService(
  prismaMock: ReturnType<typeof makePrismaMock>,
  pointsMock: ReturnType<typeof makePointsMock> = makePointsMock(),
) {
  const usersServiceMock = { findById: jest.fn().mockResolvedValue(MOCK_USER) } as any;
  return new PantryService(prismaMock, usersServiceMock, pointsMock);
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
    const svc = new PantryService(prisma, usersServiceMock, makePointsMock());

    await expect(
      svc.registerEvent("user-x", "item-1", { type: PantryConsumptionEventType.CONSUMED }),
    ).rejects.toThrow(ForbiddenException);
  });

  it("calls PointsService.processConsumptionEvent after a successful event registration", async () => {
    const prisma = makePrismaMock(MOCK_ITEM_NO_EXPIRY);
    const points = makePointsMock();
    const svc = makeService(prisma, points);

    await svc.registerEvent("user-1", "item-1", { type: PantryConsumptionEventType.CONSUMED });

    expect(points.processConsumptionEvent).toHaveBeenCalledWith("evt-1");
  });

  it("does not call PointsService when event registration fails", async () => {
    const prisma = makePrismaMock(null); // item not found → throws before any event is created
    const points = makePointsMock();
    const svc = makeService(prisma, points);

    await expect(
      svc.registerEvent("user-1", "item-x", { type: PantryConsumptionEventType.CONSUMED }),
    ).rejects.toThrow(NotFoundException);
    expect(points.processConsumptionEvent).not.toHaveBeenCalled();
  });

  it("does not fail the registration when PointsService throws", async () => {
    const prisma = makePrismaMock(MOCK_ITEM_NO_EXPIRY);
    const points = makePointsMock();
    points.processConsumptionEvent.mockRejectedValue(new Error("gamification down"));
    const svc = makeService(prisma, points);

    const result = await svc.registerEvent("user-1", "item-1", {
      type: PantryConsumptionEventType.CONSUMED,
    });

    expect(result.id).toBe("evt-1");
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

  it("preserves itemExpirationDate in the event when the item has an expiration date", async () => {
    const expiry = new Date("2026-07-01T00:00:00.000Z");
    const item = { ...MOCK_ITEM_NO_EXPIRY, expirationDate: expiry };
    const prisma = makePrismaMock(item);
    const svc = makeService(prisma);

    await svc.registerEvent("user-1", "item-1", { type: PantryConsumptionEventType.CONSUMED });

    expect(prisma.consumptionEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ itemExpirationDate: expiry }),
      }),
    );
  });

  it("preserves itemPricePaid in the event when the item has a price", async () => {
    const item = { ...MOCK_ITEM_NO_EXPIRY, pricePaid: new Decimal("3.50") };
    const prisma = makePrismaMock(item);
    const svc = makeService(prisma);

    await svc.registerEvent("user-1", "item-1", { type: PantryConsumptionEventType.CONSUMED });

    expect(prisma.consumptionEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ itemPricePaid: new Decimal("3.50") }),
      }),
    );
  });

  it("does not set itemExpirationDate when item has no expiration date", async () => {
    const prisma = makePrismaMock(MOCK_ITEM_NO_EXPIRY);
    const svc = makeService(prisma);

    await svc.registerEvent("user-1", "item-1", { type: PantryConsumptionEventType.CONSUMED });

    const call = prisma.consumptionEvent.create.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(call.data).not.toHaveProperty("itemExpirationDate");
  });

  it("preserves itemNotes in the event when the item has notes", async () => {
    const item = { ...MOCK_ITEM_NO_EXPIRY, notes: "organic brand" };
    const prisma = makePrismaMock(item as any);
    const svc = makeService(prisma);

    await svc.registerEvent("user-1", "item-1", { type: PantryConsumptionEventType.CONSUMED });

    expect(prisma.consumptionEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ itemNotes: "organic brand" }),
      }),
    );
  });

  it("does not set itemNotes when item has no notes", async () => {
    const prisma = makePrismaMock(MOCK_ITEM_NO_EXPIRY);
    const svc = makeService(prisma);

    await svc.registerEvent("user-1", "item-1", { type: PantryConsumptionEventType.CONSUMED });

    const call = prisma.consumptionEvent.create.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(call.data).not.toHaveProperty("itemNotes");
  });
});

// ── PantryService.reAddEvent ──────────────────────────────────────────────────

const MOCK_EVENT = {
  id: "evt-1",
  pantryItemId: "item-old",
  userId: "user-1",
  type: "CONSUMED" as const,
  quantity: 2,
  itemName: "Greek Yogurt",
  itemUnit: "unit",
  itemExpirationDate: null as Date | null,
  itemPricePaid: null as Decimal | null,
  itemNotes: null as string | null,
  estimatedValueEur: null as Decimal | null,
  occurredAt: new Date(),
  createdAt: new Date(),
};

function makeReAddPrismaMock(event: typeof MOCK_EVENT | null = MOCK_EVENT) {
  const createdItem = { id: "item-new", name: event?.itemName ?? "Unknown item" };
  return {
    pantryItem: {
      create: jest.fn().mockReturnValue("CREATE_OP"),
    },
    consumptionEvent: {
      findUnique: jest.fn().mockResolvedValue(event),
      delete: jest.fn().mockReturnValue("DELETE_OP"),
    },
    householdMember: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    $transaction: jest.fn().mockResolvedValue([createdItem, { id: event?.id }]),
  } as any;
}

describe("PantryService.reAddEvent", () => {
  it("recreates the pantry item and deletes the event in one transaction", async () => {
    const prisma = makeReAddPrismaMock();
    const svc = makeService(prisma);

    const result = await svc.reAddEvent("user-1", "evt-1");

    expect(result.id).toBe("item-new");
    expect(prisma.pantryItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          name: "Greek Yogurt",
          quantity: 2,
          unit: "unit",
        }),
      }),
    );
    expect(prisma.consumptionEvent.delete).toHaveBeenCalledWith({ where: { id: "evt-1" } });
    expect(prisma.$transaction).toHaveBeenCalledWith(["CREATE_OP", "DELETE_OP"]);
  });

  it("restores expirationDate, pricePaid and notes from the event", async () => {
    const expiry = new Date("2026-08-01T00:00:00.000Z");
    const event = {
      ...MOCK_EVENT,
      itemExpirationDate: expiry,
      itemPricePaid: new Decimal("3.49"),
      itemNotes: "organic brand",
    };
    const prisma = makeReAddPrismaMock(event);
    const svc = makeService(prisma);

    await svc.reAddEvent("user-1", "evt-1");

    expect(prisma.pantryItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          expirationDate: expiry,
          pricePaid: new Decimal("3.49"),
          notes: "organic brand",
        }),
      }),
    );
  });

  it("does not set optional fields when the event has none", async () => {
    const prisma = makeReAddPrismaMock(MOCK_EVENT);
    const svc = makeService(prisma);

    await svc.reAddEvent("user-1", "evt-1");

    const call = prisma.pantryItem.create.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(call.data).not.toHaveProperty("expirationDate");
    expect(call.data).not.toHaveProperty("pricePaid");
    expect(call.data).not.toHaveProperty("notes");
  });

  it("throws NotFoundException when the event does not exist", async () => {
    const prisma = makeReAddPrismaMock(null);
    const svc = makeService(prisma);

    await expect(svc.reAddEvent("user-1", "evt-x")).rejects.toThrow(NotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("throws NotFoundException when the event belongs to another user", async () => {
    const prisma = makeReAddPrismaMock({ ...MOCK_EVENT, userId: "user-other" });
    const svc = makeService(prisma);

    await expect(svc.reAddEvent("user-1", "evt-1")).rejects.toThrow(NotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

// ── PantryService.create notes ────────────────────────────────────────────────

describe("PantryService.create — notes field", () => {
  it("saves notes when provided", async () => {
    const prisma = makePrismaMock();
    prisma.pantryItem.create.mockResolvedValue({ id: "item-new", notes: "organic brand" } as any);
    const svc = makeService(prisma);

    await svc.create("user-1", {
      name: "Olive Oil",
      quantity: 1,
      unit: "unit",
      notes: "organic brand",
    });

    expect(prisma.pantryItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ notes: "organic brand" }),
      }),
    );
  });

  it("does not set notes field when notes is not provided", async () => {
    const prisma = makePrismaMock();
    prisma.pantryItem.create.mockResolvedValue({ id: "item-new" } as any);
    const svc = makeService(prisma);

    await svc.create("user-1", { name: "Olive Oil", quantity: 1, unit: "unit" });

    const call = prisma.pantryItem.create.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(call.data).not.toHaveProperty("notes");
  });
});

// ── PantryService.update notes ────────────────────────────────────────────────

describe("PantryService.update — name field", () => {
  it("updates the trimmed name when provided", async () => {
    const prisma = makePrismaMock();
    prisma.pantryItem.findUnique.mockResolvedValue(MOCK_ITEM_NO_EXPIRY as any);
    prisma.pantryItem.update.mockResolvedValue({ ...MOCK_ITEM_NO_EXPIRY, name: "Oat Milk" } as any);
    const svc = makeService(prisma);

    await svc.update("user-1", "item-1", { name: "  Oat Milk  " });

    expect(prisma.pantryItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Oat Milk" }),
      }),
    );
  });

  it("does not set the name field when name is not provided", async () => {
    const prisma = makePrismaMock();
    prisma.pantryItem.findUnique.mockResolvedValue(MOCK_ITEM_NO_EXPIRY as any);
    prisma.pantryItem.update.mockResolvedValue(MOCK_ITEM_NO_EXPIRY as any);
    const svc = makeService(prisma);

    await svc.update("user-1", "item-1", { quantity: 2 });

    const call = prisma.pantryItem.update.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(call.data).not.toHaveProperty("name");
  });
});

describe("PantryService.update — notes field", () => {
  it("updates notes when provided", async () => {
    const prisma = makePrismaMock();
    prisma.pantryItem.findUnique.mockResolvedValue(MOCK_ITEM_NO_EXPIRY as any);
    prisma.pantryItem.update.mockResolvedValue({ ...MOCK_ITEM_NO_EXPIRY, notes: "updated note" } as any);
    const svc = makeService(prisma);

    await svc.update("user-1", "item-1", { notes: "updated note" });

    expect(prisma.pantryItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ notes: "updated note" }),
      }),
    );
  });
});

// ── Auto-expiry: expired candidates + bulk waste/dismiss (US1) ────────────────

const NOW = new Date("2026-06-26T12:00:00.000Z");

function makeAutoExpiryPrisma(overrides: Record<string, unknown> = {}) {
  return {
    notificationPreference: { findUnique: jest.fn().mockResolvedValue(null) },
    pantryItem: {
      findMany: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue({}),
    },
    consumptionEvent: { create: jest.fn().mockResolvedValue({ id: "evt" }) },
    autoExpiryDigest: {
      findFirst: jest.fn().mockResolvedValue(null),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: "digest-new" }),
    },
    householdMember: { findFirst: jest.fn().mockResolvedValue(null) },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    ...overrides,
  } as any;
}

function makeAutoExpiryService(prisma: ReturnType<typeof makeAutoExpiryPrisma>) {
  const usersServiceMock = { findById: jest.fn().mockResolvedValue(MOCK_USER) } as any;
  return new PantryService(prisma, usersServiceMock, makePointsMock());
}

function makeExpiredItem(overrides: Partial<typeof MOCK_ITEM_NO_EXPIRY> = {}) {
  return {
    ...MOCK_ITEM_NO_EXPIRY,
    id: "item-old",
    name: "Old Yogurt",
    quantity: 2,
    pricePaid: new Decimal("4.00") as Decimal | null,
    expirationDate: new Date("2026-06-01T00:00:00.000Z"),
    notes: null as string | null,
    storageLocation: "Fridge",
    ...overrides,
  };
}

describe("PantryService.getExpiredCandidates", () => {
  it("uses the default 14-day threshold when no preference row exists", async () => {
    const prisma = makeAutoExpiryPrisma();
    const svc = makeAutoExpiryService(prisma);

    await svc.getExpiredCandidates("user-1", NOW);

    const where = prisma.pantryItem.findMany.mock.calls[0][0].where;
    expect(where.userId).toBe("user-1");
    expect(where.expirationDate.not).toBeNull();
    // 14 days before NOW
    expect(where.expirationDate.lt).toEqual(new Date("2026-06-12T12:00:00.000Z"));
  });

  it("honors a custom threshold from the preference row", async () => {
    const prisma = makeAutoExpiryPrisma({
      notificationPreference: { findUnique: jest.fn().mockResolvedValue({ autoExpiryThresholdDays: 30 }) },
    });
    const svc = makeAutoExpiryService(prisma);

    await svc.getExpiredCandidates("user-1", NOW);

    const where = prisma.pantryItem.findMany.mock.calls[0][0].where;
    expect(where.expirationDate.lt).toEqual(new Date("2026-05-27T12:00:00.000Z"));
  });

  it("maps items to candidates with daysExpired and estimatedValueEur", async () => {
    const prisma = makeAutoExpiryPrisma({
      pantryItem: {
        findMany: jest.fn().mockResolvedValue([makeExpiredItem()]),
        delete: jest.fn(),
      },
    });
    const svc = makeAutoExpiryService(prisma);

    const candidates = await svc.getExpiredCandidates("user-1", NOW);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toEqual({
      id: "item-old",
      name: "Old Yogurt",
      expirationDate: new Date("2026-06-01T00:00:00.000Z"),
      daysExpired: 25,
      estimatedValueEur: 4,
    });
  });
});

describe("PantryService.getExpiredCandidatesForUser", () => {
  it("suppresses candidates while a USER_RESOLVED digest is within the 7-day grace", async () => {
    const prisma = makeAutoExpiryPrisma({
      autoExpiryDigest: {
        findFirst: jest.fn().mockResolvedValue({ id: "d1", status: "USER_RESOLVED" }),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    });
    const svc = makeAutoExpiryService(prisma);

    const view = await svc.getExpiredCandidatesForUser("user-1", NOW);

    expect(view).toEqual({ items: [], digestId: null });
    expect(prisma.pantryItem.findMany).not.toHaveBeenCalled();
  });

  it("returns candidates and the pending digest id when not suppressed", async () => {
    const findFirst = jest
      .fn()
      .mockResolvedValueOnce(null) // dismiss-suppression lookup
      .mockResolvedValueOnce({ id: "pending-1", status: "PENDING" }); // pending lookup
    const prisma = makeAutoExpiryPrisma({
      pantryItem: { findMany: jest.fn().mockResolvedValue([makeExpiredItem()]), delete: jest.fn() },
      autoExpiryDigest: { findFirst, updateMany: jest.fn(), create: jest.fn() },
    });
    const svc = makeAutoExpiryService(prisma);

    const view = await svc.getExpiredCandidatesForUser("user-1", NOW);

    expect(view.items).toHaveLength(1);
    expect(view.digestId).toBe("pending-1");
  });
});

describe("PantryService.bulkWasteItems", () => {
  it("wastes every item with method=null in one transaction and resolves the pending digest", async () => {
    const prisma = makeAutoExpiryPrisma({
      pantryItem: {
        findMany: jest.fn().mockResolvedValue([
          makeExpiredItem({ id: "a" }),
          makeExpiredItem({ id: "b" }),
        ]),
        delete: jest.fn().mockResolvedValue({}),
      },
    });
    const svc = makeAutoExpiryService(prisma);

    const result = await svc.bulkWasteItems("user-1", ["a", "b"], NOW);

    expect(result.wastedCount).toBe(2);
    expect(result.events).toEqual([
      { id: "evt", itemId: "a" },
      { id: "evt", itemId: "b" },
    ]);
    expect(prisma.consumptionEvent.create).toHaveBeenCalledTimes(2);
    const firstEventData = prisma.consumptionEvent.create.mock.calls[0][0].data;
    expect(firstEventData.type).toBe("WASTED");
    expect(firstEventData.method).toBeUndefined();
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.autoExpiryDigest.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", status: "PENDING" },
      data: { status: "USER_RESOLVED", resolvedAt: NOW },
    });
  });

  it("throws and touches nothing when an itemId is foreign or missing", async () => {
    const prisma = makeAutoExpiryPrisma({
      pantryItem: {
        findMany: jest.fn().mockResolvedValue([makeExpiredItem({ id: "a" })]), // "b" missing
        delete: jest.fn(),
      },
    });
    const svc = makeAutoExpiryService(prisma);

    await expect(svc.bulkWasteItems("user-1", ["a", "b"], NOW)).rejects.toThrow(NotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.consumptionEvent.create).not.toHaveBeenCalled();
  });
});

describe("PantryService.bulkDismissExpired", () => {
  it("resolves the pending digest and leaves items untouched", async () => {
    const prisma = makeAutoExpiryPrisma({
      pantryItem: { findMany: jest.fn().mockResolvedValue([makeExpiredItem({ id: "a" })]), delete: jest.fn() },
    });
    const svc = makeAutoExpiryService(prisma);

    const result = await svc.bulkDismissExpired("user-1", ["a"], NOW);

    expect(result).toEqual({ dismissedCount: 1 });
    expect(prisma.autoExpiryDigest.updateMany).toHaveBeenCalled();
    expect(prisma.autoExpiryDigest.create).not.toHaveBeenCalled();
    expect(prisma.pantryItem.delete).not.toHaveBeenCalled();
  });

  it("creates a USER_RESOLVED digest when none is pending so the banner stays suppressed", async () => {
    const prisma = makeAutoExpiryPrisma({
      pantryItem: { findMany: jest.fn().mockResolvedValue([makeExpiredItem({ id: "a" })]), delete: jest.fn() },
      autoExpiryDigest: {
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({ id: "digest-new" }),
      },
    });
    const svc = makeAutoExpiryService(prisma);

    await svc.bulkDismissExpired("user-1", ["a"], NOW);

    expect(prisma.autoExpiryDigest.create).toHaveBeenCalledWith({
      data: { userId: "user-1", status: "USER_RESOLVED", resolvedAt: NOW },
    });
  });
});
