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
