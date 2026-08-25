import "temporal-polyfill/global";
import type { CalendarEventExternal } from "@schedule-x/calendar";
import type { Block } from "@/domain/types/block";
import { GYM_TIMEZONE } from "@/domain/utils/gymDateTime";

export function blockEventTitle(block: Block): string {
  return block.blockType === "GYM_WIDE" ? "Gym-wide block" : "Personal block";
}

export function toBlockCalendarEvent(block: Block): CalendarEventExternal {
  const start = Temporal.Instant.from(block.startTime);
  const end = Temporal.Instant.from(block.endTime);

  return {
    id: block.id,
    title: blockEventTitle(block),
    start: start.toZonedDateTimeISO(GYM_TIMEZONE),
    end: end.toZonedDateTimeISO(GYM_TIMEZONE),
    _options: { disableDND: true, disableResize: true },
    kind: "BLOCK",
    block,
  };
}

export type BlockCalendarEventShape = CalendarEventExternal & {
  kind: "BLOCK";
  block: Block;
};
