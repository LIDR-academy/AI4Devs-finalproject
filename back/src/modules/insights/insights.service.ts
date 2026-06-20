import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { UsersService } from "../users/users.service";
import { normalizePriceComparisonName } from "./price-comparison-normalizer";

export interface WasteMetricsResponse {
  totalWastedQuantity: number;
  totalWastedValueEur: string;
  eventCount: number;
}

export interface PriceComparisonReference {
  normalizedName: string;
  category: string | null;
  sourceLabel: string | null;
  referencePriceEur: string;
  currencyCode: string;
  effectiveDate: string;
}

export interface PriceComparisonReceiptContext {
  latestUnitPriceEur: string | null;
  latestObservedAt: string | null;
}

export interface PriceComparisonResponse {
  normalizedName: string;
  found: boolean;
  reference: PriceComparisonReference | null;
  receiptContext: PriceComparisonReceiptContext;
  unavailableReason: "NO_REFERENCE_DATA" | null;
}

@Injectable()
export class InsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getPriceComparison(
    userId: string,
    inputNormalizedName: string,
  ): Promise<PriceComparisonResponse> {
    await this.assertUserCanAccessInsights(userId);

    const normalizedName = normalizePriceComparisonName(inputNormalizedName);
    const reference = await this.prisma.priceCatalogItem.findFirst({
      where: { normalizedName },
      orderBy: [{ effectiveDate: "desc" }, { createdAt: "desc" }],
    });

    const latestMatchingReceiptItem = await this.findLatestMatchingReceiptItem(
      userId,
      normalizedName,
    );

    if (!reference) {
      return {
        normalizedName,
        found: false,
        reference: null,
        receiptContext: {
          latestUnitPriceEur: latestMatchingReceiptItem?.unitPriceEur?.toString() ?? null,
          latestObservedAt: latestMatchingReceiptItem?.createdAt.toISOString() ?? null,
        },
        unavailableReason: "NO_REFERENCE_DATA",
      };
    }

    return {
      normalizedName,
      found: true,
      reference: {
        normalizedName: reference.normalizedName,
        category: reference.category,
        sourceLabel: reference.sourceLabel,
        referencePriceEur: reference.referencePriceEur.toString(),
        currencyCode: reference.currencyCode,
        effectiveDate: reference.effectiveDate.toISOString(),
      },
      receiptContext: {
        latestUnitPriceEur: latestMatchingReceiptItem?.unitPriceEur?.toString() ?? null,
        latestObservedAt: latestMatchingReceiptItem?.createdAt.toISOString() ?? null,
      },
      unavailableReason: null,
    };
  }

  private async findLatestMatchingReceiptItem(userId: string, normalizedName: string) {
    const receiptItems = await this.prisma.receiptItem.findMany({
      where: {
        receipt: {
          userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        rawName: true,
        unitPriceEur: true,
        createdAt: true,
      },
      take: 50,
    });

    return (
      receiptItems.find((item) => {
        if (!item.unitPriceEur) {
          return false;
        }

        return normalizePriceComparisonName(item.rawName) === normalizedName;
      }) ?? null
    );
  }

  async getWasteMetrics(userId: string): Promise<WasteMetricsResponse> {
    await this.assertUserCanAccessInsights(userId);

    const agg = await this.prisma.consumptionEvent.aggregate({
      where: { userId, type: "WASTED" },
      _sum: { quantity: true, estimatedValueEur: true },
      _count: { id: true },
    });

    return {
      totalWastedQuantity: agg._sum.quantity ?? 0,
      totalWastedValueEur: agg._sum.estimatedValueEur?.toFixed(2) ?? "0.00",
      eventCount: agg._count.id,
    };
  }

  private async assertUserCanAccessInsights(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException("No access to insights");
    }
  }
}
