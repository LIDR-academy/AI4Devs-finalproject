import { ForbiddenException } from "@nestjs/common";
import { Decimal } from "@prisma/client/runtime/library";
import { InsightsService } from "./insights.service";

describe("InsightsService — getWasteMetrics", () => {
  const user = { id: "user-1", email: "user@example.com" };

  function makeService(aggResult: {
    _sum: { quantity: number | null; estimatedValueEur: Decimal | null };
    _count: { id: number };
  }) {
    const prismaMock = {
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
