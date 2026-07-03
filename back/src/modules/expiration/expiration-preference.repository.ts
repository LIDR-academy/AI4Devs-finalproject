import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { UserCategoryExpiryPreference } from "@prisma/client";

const DELTA_WINDOW_SIZE = 5;
const PRISMA_NOT_FOUND_CODE = "P2025";

@Injectable()
export class ExpirationPreferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserAndCategory(
    userId: string,
    category: string,
  ): Promise<UserCategoryExpiryPreference | null> {
    return this.prisma.userCategoryExpiryPreference.findUnique({
      where: { userId_category: { userId, category } },
    });
  }

  findAllForUser(userId: string): Promise<UserCategoryExpiryPreference[]> {
    return this.prisma.userCategoryExpiryPreference.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  async upsertDelta(
    userId: string,
    category: string,
    delta: number,
  ): Promise<UserCategoryExpiryPreference> {
    const existing = await this.prisma.userCategoryExpiryPreference.findUnique({
      where: { userId_category: { userId, category } },
    });

    const previousDeltas = existing?.deltas ?? [];
    const updatedDeltas = [...previousDeltas, delta].slice(-DELTA_WINDOW_SIZE);
    const averageDelta = updatedDeltas.reduce((sum, d) => sum + d, 0) / updatedDeltas.length;
    const sampleCount = (existing?.sampleCount ?? 0) + 1;

    return this.prisma.userCategoryExpiryPreference.upsert({
      where: { userId_category: { userId, category } },
      create: { userId, category, deltas: updatedDeltas, averageDelta, sampleCount },
      update: { deltas: updatedDeltas, averageDelta, sampleCount },
    });
  }

  async deleteCategory(userId: string, category: string): Promise<void> {
    try {
      await this.prisma.userCategoryExpiryPreference.delete({
        where: { userId_category: { userId, category } },
      });
    } catch (error: unknown) {
      if ((error as { code?: string }).code !== PRISMA_NOT_FOUND_CODE) {
        throw error;
      }
    }
  }

  async deleteAll(userId: string): Promise<void> {
    await this.prisma.userCategoryExpiryPreference.deleteMany({
      where: { userId },
    });
  }
}
