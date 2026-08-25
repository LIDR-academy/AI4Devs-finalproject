import "temporal-polyfill/global";
import { useMemo } from "react";
import {
  CANCELED_CLASS_COLOR,
  CLASS_TYPE_COLORS,
  classEventTitle,
  gymTodayDate,
} from "@/domain/utils/classCalendarEvents";
import { GYM_TIMEZONE, toGymIsoDateTime } from "@/domain/utils/gymDateTime";
import { sortClassesByGymTime } from "@/domain/utils/todaySchedule";
import { useListClasses } from "@/infrastructure/hooks/useListClasses";

function startTimeLabel(isoInstant: string): string {
  const zdt = Temporal.Instant.from(isoInstant).toZonedDateTimeISO(GYM_TIMEZONE);
  return `${String(zdt.hour).padStart(2, "0")}:${String(zdt.minute).padStart(2, "0")}`;
}

export function TodayScheduleList() {
  const today = gymTodayDate();
  const start = toGymIsoDateTime(today, "00:00");
  const end = toGymIsoDateTime(today, "23:59");

  const classesQuery = useListClasses({ start, end, page: 1, limit: 100 });
  const classes = classesQuery.data?.data ?? [];

  const sorted = useMemo(() => sortClassesByGymTime(classes), [classes]);

  if (classesQuery.isError) {
    return <p className="text-sm text-red-600">Could not load today&apos;s schedule.</p>;
  }

  if (sorted.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
        No classes scheduled for today.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
      {sorted.map((cls) => {
        const canceled = cls.status === "CANCELED";
        const color = canceled ? CANCELED_CLASS_COLOR : CLASS_TYPE_COLORS[cls.classType];
        return (
          <div key={cls.id} className="flex items-center gap-4 px-4 py-3">
            <span
              className="h-10 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-gray-900">
              {startTimeLabel(cls.startTime)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{classEventTitle(cls)}</p>
              <p className="truncate text-xs text-gray-500">
                {cls.classType === "GROUP" ? "Group" : "Individual"} · {cls.assignedCoach.name}
              </p>
            </div>
            {canceled && (
              <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-600">
                Canceled
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
