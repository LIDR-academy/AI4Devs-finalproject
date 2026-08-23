import type { CoacheeWaitlistEligibleClass } from "@/domain/types/coachee";
import { formatNextClassTime } from "@/domain/utils/nextClassInfo";

export function waitingListOpportunitiesEmptyCopy(): { title: string; description: string } {
  return {
    title: "No waiting lists to join right now",
    description:
      "Full group classes within your reach will appear here when their waiting list has space.",
  };
}

export function waitingListOpportunitySummary(entry: CoacheeWaitlistEligibleClass): string {
  return [
    "Group class",
    formatNextClassTime(entry.startTime),
    entry.level.name,
    entry.assignedCoach.name,
    `${entry.enrollmentCount}/${entry.capacity}`,
  ].join(" · ");
}
