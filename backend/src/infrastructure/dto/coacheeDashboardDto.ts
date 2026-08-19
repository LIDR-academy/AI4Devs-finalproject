import type { ClassStatus, ClassType } from "@prisma/client";
import type {
  DashboardClassRow,
  DashboardJoinableClassRow,
  GetCoacheeDashboardResult,
} from "../../application/use-cases/GetCoacheeDashboard.js";
import { GROUP_MAX_COACHEES } from "../../domain/services/CapacityValidator.js";
import { isWithinReach } from "../../domain/services/ReachCalculator.js";

export interface AssignedCoachDTO {
  id: string;
  name: string;
}

export interface LevelRefDTO {
  id: string;
  name: string;
  color: string;
}

export interface NextClassDTO {
  id: string;
  classType: ClassType;
  startTime: string;
  assignedCoach: AssignedCoachDTO;
  level: LevelRefDTO | null;
  status: ClassStatus;
}

export interface JoinableClassDTO {
  id: string;
  classType: ClassType;
  startTime: string;
  level: LevelRefDTO;
  assignedCoach: AssignedCoachDTO;
  enrollmentCount: number;
  capacity: number;
  isWithinReach: boolean;
  hasOpenSpots: boolean;
}

export interface WaitlistEligibleClassDTO {
  id: string;
  classType: ClassType;
  startTime: string;
  level: LevelRefDTO;
  assignedCoach: AssignedCoachDTO;
  enrollmentCount: number;
  capacity: number;
  isWithinReach: boolean;
  isOnWaitingList: boolean;
}

export interface CoacheeDashboardDTO {
  nextClass: NextClassDTO | null;
  joinableClasses: JoinableClassDTO[];
  waitlistEligibleClasses: WaitlistEligibleClassDTO[];
  activeWaitingListCount: number;
}

function toNextClassDTO(row: DashboardClassRow): NextClassDTO {
  return {
    id: row.id,
    classType: row.class_type,
    startTime: row.start_time.toISOString(),
    assignedCoach: {
      id: row.assignedCoach.id,
      name: row.assignedCoach.name,
    },
    level: row.level ? { id: row.level.id, name: row.level.name, color: row.level.color } : null,
    status: row.status,
  };
}

export function toCoacheeDashboardDTO(result: GetCoacheeDashboardResult): CoacheeDashboardDTO {
  const viewerSort = result.viewerLevelSortOrder;
  const joinableClasses = result.joinableClasses.map((row: DashboardJoinableClassRow) => {
    const withinReach = viewerSort !== null && isWithinReach(viewerSort, row.level.sort_order);
    return {
      id: row.id,
      classType: row.class_type,
      startTime: row.start_time.toISOString(),
      level: { id: row.level.id, name: row.level.name, color: row.level.color },
      assignedCoach: {
        id: row.assignedCoach.id,
        name: row.assignedCoach.name,
      },
      enrollmentCount: row.enrollments.length,
      capacity: GROUP_MAX_COACHEES,
      isWithinReach: withinReach,
      hasOpenSpots: row.enrollments.length < GROUP_MAX_COACHEES,
    };
  });
  const waitlistEligibleClasses = result.waitlistEligibleClasses.map(
    (row: DashboardClassRow & { level: NonNullable<DashboardClassRow["level"]> }) => {
      const withinReach = viewerSort !== null && isWithinReach(viewerSort, row.level.sort_order);
      return {
        id: row.id,
        classType: row.class_type,
        startTime: row.start_time.toISOString(),
        level: { id: row.level.id, name: row.level.name, color: row.level.color },
        assignedCoach: {
          id: row.assignedCoach.id,
          name: row.assignedCoach.name,
        },
        enrollmentCount: row.enrollments.length,
        capacity: GROUP_MAX_COACHEES,
        isWithinReach: withinReach,
        isOnWaitingList: false,
      };
    },
  );
  return {
    nextClass: result.nextClass ? toNextClassDTO(result.nextClass) : null,
    joinableClasses,
    waitlistEligibleClasses,
    activeWaitingListCount: result.activeWaitingListCount,
  };
}
