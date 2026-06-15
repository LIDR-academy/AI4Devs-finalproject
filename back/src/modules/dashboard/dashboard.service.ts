import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { UsersService } from "../users/users.service";
import {
  compareUseNextCandidates,
  daysUntilExpiration,
  riskFromDays,
  type UseNextCandidate,
} from "./dashboard.ranking";

export interface DashboardSummary {
  activeItems: number;
  expiringSoonItems: number;
  generatedAt: string;
}

export interface UseNextItem {
  pantryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  pricePaid: string | null;
  expirationDate: string | null;
  daysUntilExpiration: number | null;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
}

export interface DashboardUseNextResponse {
  items: UseNextItem[];
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getSummary(userId: string): Promise<DashboardSummary> {
    await this.assertUserAccess(userId);

    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 3);

    const activeWhere = {
      userId,
      consumptionEvents: {
        none: {},
      },
    };

    const [activeItems, expiringSoonItems] = await Promise.all([
      this.prisma.pantryItem.count({ where: activeWhere }),
      this.prisma.pantryItem.count({
        where: {
          ...activeWhere,
          expirationDate: {
            gte: start,
            lte: end,
          },
        },
      }),
    ]);

    return {
      activeItems,
      expiringSoonItems,
      generatedAt: now.toISOString(),
    };
  }

  async getUseNext(userId: string): Promise<DashboardUseNextResponse> {
    await this.assertUserAccess(userId);

    const now = new Date();
    const activeItems = await this.prisma.pantryItem.findMany({
      where: {
        userId,
        consumptionEvents: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        unit: true,
        pricePaid: true,
        expirationDate: true,
        createdAt: true,
      },
    });

    const sorted = activeItems.sort((a, b) =>
      compareUseNextCandidates(a as UseNextCandidate, b as UseNextCandidate, now),
    );

    return {
      items: sorted.map((item) => {
        const days = item.expirationDate ? daysUntilExpiration(item.expirationDate, now) : null;

        return {
          pantryItemId: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          pricePaid: item.pricePaid ? item.pricePaid.toString() : null,
          expirationDate: item.expirationDate ? item.expirationDate.toISOString() : null,
          daysUntilExpiration: days,
          riskLevel: riskFromDays(days),
        };
      }),
    };
  }

  private async assertUserAccess(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException("No access to dashboard");
    }
  }
}
