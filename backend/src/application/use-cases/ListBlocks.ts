import type { PrismaClient } from "@prisma/client";

export class ListBlocks {
  constructor(private readonly prisma: PrismaClient) {}

  async execute() {
    return this.prisma.block.findMany({
      include: {
        coach: true,
      },
      orderBy: { start_time: "asc" },
    });
  }
}
