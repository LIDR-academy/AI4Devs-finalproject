import type { CoacheeNextClass } from "@/domain/types/coachee";
import { formatNextClassTime, hasNextClass } from "@/domain/utils/nextClassInfo";
import { EmptyState } from "@/ui/components/coachee/ViewState";

export function NextClassCard({ nextClass }: { nextClass: CoacheeNextClass | null }) {
  if (!hasNextClass(nextClass)) {
    return (
      <EmptyState title="No upcoming classes" description="Your next class will appear here." />
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Next Class</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {formatNextClassTime(nextClass.startTime)}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {nextClass.classType === "GROUP" ? "Group" : "Individual"}
        </span>
        <span>{nextClass.assignedCoach.name}</span>
        {nextClass.level && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: nextClass.level.color }}
            />
            {nextClass.level.name}
          </span>
        )}
      </div>
    </div>
  );
}
