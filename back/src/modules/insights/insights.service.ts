import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { UsersService } from "../users/users.service";
import { MercadonaService } from "../../integrations/mercadona/mercadona.service";
import { normalizePriceComparisonName } from "./price-comparison-normalizer";

export interface WasteMetricsResponse {
  totalWastedQuantity: number;
  totalWastedValueEur: string;
  eventCount: number;
}

export interface MercadonaResult {
  found: boolean;
  productName: string | null;
  priceEur: string | null;
  unit: string | null;
  lastUpdatedAt: string | null;
  source: "MERCADONA_LIVE" | "MERCADONA_CACHED" | null;
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
  mercadona: MercadonaResult;
  reference: PriceComparisonReference | null;
  receiptContext: PriceComparisonReceiptContext;
  delta: string | null;
  unavailableReason: "NO_REFERENCE_DATA" | null;
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly mercadonaService: MercadonaService,
  ) {}

  async getPriceComparison(
    userId: string,
    inputNormalizedName: string,
  ): Promise<PriceComparisonResponse> {
    await this.assertUserCanAccessInsights(userId);

    const normalizedName = normalizePriceComparisonName(inputNormalizedName);

    const [reference, latestReceiptItem, mercadonaProduct] = await Promise.all([
      this.prisma.priceCatalogItem.findFirst({
        where: { normalizedName },
        orderBy: [{ effectiveDate: "desc" }, { createdAt: "desc" }],
      }),
      this.findLatestMatchingReceiptItem(userId, normalizedName),
      this.mercadonaService.searchProduct(inputNormalizedName).catch((err: unknown) => {
        this.logger.warn(`MercadonaService.searchProduct threw unexpectedly: ${(err as Error).message}`);
        return null;
      }),
    ]);

    const receiptContext: PriceComparisonReceiptContext = {
      latestUnitPriceEur: latestReceiptItem?.unitPriceEur?.toString() ?? null,
      latestObservedAt: latestReceiptItem?.createdAt.toISOString() ?? null,
    };

    const mercadona: MercadonaResult = mercadonaProduct
      ? {
          found: true,
          productName: mercadonaProduct.productName,
          priceEur: mercadonaProduct.priceEur,
          unit: mercadonaProduct.unit,
          lastUpdatedAt: mercadonaProduct.fetchedAt.toISOString(),
          source: mercadonaProduct.source,
        }
      : {
          found: false,
          productName: null,
          priceEur: null,
          unit: null,
          lastUpdatedAt: null,
          source: null,
        };

    const delta = this.computeDelta(receiptContext.latestUnitPriceEur, mercadonaProduct?.priceEur ?? null);

    const found = mercadona.found || reference !== null;
    const unavailableReason = found ? null : "NO_REFERENCE_DATA";

    return {
      normalizedName,
      found,
      mercadona,
      reference: reference
        ? {
            normalizedName: reference.normalizedName,
            category: reference.category,
            sourceLabel: reference.sourceLabel,
            referencePriceEur: reference.referencePriceEur.toString(),
            currencyCode: reference.currencyCode,
            effectiveDate: reference.effectiveDate.toISOString(),
          }
        : null,
      receiptContext,
      delta,
      unavailableReason,
    };
  }

  private computeDelta(pricePaidStr: string | null, mercadonaStr: string | null): string | null {
    if (!pricePaidStr || !mercadonaStr) {
      return null;
    }
    const pricePaid = parseFloat(pricePaidStr);
    const mercadona = parseFloat(mercadonaStr);
    if (isNaN(pricePaid) || isNaN(mercadona)) {
      return null;
    }
    return (pricePaid - mercadona).toFixed(2);
  }

  private async findLatestMatchingReceiptItem(userId: string, normalizedName: string) {
    const receiptItems = await this.prisma.receiptItem.findMany({
      where: { receipt: { userId } },
      orderBy: { createdAt: "desc" },
      select: { rawName: true, unitPriceEur: true, createdAt: true },
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
