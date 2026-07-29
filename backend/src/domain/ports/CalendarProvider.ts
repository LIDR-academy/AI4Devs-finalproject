export interface CalendarEventData {
  title: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  description?: string;
}

export interface FreeBusyQuery {
  timeMin: Date;
  timeMax: Date;
  calendarIds?: string[];
}

export interface FreeBusySlot {
  start: string;
  end: string;
}

export interface FreeBusyResult {
  busySlots: FreeBusySlot[];
  queriedCalendar: string;
}

export interface CalendarProvider {
  createEvent(data: CalendarEventData): Promise<string>;
  updateEvent(eventId: string, data: CalendarEventData): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
  queryFreeBusy(query: FreeBusyQuery): Promise<FreeBusyResult>;
}
