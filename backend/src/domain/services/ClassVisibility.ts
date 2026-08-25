import { isWithinReach } from "./ReachCalculator.js";

export type ClassVisibilityValue = "blue" | "green" | "gray";

export interface VisibilityClassLike {
  class_type: "INDIVIDUAL" | "GROUP";
  level: { sort_order: number } | null;
  enrollments: Array<{ coachee_id: string }>;
}

export interface VisibilityViewerContext {
  viewerId: string;
  viewerLevelSortOrder: number | null;
}

export function classifyVisibility(
  cls: VisibilityClassLike,
  viewer: VisibilityViewerContext,
): ClassVisibilityValue {
  const isEnrolled = cls.enrollments.some(
    (enrollment) => enrollment.coachee_id === viewer.viewerId,
  );
  if (isEnrolled) {
    return "blue";
  }

  const hasOpenSpot = cls.enrollments.length < 4;
  const withinReach =
    cls.class_type === "GROUP" &&
    cls.level !== null &&
    viewer.viewerLevelSortOrder !== null &&
    isWithinReach(viewer.viewerLevelSortOrder, cls.level.sort_order);

  if (withinReach && hasOpenSpot) {
    return "green";
  }

  return "gray";
}
