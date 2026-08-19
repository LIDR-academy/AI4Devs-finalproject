import type { Prisma, PrismaClient } from "@prisma/client";
import { WaitingListPolicy } from "../../domain/services/WaitingListPolicy.js";

export interface ListWaitingListsInput {
  coacheeId: string;
  page: number;
  limit: number;
}

export interface WaitingListListItem {
  id: string;
  class: {
    id: string;
    classType: "INDIVIDUAL" | "GROUP";
    startTime: string;
    level: { name: string; color: string } | null;
    assignedCoach: { name: string };
  };
  joinedAt: string;
  hasOpenSpots: boolean;
}

export interface ListWaitingListsResult {
  data: WaitingListListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const WAITING_LIST_INCLUDE = {
  class: {
    include: {
      level: true,
      assignedCoach: true,
      enrollments: true,
    },
  },
} satisfies Prisma.WaitingListInclude;

export class ListWaitingLists {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly policy: WaitingListPolicy,
  ) {}

  async execute(input: ListWaitingListsInput): Promise<ListWaitingListsResult> {
    const where: Prisma.WaitingListWhereInput = {
      coachee_id: input.coacheeId,
      class: { status: "ACTIVE" },
    };

    const [rows, total] = await Promise.all([
      this.prisma.waitingList.findMany({
        where,
        include: WAITING_LIST_INCLUDE,
        orderBy: { joined_at: "asc" },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.waitingList.count({ where }),
    ]);

    const data = rows.map((row) => this.toListItem(row));

    return {
      data,
      meta: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  }

  private toListItem(
    row: Prisma.WaitingListGetPayload<{ include: typeof WAITING_LIST_INCLUDE }>,
  ): WaitingListListItem {
    const trainingClass = row.class;
    return {
      id: row.id,
      class: {
        id: trainingClass.id,
        classType: trainingClass.class_type,
        startTime: trainingClass.start_time.toISOString(),
        level: trainingClass.level
          ? { name: trainingClass.level.name, color: trainingClass.level.color }
          : null,
        assignedCoach: { name: trainingClass.assignedCoach.name },
      },
      joinedAt: row.joined_at.toISOString(),
      hasOpenSpots: this.policy.hasOpenSpots({
        classType: trainingClass.class_type,
        enrollmentCount: trainingClass.enrollments.length,
        capacity: trainingClass.class_type === "GROUP" ? WaitingListPolicy.GROUP_CAPACITY : 1,
      }),
    };
  }
}
