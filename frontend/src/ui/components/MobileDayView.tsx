import { useState } from "react";
import "temporal-polyfill/global";
import type { TrainingClass } from "@/domain/types/class";
import {
  addDays,
  CANCELED_CLASS_COLOR,
  CLASS_TYPE_COLORS,
  classEventTitle,
  gymTodayDate,
  weekBoundsOf,
} from "@/domain/utils/classCalendarEvents";
import { GYM_TIMEZONE, toGymIsoDateTime } from "@/domain/utils/gymDateTime";
import { useListClasses } from "@/infrastructure/hooks/useListClasses";
import { ClassDetailView } from "@/ui/components/ClassDetailView";

const WINDOW_START_MIN = 6 * 60;
const WINDOW_END_MIN = 24 * 60;
const HOUR_PX = 48;
const HOURS = Array.from({ length: 24 - 6 }, (_, index) => 6 + index);

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: GYM_TIMEZONE,
  }).format(new Date(iso));
}

function formatLongDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

function weekdayShort(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

function dayNumber(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

function hourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function toGymMinutes(iso: string): number {
  const zoned = Temporal.Instant.from(iso).toZonedDateTimeISO(GYM_TIMEZONE);
  return zoned.hour * 60 + zoned.minute;
}

function totalHeight(): number {
  return HOURS.length * HOUR_PX;
}

function DayEvent({
  trainingClass,
  onClick,
}: {
  trainingClass: TrainingClass;
  onClick: () => void;
}) {
  const canceled = trainingClass.status === "CANCELED";
  const start = Math.max(toGymMinutes(trainingClass.startTime), WINDOW_START_MIN);
  const end = Math.min(start + trainingClass.durationMinutes, WINDOW_END_MIN);
  const top = ((start - WINDOW_START_MIN) / 60) * HOUR_PX;
  const height = Math.max(((end - start) / 60) * HOUR_PX, 18);
  const backgroundColor = canceled
    ? CANCELED_CLASS_COLOR
    : CLASS_TYPE_COLORS[trainingClass.classType];
  const subtitle = trainingClass.assignedCoach.name
    ? `${formatTime(trainingClass.startTime)} · ${trainingClass.assignedCoach.name}`
    : formatTime(trainingClass.startTime);
  const length = trainingClass.durationMinutes;
  const subtitleText = `${subtitle} · ${length} min`;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ top, height, backgroundColor }}
      className={`absolute left-0 right-0 mx-1 overflow-hidden rounded-md px-1.5 py-0.5 text-left text-white shadow-sm ${
        canceled ? "opacity-70" : ""
      }`}
    >
      {canceled && (
        <span className="block truncate rounded bg-white/25 px-1 text-[9px] font-semibold uppercase leading-tight">
          Canceled
        </span>
      )}
      <span className="block truncate text-[11px] font-semibold leading-tight">
        {classEventTitle(trainingClass)}
      </span>
      <span className="block truncate text-[10px] leading-tight opacity-90">{subtitleText}</span>
    </button>
  );
}

function layoutColumns(classes: TrainingClass[]) {
  const items = classes.map((trainingClass) => {
    const start = toGymMinutes(trainingClass.startTime);
    const end = start + trainingClass.durationMinutes;
    return { trainingClass, start, end };
  });
  return classes.map((trainingClass) => {
    const item = items.find((i) => i.trainingClass.id === trainingClass.id);
    if (!item) return { left: 0, width: 100 };
    const overlapping = items.filter((other) => other.start < item.end && item.start < other.end);
    const cols = Math.max(overlapping.length, 1);
    const col = overlapping.filter(
      (other) => other.start < item.start || (other.start === item.start && other.end > item.end),
    ).length;
    return { left: (col / cols) * 100, width: 100 / cols };
  });
}

