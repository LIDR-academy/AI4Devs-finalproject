import type { ClassType, Prisma, PrismaClient, UserRole } from "@prisma/client";
import {
  type ClassVisibilityValue,
  classifyVisibility,
} from "../../domain/services/ClassVisibility.js";

export interface ListTrainingClassesParams {
  start: Date;
  end: Date;
  classType?: ClassType;
  coachId?: string;
  page: number;
  limit: number;
  viewerRole: UserRole;
  viewerId: string;
}

export interface PaginatedClasses<TRow> {
  data: Array<{ row: TRow; visibility?: ClassVisibilityValue }>;
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export type TrainingClassWithRelations = Prisma.TrainingClassGetPayload<{
  include: {
    assignedCoach: true;
    level: true;
    enrollments: { include: { coachee: true } };
    waitingLists: true;
  };
}>;

const CLASS_RELATIONS_INCLUDE = {
  assignedCoach: true,
  level: true,
  enrollments: { include: { coachee: true } },
  waitingLists: true,
} satisfies Prisma.TrainingClassInclude;

export class ListTrainingClasses {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(
    params: ListTrainingClassesParams,
  ): Promise<PaginatedClasses<TrainingClassWithRelations>> {
    const { start, end, classType, coachId, viewerRole, viewerId } = params;
    const page = Math.max(params.page, 1);
    const limit = Math.min(Math.max(params.limit, 1), 100);

    const where: Prisma.TrainingClassWhereInput = {
      start_time: { gte: start, lte: end },
      ...(classType ? { class_type: classType } : {}),
      ...(coachId ? { assigned_coach_id: coachId } : {}),
    };

    const [classes, total] = await Promise.all([
      this.prisma.trainingClass.findMany({
        where,
        include: CLASS_RELATIONS_INCLUDE,
        orderBy: { start_time: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.trainingClass.count({ where }),
    ]);

    const viewerLevel = await this.loadViewerLevel(viewerRole, viewerId);

    const data = classes.map((row) => {
      if (viewerRole !== "COACHEE") {
        return { row };
      }
      return {
        row,
        visibility: classifyVisibility(
          {
            class_type: row.class_type,
            level: row.level,
            enrollments: row.enrollments,
          },
          viewerLevel,
        ),
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async loadViewerLevel(
    viewerRole: UserRole,
    viewerId: string,
  ): Promise<{ viewerId: string; viewerLevelSortOrder: number | null }> {
    if (viewerRole !== "COACHEE") {
      return { viewerId, viewerLevelSortOrder: null };
    }
    const viewer = await this.prisma.user.findUnique({
      where: { id: viewerId },
      include: { level: true },
    });
    return { viewerId, viewerLevelSortOrder: viewer?.level?.sort_order ?? null };
  }
}
