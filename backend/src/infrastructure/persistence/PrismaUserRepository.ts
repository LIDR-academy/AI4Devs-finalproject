import type { PrismaClient } from "@prisma/client";
import type { UserRecord, UserRepository } from "../../domain/ports/UserRepository.js";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        level_id: true,
        level: { select: { sort_order: true } },
      },
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      levelId: user.level_id,
      levelSortOrder: user.level?.sort_order ?? null,
    };
  }

  async findActiveCoacheesByLevelReach(classSortOrder: number): Promise<UserRecord[]> {
    const users = await this.prisma.user.findMany({
      where: {
        role: "COACHEE",
        status: "ACTIVE",
        level: { sort_order: { gte: classSortOrder - 1, lte: classSortOrder + 1 } },
      },
      select: {
        id: true,
        name: true,
        role: true,
        level_id: true,
        level: { select: { sort_order: true } },
      },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      levelId: u.level_id,
      levelSortOrder: u.level?.sort_order ?? null,
    }));
  }
}
