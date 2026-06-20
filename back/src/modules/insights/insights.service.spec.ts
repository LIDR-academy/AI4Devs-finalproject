import { ForbiddenException } from "@nestjs/common";
import { Decimal } from "@prisma/client/runtime/library";
import { InsightsService } from "./insights.service";

describe("InsightsService", () => {
  const user = { id: "user-1", email: "user@example.com" };

  function createService() {
    const catalogRows = [
      {
        id: "old",
        normalizedName: "whole milk",
        category: "Dairy",
        sourceLabel: "Catalog v1",
        referencePriceEur: new Decimal("1.49"),
        currencyCode: "EUR",
        effectiveDate: new Date("2026-06-01T00:00:00.000Z"),
        createdAt: new Date("2026-06-01T00:00:00.000Z"),
      },
      {
        id: "latest",
        normalizedName: "whole milk",
        category: "Dairy",
        sourceLabel: "Catalog v2",
        referencePriceEur: new Decimal("1.69"),
        currencyCode: "EUR",
        effectiveDate: new Date("2026-06-10T00:00:00.000Z"),
        createdAt: new Date("2026-06-10T00:00:00.000Z"),
      },
    ];

    const prismaMock = {
      priceCatalogItem: {
        findFirst: jest.fn(async ({ where }: any) => {
          return (
            catalogRows
              .filter((row) => row.normalizedName === where.normalizedName)
              .sort(
                (a, b) =>
                  b.effectiveDate.getTime() - a.effectiveDate.getTime() ||
                  b.createdAt.getTime() - a.createdAt.getTime(),
              )[0] ?? null
          );
        }),
      },
      receiptItem: {
        findMany: jest.fn(async () => []),
      },
    } as any;

    const usersServiceMock = {
      findById: jest.fn(async (id: string) => (id === user.id ? user : null)),
    } as any;

    return {
      service: new InsightsService(prismaMock, usersServiceMock),
    };
  }

  it("selects latest effective-date match", async () => {
    const { service } = createService();

    const result = await service.getPriceComparison(user.id, "Whole Milk");

    expect(result.found).toBe(true);
    expect(result.reference?.referencePriceEur).toBe("1.69");
    expect(result.reference?.sourceLabel).toBe("Catalog v2");
  });

  it("returns fallback when no match exists", async () => {
    const { service } = createService();

    const result = await service.getPriceComparison(user.id, "Unknown Product");

    expect(result.found).toBe(false);
    expect(result.reference).toBeNull();
    expect(result.unavailableReason).toBe("NO_REFERENCE_DATA");
  });
});

describe("InsightsService — getWasteMetrics", () => {
  const user = { id: "user-1", email: "user@example.com" };

  function makeService(aggResult: {
    _sum: { quantity: number | null; estimatedValueEur: Decimal | null };
    _count: { id: number };
  }) {
    const prismaMock = {
      priceCatalogItem: { findFirst: jest.fn() },
      receiptItem: { findMany: jest.fn() },
      consumptionEvent: {
        aggregate: jest.fn().mockResolvedValue(aggResult),
      },
    } as any;

    const usersServiceMock = {
      findById: jest.fn(async (id: string) => (id === user.id ? user : null)),
    } as any;

    return new InsightsService(prismaMock, usersServiceMock);
  }

  it("returns zero metrics when no waste events exist", async () => {
    const service = makeService({
      _sum: { quantity: null, estimatedValueEur: null },
      _count: { id: 0 },
    });

    const result = await service.getWasteMetrics(user.id);

    expect(result.totalWastedQuantity).toBe(0);
    expect(result.totalWastedValueEur).toBe("0.00");
    expect(result.eventCount).toBe(0);
  });

  it("aggregates quantity and value across waste events", async () => {
    const service = makeService({
      _sum: { quantity: 5, estimatedValueEur: new Decimal("12.50") },
      _count: { id: 3 },
    });

    const result = await service.getWasteMetrics(user.id);

    expect(result.totalWastedQuantity).toBe(5);
    expect(result.totalWastedValueEur).toBe("12.50");
    expect(result.eventCount).toBe(3);
  });

  it("handles events with no estimated value (null pricePaid)", async () => {
    const service = makeService({
      _sum: { quantity: 2, estimatedValueEur: null },
      _count: { id: 2 },
    });

    const result = await service.getWasteMetrics(user.id);

    expect(result.totalWastedQuantity).toBe(2);
    expect(result.totalWastedValueEur).toBe("0.00");
    expect(result.eventCount).toBe(2);
  });

  it("throws ForbiddenException for unknown user", async () => {
    const service = makeService({
      _sum: { quantity: null, estimatedValueEur: null },
      _count: { id: 0 },
    });

    await expect(service.getWasteMetrics("unknown-user")).rejects.toThrow(ForbiddenException);
  });
});
