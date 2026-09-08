import type { CalendarEventExternal } from "@schedule-x/calendar";
import { createViewWeek } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import { useEffect, useState } from "react";
import "@schedule-x/theme-default/dist/index.css";
import "temporal-polyfill/global";
import type { Block } from "@/domain/types/block";
import type { ClassType } from "@/domain/types/class";
import { toBlockCalendarEvent } from "@/domain/utils/blockCalendarEvents";
import {
  CANCELED_CLASS_COLOR,
  currentGymWeekBounds,
  gymTodayDate,
  toClassCalendarEvent,
} from "@/domain/utils/classCalendarEvents";
import { GYM_TIMEZONE, toGymIsoDateTime } from "@/domain/utils/gymDateTime";
import { useAuth } from "@/infrastructure/context/AuthContext";
import { useAssignableCoaches } from "@/infrastructure/hooks/useAssignableCoaches";
import { useIsMobile } from "@/infrastructure/hooks/useIsMobile";
import { useListBlocks } from "@/infrastructure/hooks/useListBlocks";
import { useListClasses } from "@/infrastructure/hooks/useListClasses";
import { BlockDetailView } from "@/ui/components/BlockDetailView";
import { ClassDetailView } from "@/ui/components/ClassDetailView";
import { MobileDayView } from "@/ui/components/MobileDayView";

const viewWeek = createViewWeek();

function ClassEventBlock({ calendarEvent }: { calendarEvent: CalendarEventExternal }) {
  const typed = calendarEvent as CalendarEventWithKind;
  if (typed.kind === "BLOCK") {
    return (
      <div
        className="flex h-full w-full flex-col justify-center overflow-hidden rounded px-1"
        style={{
          backgroundColor: "#4b5563",
          color: "#fff",
        }}
      >
        <span className="truncate text-[11px] font-semibold leading-tight">
          {String(calendarEvent.title)}
        </span>
        <span className="truncate text-[10px] leading-tight opacity-90">Blocked</span>
      </div>
    );
  }
  const canceled = calendarEvent.status === "CANCELED";
  const isGroup = calendarEvent.classType === "GROUP";
  return (
    <div
      className="flex h-full w-full flex-col justify-center overflow-hidden rounded px-1"
      style={{
        backgroundColor: canceled ? CANCELED_CLASS_COLOR : (typed.cellColor ?? "#3b82f6"),
        color: "#fff",
      }}
    >
      {canceled && (
        <span className="truncate rounded bg-white/25 px-1 text-[9px] font-semibold uppercase leading-tight">
          Canceled
        </span>
      )}
      <span className="truncate text-[11px] font-semibold leading-tight">
        {String(calendarEvent.title)}
      </span>
      <span className="truncate text-[10px] leading-tight opacity-90">
        {isGroup ? "Group" : "Individual"} · {String(calendarEvent.coachName ?? "")}
      </span>
    </div>
  );
}

const customComponents = {
  timeGridEvent: ClassEventBlock,
};

type CalendarEventWithKind = CalendarEventExternal & {
  kind?: "CLASS" | "BLOCK";
  block?: Block;
  cellColor?: string;
};

function ClassCalendarDesktop() {
  const { user } = useAuth();
  const coachesQuery = useAssignableCoaches();
  const isAdmin = user?.role === "ADMIN";

  const week = currentGymWeekBounds();
  const [rangeStart, setRangeStart] = useState(week.start);
  const [rangeEnd, setRangeEnd] = useState(week.end);
  const [classType, setClassType] = useState<"ALL" | ClassType>("ALL");
  const [coachId, setCoachId] = useState("");
  const [detailTargetId, setDetailTargetId] = useState("");
  const [blockDetailTarget, setBlockDetailTarget] = useState<Block | null>(null);

  const start = toGymIsoDateTime(rangeStart, "00:00");
  const end = toGymIsoDateTime(rangeEnd, "23:59");

  const classesQuery = useListClasses({
    start,
    end,
    classType: classType === "ALL" ? undefined : classType,
    coachId: coachId || undefined,
    page: 1,
    limit: 100,
  });
  const classes = classesQuery.data?.data ?? [];

  const blocksQuery = useListBlocks({ start, end, page: 1, limit: 100 });
  const blocks = blocksQuery.data?.data ?? [];

  const eventsServicePlugin = useState(() => createEventsServicePlugin())[0];

  const calendar = useCalendarApp({
    views: [viewWeek],
    defaultView: viewWeek.name,
    timezone: GYM_TIMEZONE,
    dayBoundaries: { start: "06:00", end: "24:00" },
    selectedDate: Temporal.PlainDate.from(gymTodayDate()),
    events: [],
    plugins: [eventsServicePlugin],
    callbacks: {
      onRangeUpdate: ({ start, end: rangeEndDate }) => {
        setRangeStart(String(start.toPlainDate()));
        setRangeEnd(String(rangeEndDate.toPlainDate()));
      },
      onEventClick: (event) => {
        const typedEvent = event as CalendarEventWithKind;
        if (typedEvent.kind === "BLOCK") {
          setBlockDetailTarget(typedEvent.block ?? null);
        } else {
          setDetailTargetId(String(event.id));
        }
      },
    },
  });

  useEffect(() => {
    const events = [...classes.map(toClassCalendarEvent), ...blocks.map(toBlockCalendarEvent)];
    eventsServicePlugin.set(events);
  }, [classes, blocks, eventsServicePlugin]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="class-type">
            Type
          </label>
          <select
            id="class-type"
            value={classType}
            onChange={(e) => setClassType(e.target.value as "ALL" | ClassType)}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="ALL">All types</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="GROUP">Group</option>
          </select>
        </div>
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="coach-filter">
              Coach
            </label>
            <select
              id="coach-filter"
              value={coachId}
              onChange={(e) => setCoachId(e.target.value)}
              className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All coaches</option>
              {(coachesQuery.data ?? []).map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {classesQuery.isError && <p className="text-sm text-red-600">Could not load classes.</p>}

      {calendar && (
        <div className="rounded-lg border border-gray-200">
          <ScheduleXCalendar calendarApp={calendar} customComponents={customComponents} />
        </div>
      )}

      <ClassDetailView classId={detailTargetId} onClose={() => setDetailTargetId("")} />
      <BlockDetailView block={blockDetailTarget} onClose={() => setBlockDetailTarget(null)} />
    </div>
  );
}

export function ClassCalendar({ onAddClass }: { onAddClass?: () => void }) {
  const isMobile = useIsMobile();
  return isMobile ? <MobileDayView onAddClass={onAddClass} /> : <ClassCalendarDesktop />;
}
