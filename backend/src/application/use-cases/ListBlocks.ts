import type { PrismaClient } from "@prisma/client";

export interface ListBlocksInput {
  start: Date;
  end: Date;
  blockType?: "PERSONAL" | "GYM_WIDE";
  page?: number;
  limit?: number;
}

export interface ListBlocksMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ListBlocks {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: ListBlocksInput) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    const where = {
      start_time: { lt: input.end },
      end_time: { gt: input.start },
      status: "ACTIVE" as const,
      ...(input.blockType ? { block_type: input.blockType } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.block.findMany({
        where,
        include: { createdBy: true, coach: true },
        orderBy: { start_time: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.block.count({ where }),
    ]);

    const meta: ListBlocksMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return { data: rows, meta };
  }
}
