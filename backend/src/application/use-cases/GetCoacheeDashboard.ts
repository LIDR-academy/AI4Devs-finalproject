import type { Prisma, PrismaClient } from "@prisma/client";
import { CoacheeDashboardPolicy } from "../../domain/services/CoacheeDashboardPolicy.js";

export interface GetCoacheeDashboardParams {
  coacheeId: string;
  now: Date;
}

export type DashboardClassRow = Prisma.TrainingClassGetPayload<{
  include: {
    assignedCoach: true;
    level: true;
    enrollments: true;
    waitingLists: true;
  };
}>;

export type DashboardJoinableClassRow = DashboardClassRow & {
  level: NonNullable<DashboardClassRow["level"]>;
};

export interface GetCoacheeDashboardResult {
  nextClass: DashboardClassRow | null;
  joinableClasses: DashboardJoinableClassRow[];
  waitlistEligibleClasses: DashboardJoinableClassRow[];
  activeWaitingListCount: number;
  viewerLevelSortOrder: number | null;
}

const CLASS_INCLUDE = {
  assignedCoach: true,
  level: true,
  enrollments: true,
  waitingLists: true,
} satisfies Prisma.TrainingClassInclude;

export class GetCoacheeDashboard {
  private readonly policy: CoacheeDashboardPolicy;

  constructor(
    private readonly prisma: PrismaClient,
    policy?: CoacheeDashboardPolicy,
  ) {
    this.policy = policy ?? new CoacheeDashboardPolicy();
  }

  async execute(params: GetCoacheeDashboardParams): Promise<GetCoacheeDashboardResult> {
    const { coacheeId, now } = params;

    const viewer = await this.prisma.user.findUnique({
      where: { id: coacheeId },
      include: { level: true },
    });
    const viewerLevelSortOrder = viewer?.level?.sort_order ?? null;

    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { coachee_id: coacheeId },
      include: { class: { include: CLASS_INCLUDE } },
      orderBy: { class: { start_time: "asc" } },
    });
    const picked = this.policy.pickNextClass(enrollments, now);
    const nextClass = picked
      ? (enrollments.find((entry) => entry.class.id === picked.id)?.class ?? null)
      : null;

    const window = this.policy.joinableWindow(now);
    const candidates = await this.prisma.trainingClass.findMany({
      where: {
        class_type: "GROUP",
        status: "ACTIVE",
        start_time: { gte: window.start, lte: window.end },
      },
      include: CLASS_INCLUDE,
      orderBy: { start_time: "asc" },
    });
    const viewerContext = {
      viewerId: coacheeId,
      viewerLevelSortOrder,
    };
    const joinableClasses = this.policy.filterJoinable(
      candidates,
      viewerContext,
    ) as DashboardJoinableClassRow[];
    const waitlistEligibleClasses = (
      this.policy.filterWaitlistEligible(candidates, viewerContext) as DashboardJoinableClassRow[]
    ).sort((a, b) => a.start_time.getTime() - b.start_time.getTime());

    const waitingLists = await this.prisma.waitingList.findMany({
      where: { coachee_id: coacheeId },
      include: { class: { select: { status: true } } },
    });
    const activeWaitingListCount = this.policy.countActiveWaitingLists(waitingLists);

    return {
      nextClass,
      joinableClasses,
      waitlistEligibleClasses,
      activeWaitingListCount,
      viewerLevelSortOrder,
    };
  }
}
