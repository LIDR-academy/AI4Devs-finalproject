import type { PrismaClient } from "@prisma/client";
import type { UserRecord, UserRepository } from "../../domain/ports/UserRepository.js";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true },
    });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      role: user.role,
    };
  }
}
