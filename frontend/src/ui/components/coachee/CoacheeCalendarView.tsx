import { useMemo, useState } from "react";
import "temporal-polyfill/global";
import type { TrainingClass } from "@/domain/types/class";
import { addDays, gymTodayDate } from "@/domain/utils/classCalendarEvents";
import { COACHEE_VISIBILITY_COLORS, coacheeEventTitle } from "@/domain/utils/coacheeCalendarEvents";
import {
  groupClassesByDay,
  isCalendarClass,
  isOnWaitingListFor,
  weekDays,
} from "@/domain/utils/coacheeWeekView";
import { toGymIsoDateTime } from "@/domain/utils/gymDateTime";
import { formatNextClassTime } from "@/domain/utils/nextClassInfo";
import { useLevels } from "@/infrastructure/hooks/useLevels";
import { useListClasses } from "@/infrastructure/hooks/useListClasses";
import { useMe } from "@/infrastructure/hooks/useMe";
import { useMyWaitingLists } from "@/infrastructure/hooks/useMyWaitingLists";
import { usePullToRefresh } from "@/infrastructure/hooks/usePullToRefresh";
import { ClassInteractionModal } from "@/ui/components/coachee/ClassInteractionModal";
import { EmptyState, ErrorStateWithRetry, LoadingState } from "@/ui/components/coachee/ViewState";

const MAX_DOTS_PER_DAY = 3;

function dotColor(trainingClass: TrainingClass): string {
  if (trainingClass.status === "CANCELED") {
    return COACHEE_VISIBILITY_COLORS.gray;
  }
  return COACHEE_VISIBILITY_COLORS[trainingClass.visibility ?? "gray"];
}

function weekdayLabel(day: string): string {
  return Temporal.PlainDate.from(day).toLocaleString("en-GB", { weekday: "short" });
}

function dayNumber(day: string): string {
  return day.slice(8, 10);
}

export function CoacheeCalendarView({ week }: { week: { start: string; end: string } }) {
  const [weekStart, setWeekStart] = useState(week.start);
  const [selectedDay, setSelectedDay] = useState(() => gymTodayDate());
  const [selectedClass, setSelectedClass] = useState<TrainingClass | null>(null);

  const shiftWeek = (nextStart: string) => {
    const days = weekDays(nextStart);
    const today = gymTodayDate();
    setWeekStart(nextStart);
    setSelectedDay(days.includes(today) ? today : nextStart);
  };

  const start = toGymIsoDateTime(weekStart, "00:00");
  const end = toGymIsoDateTime(addDays(weekStart, 6), "23:59");

  const classesQuery = useListClasses({
    start,
    end,
    page: 1,
    limit: 100,
  });
  const meQuery = useMe();
  const levelsQuery = useLevels();
  const waitingListsQuery = useMyWaitingLists();
  const waitingLists = waitingListsQuery.data?.data ?? [];
  const coacheeLevelSortOrder = useMemo(() => {
    const meLevelId = meQuery.data?.level?.id;
    if (!meLevelId || !levelsQuery.data) {
      return null;
    }
    return levelsQuery.data.find((level) => level.id === meLevelId)?.sort_order ?? null;
  }, [meQuery.data, levelsQuery.data]);
  const refetch = () => classesQuery.refetch();
  usePullToRefresh({ refetch });

  const days = weekDays(weekStart);
  const visible = (classesQuery.data?.data ?? []).filter((trainingClass) =>
    isCalendarClass(trainingClass, coacheeLevelSortOrder),
  );
  const byDay = groupClassesByDay(visible, days);
  const today = gymTodayDate();
  const dayCards = byDay[selectedDay] ?? [];

  const isLoadingCalendar =
    classesQuery.isLoading ||
    meQuery.isLoading ||
    levelsQuery.isLoading ||
    waitingListsQuery.isLoading;

  if (isLoadingCalendar) {
    return (
      <>
        <CalendarToolbar weekStart={weekStart} onShift={shiftWeek} onRefresh={refetch} />
        <LoadingState label="Loading your calendar..." />
      </>
    );
  }

  if (classesQuery.isError) {
    return (
      <>
        <CalendarToolbar weekStart={weekStart} onShift={shiftWeek} onRefresh={refetch} />
        <ErrorStateWithRetry message="Could not load your calendar." onRetry={refetch} />
      </>
    );
  }

  if (visible.length === 0) {
    return (
      <>
        <CalendarToolbar weekStart={weekStart} onShift={shiftWeek} onRefresh={refetch} />
        <DayStrip
          days={days}
          byDay={byDay}
          today={today}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
        />
        <EmptyState
          title="Nothing scheduled this week"
          description="Classes you enroll in or can join will appear here."
        />
      </>
    );
  }

  return (
    <>
      <CalendarToolbar weekStart={weekStart} onShift={shiftWeek} onRefresh={refetch} />
      <DayStrip
        days={days}
        byDay={byDay}
        today={today}
        selectedDay={selectedDay}
        onSelect={setSelectedDay}
      />
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">{formatDayLabel(selectedDay)}</h3>
        {dayCards.length === 0 ? (
          <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-400">
            No classes on this day.
          </p>
        ) : (
          <div className="space-y-3">
            {dayCards.map((trainingClass) => (
              <ClassCard
                key={trainingClass.id}
                trainingClass={trainingClass}
                isOnWaitingList={isOnWaitingListFor(waitingLists, trainingClass.id)}
                onTap={() => setSelectedClass(trainingClass)}
              />
            ))}
          </div>
        )}
      </div>
      {selectedClass && (
        <ClassInteractionModal
          trainingClass={selectedClass}
          onClose={() => setSelectedClass(null)}
        />
      )}
    </>
  );
}

