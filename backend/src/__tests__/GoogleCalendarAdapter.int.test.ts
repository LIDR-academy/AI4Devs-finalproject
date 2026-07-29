import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { env, resolveCalendarId } from "../config/env.js";
import { GoogleCalendarAdapter } from "../infrastructure/adapters/calendar/GoogleCalendarAdapter.js";

const keyPath = env.GOOGLE_CALENDAR_SA_KEY_PATH
  ? resolve(process.cwd(), env.GOOGLE_CALENDAR_SA_KEY_PATH)
  : null;

const hasCredentials = !!(
  env.GOOGLE_CALENDAR_SA_EMAIL &&
  env.GOOGLE_CALENDAR_SA_KEY_PATH &&
  resolveCalendarId() &&
  keyPath &&
  existsSync(keyPath)
);

describe.runIf(hasCredentials)("GoogleCalendarAdapter Integration", () => {
  let adapter: GoogleCalendarAdapter;
  const testTimezone = "Europe/Madrid";

  beforeAll(() => {
    const calendarId = resolveCalendarId();
    if (!calendarId || !env.GOOGLE_CALENDAR_SA_EMAIL || !env.GOOGLE_CALENDAR_SA_KEY_PATH) {
      throw new Error("Missing Google Calendar credentials in env");
    }
    adapter = new GoogleCalendarAdapter(
      env.GOOGLE_CALENDAR_SA_EMAIL,
      env.GOOGLE_CALENDAR_SA_KEY_PATH,
      calendarId,
    );
  });

  it("should create, read, update, and delete a real calendar event", async () => {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 30);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const eventId = await adapter.createEvent({
      title: "GROUP - Beginner",
      startTime,
      endTime,
      timezone: testTimezone,
    });
    expect(eventId).toBeTruthy();
    expect(typeof eventId).toBe("string");

    await expect(
      adapter.updateEvent(eventId, {
        title: "INDIVIDUAL - Intermediate",
        startTime,
        endTime,
        timezone: testTimezone,
      }),
    ).resolves.toBeUndefined();

    await expect(adapter.deleteEvent(eventId)).resolves.toBeUndefined();
  }, 30000);

  it("should query free/busy for the system calendar", async () => {
    const result = await adapter.queryFreeBusy({
      timeMin: new Date("2026-01-01T00:00:00Z"),
      timeMax: new Date("2026-12-31T23:59:59Z"),
    });

    expect(result.queriedCalendar).toBeTruthy();
    expect(Array.isArray(result.busySlots)).toBe(true);
  }, 15000);
});
