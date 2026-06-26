import { ForbiddenException } from "@nestjs/common";
import { Decimal } from "@prisma/client/runtime/library";
import { InsightsService } from "./insights.service";
import type { MercadonaService, MercadonaProduct } from "../../integrations/mercadona/mercadona.service";

describe("InsightsService", () => {
  const user = { id: "user-1", email: "user@example.com" };

  function makeMercadonaMock(result: MercadonaProduct | null = null) {
    return { searchProduct: jest.fn().mockResolvedValue(result) } as unknown as MercadonaService;
  }

  function createService(mercadonaMock?: MercadonaService) {
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
      service: new InsightsService(prismaMock, usersServiceMock, mercadonaMock ?? makeMercadonaMock()),
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

  // ── T007/US1: Mercadona found path ───────────────────────────────────────

  describe("getPriceComparison — Mercadona found (US1)", () => {
    const mercadonaProduct: MercadonaProduct = {
      productName: "Leche entera Hacendado",
      priceEur: "0.72",
      unit: "l",
      fetchedAt: new Date("2026-06-26T10:00:00.000Z"),
      source: "MERCADONA_LIVE",
    };

    it("includes mercadona.found: true when MercadonaService returns a product", async () => {
      const { service } = createService(makeMercadonaMock(mercadonaProduct));
      const result = await service.getPriceComparison(user.id, "leche");
      expect(result.mercadona.found).toBe(true);
    });

    it("populates mercadona fields from the returned product", async () => {
      const { service } = createService(makeMercadonaMock(mercadonaProduct));
      const result = await service.getPriceComparison(user.id, "leche");
      expect(result.mercadona.productName).toBe("Leche entera Hacendado");
      expect(result.mercadona.priceEur).toBe("0.72");
      expect(result.mercadona.unit).toBe("l");
      expect(result.mercadona.lastUpdatedAt).toBe("2026-06-26T10:00:00.000Z");
      expect(result.mercadona.source).toBe("MERCADONA_LIVE");
    });

    it("sets top-level found: true when Mercadona has a result", async () => {
      const { service } = createService(makeMercadonaMock(mercadonaProduct));
      const result = await service.getPriceComparison(user.id, "leche");
      expect(result.found).toBe(true);
    });

    it("computes delta as (latestUnitPriceEur - mercadona.priceEur) when both available", async () => {
      const prismaMock = {
        priceCatalogItem: { findFirst: jest.fn().mockResolvedValue(null) },
        receiptItem: {
          findMany: jest.fn().mockResolvedValue([
            { rawName: "leche", unitPriceEur: new Decimal("0.89"), createdAt: new Date() },
          ]),
        },
      } as any;
      const usersServiceMock = {
        findById: jest.fn().mockResolvedValue(user),
      } as any;
      const service = new InsightsService(prismaMock, usersServiceMock, makeMercadonaMock(mercadonaProduct));
      const result = await service.getPriceComparison(user.id, "leche");
      expect(result.delta).toBe("0.17");
    });

    it("sets delta: null when receiptContext.latestUnitPriceEur is null", async () => {
      const { service } = createService(makeMercadonaMock(mercadonaProduct));
      const result = await service.getPriceComparison(user.id, "leche");
      expect(result.delta).toBeNull();
    });
  });

  // ── T014/US2: Fallback path ──────────────────────────────────────────────

  describe("getPriceComparison — Mercadona not found / fallback (US2)", () => {
    it("sets mercadona.found: false when MercadonaService returns null", async () => {
      const { service } = createService(makeMercadonaMock(null));
      const result = await service.getPriceComparison(user.id, "Unknown Product");
      expect(result.mercadona.found).toBe(false);
    });

    it("keeps static catalog result when Mercadona returns null", async () => {
      const { service } = createService(makeMercadonaMock(null));
      const result = await service.getPriceComparison(user.id, "Whole Milk");
      expect(result.found).toBe(true);
      expect(result.reference).not.toBeNull();
    });

    it("sets unavailableReason: NO_REFERENCE_DATA only when BOTH sources have nothing", async () => {
      const { service } = createService(makeMercadonaMock(null));
      const result = await service.getPriceComparison(user.id, "Unknown Product");
      expect(result.found).toBe(false);
      expect(result.unavailableReason).toBe("NO_REFERENCE_DATA");
    });

    it("sets mercadona null fields to null when not found", async () => {
      const { service } = createService(makeMercadonaMock(null));
      const result = await service.getPriceComparison(user.id, "leche");
      expect(result.mercadona.productName).toBeNull();
      expect(result.mercadona.priceEur).toBeNull();
      expect(result.mercadona.unit).toBeNull();
      expect(result.mercadona.lastUpdatedAt).toBeNull();
      expect(result.mercadona.source).toBeNull();
    });
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

    const mercadonaMock = { searchProduct: jest.fn().mockResolvedValue(null) } as unknown as MercadonaService;

    return new InsightsService(prismaMock, usersServiceMock, mercadonaMock);
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