export function MobileDayView({ onAddClass }: { onAddClass?: () => void }) {
  const [selectedDate, setSelectedDate] = useState(gymTodayDate());
  const [detailTargetId, setDetailTargetId] = useState("");

  const week = weekBoundsOf(selectedDate);
  const classesQuery = useListClasses({
    start: toGymIsoDateTime(selectedDate, "00:00"),
    end: toGymIsoDateTime(selectedDate, "23:59"),
    page: 1,
    limit: 100,
  });
  const classes = classesQuery.data?.data ?? [];
  const layouts = layoutColumns(classes);

  const selectedIsToday = selectedDate === gymTodayDate();
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(week.start, index));

  const nowMin = selectedIsToday
    ? (() => {
        const now = Temporal.Now.zonedDateTimeISO(GYM_TIMEZONE);
        return now.hour * 60 + now.minute;
      })()
    : -1;
  const showNowLine = nowMin >= WINDOW_START_MIN && nowMin <= WINDOW_END_MIN;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 pb-2 pt-1">
        <h1 className="text-xl font-bold text-gray-900">
          {selectedIsToday ? "Today" : formatLongDate(selectedDate)}
        </h1>
        {onAddClass && (
          <button
            type="button"
            aria-label="Add class"
            onClick={onAddClass}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </header>

      <div className="flex items-center gap-1 px-4 pb-3">
        <button
          type="button"
          aria-label="Previous week"
          onClick={() => setSelectedDate(addDays(week.start, -1))}
          className="h-8 w-8 shrink-0 rounded-full text-gray-500 hover:bg-gray-100"
        >
          ‹
        </button>
        <div className="flex flex-1 gap-1">
          {weekDays.map((date) => {
            const selected = date === selectedDate;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                aria-pressed={selected}
                className={`flex flex-1 flex-col items-center rounded-full px-0.5 py-1.5 ${
                  selected ? "bg-blue-700 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-[10px] uppercase">{weekdayShort(date)}</span>
                <span className="text-sm font-semibold">{dayNumber(date)}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Next week"
          onClick={() => setSelectedDate(addDays(week.end, 1))}
          className="h-8 w-8 shrink-0 rounded-full text-gray-500 hover:bg-gray-100"
        >
          ›
        </button>
      </div>

      <div className="px-4 pb-2 text-sm font-medium text-gray-500">
        {classesQuery.isLoading ? "Loading sessions…" : `${classes.length} session(s)`}
      </div>

      {classesQuery.isError && <p className="px-4 text-sm text-red-600">Could not load classes.</p>}

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="relative">
          <div className="flex">
            <div
              className="relative w-12 shrink-0"
              style={{ height: totalHeight() }}
              aria-hidden="true"
            >
              {HOURS.map((hour) => (
                <span
                  key={hour}
                  className="absolute right-2 -translate-y-1/2 text-[10px] text-gray-400 first:translate-y-0"
                  style={{ top: (hour - WINDOW_START_MIN / 60) * HOUR_PX }}
                >
                  {hourLabel(hour)}
                </span>
              ))}
            </div>
            <div className="relative flex-1" style={{ height: totalHeight() }}>
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: (hour - WINDOW_START_MIN / 60) * HOUR_PX }}
                  aria-hidden="true"
                />
              ))}
              <div
                className="absolute bottom-0 left-0 right-0 border-t border-gray-200"
                aria-hidden="true"
              />
              {classes.length === 0 && !classesQuery.isLoading && (
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-gray-400">
                  No sessions on this day.
                </p>
              )}
              {showNowLine && (
                <div
                  className="absolute left-0 right-0 z-10 border-t-2 border-red-500"
                  style={{ top: ((nowMin - WINDOW_START_MIN) / 60) * HOUR_PX }}
                  aria-hidden="true"
                />
              )}
              {classes.map((trainingClass, index) => {
                const layout = layouts[index];
                return (
                  <div
                    key={trainingClass.id}
                    className="absolute bottom-0 top-0"
                    style={{ left: `${layout.left}%`, width: `${layout.width}%` }}
                  >
                    <DayEvent
                      trainingClass={trainingClass}
                      onClick={() => setDetailTargetId(trainingClass.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ClassDetailView classId={detailTargetId} onClose={() => setDetailTargetId("")} />
    </div>
  );
}
