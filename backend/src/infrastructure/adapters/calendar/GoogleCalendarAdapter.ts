import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { google } from "googleapis";
import type {
  CalendarEventData,
  CalendarProvider,
  FreeBusyQuery,
  FreeBusyResult,
} from "../../../domain/ports/CalendarProvider.js";
import { ServiceUnavailableError } from "../../errors.js";
import { logger } from "../../logger.js";
import type { CalendarHealthMonitor } from "./CalendarHealthMonitor.js";

export class GoogleCalendarAdapter implements CalendarProvider {
  private readonly calendar: ReturnType<typeof google.calendar>;
  private readonly calendarId: string;
  private healthMonitor?: CalendarHealthMonitor;

  constructor(
    _saEmail: string,
    keyPath: string,
    calendarId: string,
    healthMonitor?: CalendarHealthMonitor,
  ) {
    const resolvedKeyPath = resolve(process.cwd(), keyPath);
    if (!existsSync(resolvedKeyPath)) {
      throw new Error(`Service Account key file not found at: ${resolvedKeyPath}`);
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(readFileSync(resolvedKeyPath, "utf-8")),
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    this.calendar = google.calendar({ version: "v3", auth });
    this.calendarId = calendarId;
    this.healthMonitor = healthMonitor;
  }

  async createEvent(data: CalendarEventData): Promise<string> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: {
          summary: data.title,
          description: data.description,
          start: { dateTime: data.startTime.toISOString(), timeZone: data.timezone },
          end: { dateTime: data.endTime.toISOString(), timeZone: data.timezone },
        },
      });
      const eventId = response.data.id;
      if (!eventId) {
        throw new ServiceUnavailableError("Calendar service returned no event ID");
      }
      this.recordSuccess();
      return eventId;
    } catch (error) {
      this.recordFailure();
      throw this.wrapError(error);
    }
  }

  async updateEvent(eventId: string, data: CalendarEventData): Promise<void> {
    try {
      await this.calendar.events.patch({
        calendarId: this.calendarId,
        eventId,
        requestBody: {
          summary: data.title,
          description: data.description,
          start: { dateTime: data.startTime.toISOString(), timeZone: data.timezone },
          end: { dateTime: data.endTime.toISOString(), timeZone: data.timezone },
        },
      });
      this.recordSuccess();
    } catch (error) {
      this.recordFailure();
      throw this.wrapError(error);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
      });
      this.recordSuccess();
    } catch (error) {
      this.recordFailure();
      throw this.wrapError(error);
    }
  }

  async queryFreeBusy(query: FreeBusyQuery): Promise<FreeBusyResult> {
    const calendarIds = query.calendarIds ?? [this.calendarId];
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: query.timeMin.toISOString(),
          timeMax: query.timeMax.toISOString(),
          items: calendarIds.map((id) => ({ id })),
        },
      });
      const busySlots =
        response.data.calendars?.[calendarIds[0]]?.busy?.map((b) => ({
          start: b.start ?? "",
          end: b.end ?? "",
        })) ?? [];
      this.recordSuccess();
      return { busySlots, queriedCalendar: calendarIds[0] };
    } catch (error) {
      this.recordFailure();
      throw this.wrapError(error);
    }
  }

  private wrapError(error: unknown): ServiceUnavailableError {
    const message =
      error instanceof Error ? error.message : "Calendar service is currently unavailable";
    logger.error({ err: error }, `Google Calendar API error: ${message}`);
    return new ServiceUnavailableError("Calendar service is currently unavailable");
  }

  private recordSuccess(): void {
    this.healthMonitor?.recordCall(true);
  }

  private recordFailure(): void {
    this.healthMonitor?.recordCall(false);
  }
}
