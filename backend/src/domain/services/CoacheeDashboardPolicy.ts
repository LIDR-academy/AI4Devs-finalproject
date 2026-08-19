import { GROUP_MAX_COACHEES } from "./CapacityValidator.js";
import { isWithinReach } from "./ReachCalculator.js";
import {
  addWallClockDays,
  GYM_TIMEZONE,
  zonedDateTimeToUtc,
  zonedWallClockParts,
} from "./TimeZoneMath.js";

export type PolicyClassStatus = "ACTIVE" | "CANCELED";
export type PolicyClassType = "GROUP" | "INDIVIDUAL";

export interface PolicyClass {
  id: string;
  class_type: PolicyClassType;
  status: PolicyClassStatus;
  start_time: Date;
  level: { sort_order: number } | null;
  enrollments: Array<{ coachee_id: string }>;
}

export interface PolicyEnrolledClass {
  class: PolicyClass;
}

export interface PolicyWaitingListEntry {
  class: { status: PolicyClassStatus };
}

export interface PolicyViewerContext {
  viewerId: string;
  viewerLevelSortOrder: number | null;
}

export interface JoinableWindow {
  start: Date;
  end: Date;
}

export const JOINABLE_WINDOW_DAYS = 10;

export class CoacheeDashboardPolicy {
  pickNextClass(enrolled: PolicyEnrolledClass[], now: Date): PolicyClass | null {
    const future = enrolled.filter(
      (entry) => entry.class.status === "ACTIVE" && entry.class.start_time >= now,
    );
    if (future.length === 0) {
      return null;
    }
    future.sort((a, b) => a.class.start_time.getTime() - b.class.start_time.getTime());
    return future[0].class;
  }

  isJoinable(cls: PolicyClass, viewer: PolicyViewerContext): boolean {
    if (cls.class_type !== "GROUP") {
      return false;
    }
    if (cls.status !== "ACTIVE") {
      return false;
    }
    if (cls.enrollments.some((enrollment) => enrollment.coachee_id === viewer.viewerId)) {
      return false;
    }
    if (viewer.viewerLevelSortOrder === null) {
      return false;
    }
    if (cls.level === null) {
      return false;
    }
    if (!isWithinReach(viewer.viewerLevelSortOrder, cls.level.sort_order)) {
      return false;
    }
    return cls.enrollments.length < GROUP_MAX_COACHEES;
  }

  filterJoinable<T extends PolicyClass>(classes: T[], viewer: PolicyViewerContext): T[] {
    return classes.filter((cls) => this.isJoinable(cls, viewer));
  }

  countActiveWaitingLists(entries: PolicyWaitingListEntry[]): number {
    return entries.filter((entry) => entry.class.status === "ACTIVE").length;
  }

  joinableWindow(now: Date): JoinableWindow {
    const { date } = zonedWallClockParts(now, GYM_TIMEZONE);
    const start = zonedDateTimeToUtc(date, "00:00", GYM_TIMEZONE);
    const end = addWallClockDays(start, JOINABLE_WINDOW_DAYS, GYM_TIMEZONE);
    return { start, end };
  }
}
