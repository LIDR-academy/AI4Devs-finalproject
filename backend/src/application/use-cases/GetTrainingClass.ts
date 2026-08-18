import type { Prisma, PrismaClient, UserRole } from "@prisma/client";
import { isWithinReach } from "../../domain/services/ReachCalculator.js";
import { NotFoundError } from "../../infrastructure/errors.js";

export interface GetTrainingClassParams {
  id: string;
  viewerRole: UserRole;
  viewerId: string;
}

export interface GetTrainingClassResult {
  row: TrainingClassWithRelations;
  coacheeStatus?: {
    isEnrolled: boolean;
    isOnWaitingList: boolean;
    isWithinReach: boolean;
  };
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

export class GetTrainingClass {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(params: GetTrainingClassParams): Promise<GetTrainingClassResult> {
    const { id, viewerRole, viewerId } = params;

    const row = await this.prisma.trainingClass.findUnique({
      where: { id },
      include: CLASS_RELATIONS_INCLUDE,
    });
    if (!row) {
      throw new NotFoundError("Class not found.");
    }

    if (viewerRole !== "COACHEE") {
      return { row };
    }

    const isEnrolled = row.enrollments.some((enrollment) => enrollment.coachee_id === viewerId);
    const isOnWaitingList = row.waitingLists.some((entry) => entry.coachee_id === viewerId);
    const isWithinReachValue = await this.isWithinReachForViewer(row, viewerId);

    return {
      row,
      coacheeStatus: {
        isEnrolled,
        isOnWaitingList,
        isWithinReach: isWithinReachValue,
      },
    };
  }

  private async isWithinReachForViewer(
    row: TrainingClassWithRelations,
    viewerId: string,
  ): Promise<boolean> {
    if (row.class_type !== "GROUP" || !row.level) {
      return false;
    }
    const viewer = await this.prisma.user.findUnique({
      where: { id: viewerId },
      include: { level: true },
    });
    const viewerSortOrder = viewer?.level?.sort_order ?? null;
    if (viewerSortOrder === null) {
      return false;
    }
    return isWithinReach(viewerSortOrder, row.level.sort_order);
  }
}
