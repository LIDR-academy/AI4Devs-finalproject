import { PrismaClient } from "@prisma/client";
import type { DeviceTokenRepository } from "../../domain/ports/DeviceTokenRepository.js";

export class PrismaDeviceTokenRepository implements DeviceTokenRepository {
  private _prisma: PrismaClient | null = null;

  private get prisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = new PrismaClient();
    }
    return this._prisma;
  }

  async upsert(token: string, userId: string, platform: "WEB"): Promise<{ id: string }> {
    const record = await this.prisma.deviceToken.upsert({
      where: { token },
      create: { token, user_id: userId, platform },
      update: { user_id: userId, platform, is_active: true },
    });
    return { id: record.id };
  }

  async listActiveTokens(userId: string): Promise<string[]> {
    const rows = await this.prisma.deviceToken.findMany({
      where: { user_id: userId, is_active: true },
      select: { token: true },
    });
    return rows.map((r) => r.token);
  }

  async deactivate(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return;
    await this.prisma.deviceToken.updateMany({
      where: { token: { in: tokens } },
      data: { is_active: false },
    });
  }
}
