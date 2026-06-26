import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { UsersService } from "../users/users.service";

export interface WasteMetricsResponse {
  totalWastedQuantity: number;
  totalWastedValueEur: string;
  eventCount: number;
}

@Injectable()
export class InsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

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