function CalendarToolbar({
  weekStart,
  onShift,
  onRefresh,
}: {
  weekStart: string;
  onShift: (next: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onShift(addDays(weekStart, -7))}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Previous week"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-gray-700">{formatWeekLabel(weekStart)}</span>
        <button
          type="button"
          onClick={() => onShift(addDays(weekStart, 7))}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          aria-label="Next week"
        >
          ›
        </button>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Refresh
      </button>
    </div>
  );
}

function formatWeekLabel(weekStart: string): string {
  const start = Temporal.PlainDate.from(weekStart);
  const end = start.add({ days: 6 });
  return `${start.toLocaleString("en-GB", { day: "numeric", month: "short" })} – ${end.toLocaleString("en-GB", { day: "numeric", month: "short" })}`;
}

function formatDayLabel(day: string): string {
  return Temporal.PlainDate.from(day).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function DayStrip({
  days,
  byDay,
  today,
  selectedDay,
  onSelect,
}: {
  days: string[];
  byDay: Record<string, TrainingClass[]>;
  today: string;
  selectedDay: string;
  onSelect: (day: string) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-1 rounded-xl border border-gray-200 bg-white p-2">
      {days.map((day) => {
        const dayClasses = byDay[day] ?? [];
        const isToday = day === today;
        const isSelected = day === selectedDay;
        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelect(day)}
            aria-pressed={isSelected}
            aria-label={Temporal.PlainDate.from(day).toLocaleString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            className={`flex flex-col items-center gap-1 rounded-lg py-1 transition-colors ${
              isSelected ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-gray-50"
            }`}
          >
            <span className="text-[10px] font-medium uppercase text-gray-500">
              {weekdayLabel(day)}
            </span>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                isToday ? "bg-blue-600 font-bold text-white" : "text-gray-800"
              }`}
            >
              {dayNumber(day)}
            </span>
            <div className="flex h-2 items-center gap-0.5">
              {dayClasses.slice(0, MAX_DOTS_PER_DAY).map((trainingClass) => (
                <span
                  key={trainingClass.id}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: dotColor(trainingClass) }}
                />
              ))}
              {dayClasses.length > MAX_DOTS_PER_DAY && (
                <span className="text-[9px] text-gray-400">
                  +{dayClasses.length - MAX_DOTS_PER_DAY}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ClassCard({
  trainingClass,
  isOnWaitingList,
  onTap,
}: {
  trainingClass: TrainingClass;
  isOnWaitingList: boolean;
  onTap: () => void;
}) {
  const isCanceled = trainingClass.status === "CANCELED";

  return (
    <button
      type="button"
      onClick={onTap}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor(trainingClass) }}
          />
          <p className="truncate font-medium text-gray-900">{coacheeEventTitle(trainingClass)}</p>
          {isCanceled && (
            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-700">
              Canceled
            </span>
          )}
          {isOnWaitingList && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
              Waitlist
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {formatNextClassTime(trainingClass.startTime)} · {trainingClass.assignedCoach.name}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">
          {trainingClass.classType === "GROUP" ? "Group" : "Individual"}
          {trainingClass.level ? ` · ${trainingClass.level.name}` : ""}
          {trainingClass.classType === "GROUP"
            ? ` · ${trainingClass.enrollmentCount}/${trainingClass.capacity}`
            : ""}
        </p>
      </div>
      <span className="shrink-0 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
        View
      </span>
    </button>
  );
}
