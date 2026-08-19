import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import "temporal-polyfill/global";
import type { TrainingClass } from "@/domain/types/class";
import { extractErrorCode } from "@/domain/utils/apiError";
import { addDays, gymTodayDate } from "@/domain/utils/classCalendarEvents";
import { COACHEE_VISIBILITY_COLORS, coacheeEventTitle } from "@/domain/utils/coacheeCalendarEvents";
import { groupClassesByDay, isCoacheeRelevant, weekDays } from "@/domain/utils/coacheeWeekView";
import { enrollmentErrorMessage } from "@/domain/utils/enrollmentErrorMessages";
import { toGymIsoDateTime } from "@/domain/utils/gymDateTime";
import { formatNextClassTime } from "@/domain/utils/nextClassInfo";
import { useToast } from "@/infrastructure/context/ToastContext";
import { useCancelEnrollment } from "@/infrastructure/hooks/useCancelEnrollment";
import { useJoinClass } from "@/infrastructure/hooks/useJoinClass";
import { useListClasses } from "@/infrastructure/hooks/useListClasses";
import { usePullToRefresh } from "@/infrastructure/hooks/usePullToRefresh";
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
  const refetch = () => classesQuery.refetch();
  usePullToRefresh({ refetch });

  const days = weekDays(weekStart);
  const visible = (classesQuery.data?.data ?? []).filter(isCoacheeRelevant);
  const byDay = groupClassesByDay(visible, days);
  const today = gymTodayDate();
  const dayCards = byDay[selectedDay] ?? [];

  if (classesQuery.isLoading) {
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
              <ClassCard key={trainingClass.id} trainingClass={trainingClass} />
            ))}
          </div>
        )}
      </div>
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

function ClassCard({ trainingClass }: { trainingClass: TrainingClass }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const joinMutation = useJoinClass();
  const cancelMutation = useCancelEnrollment();

  const isCanceled = trainingClass.status === "CANCELED";
  const joinable = trainingClass.visibility === "green";
  const enrolled = trainingClass.visibility === "blue";
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["classes"] });
    queryClient.invalidateQueries({ queryKey: ["coachee", "dashboard"] });
  };

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync(trainingClass.id);
      showToast("You joined the class.", "success");
      refresh();
    } catch (error: unknown) {
      showToast(enrollmentErrorMessage(extractErrorCode(error)), "error");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(trainingClass.id);
      showToast("You left the class.", "success");
      refresh();
    } catch (error: unknown) {
      showToast(enrollmentErrorMessage(extractErrorCode(error)), "error");
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
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
      <div className="flex shrink-0 flex-col gap-2">
        {joinable && (
          <button
            type="button"
            onClick={handleJoin}
            disabled={joinMutation.isPending}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {joinMutation.isPending ? "Enrolling..." : "Enroll"}
          </button>
        )}
        {enrolled && !isCanceled && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelMutation.isPending ? "Leaving..." : "Cancel enrollment"}
          </button>
        )}
      </div>
    </div>
  );
}
