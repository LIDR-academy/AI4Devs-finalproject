import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleCalendarAdapter } from "../infrastructure/adapters/calendar/GoogleCalendarAdapter.js";
import { ServiceUnavailableError } from "../infrastructure/errors.js";

type MockCalendarFactory = () => {
  events: {
    insert: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  freebusy: { query: ReturnType<typeof vi.fn> };
};

vi.mock("googleapis", () => {
  const mockPatch = vi.fn().mockResolvedValue({ data: {} });
  const mockDelete = vi.fn().mockResolvedValue({ data: {} });
  const mockFreebusyQuery = vi.fn().mockResolvedValue({
    data: {
      calendars: {
        "test-calendar-id": {
          busy: [{ start: "2026-07-30T10:00:00Z", end: "2026-07-30T11:00:00Z" }],
        },
      },
    },
  });

  const mockInsert = vi.fn().mockResolvedValue({
    data: { id: "mock-event-id-123" },
  });

  const mockEvents = {
    insert: mockInsert,
    patch: mockPatch,
    delete: mockDelete,
  };

  return {
    google: {
      auth: {
        // biome-ignore lint/complexity/useArrowFunction: must be constructable for `new google.auth.GoogleAuth(...)`
        GoogleAuth: vi.fn().mockImplementation(function () {
          return {};
        }),
      },
      calendar: vi.fn().mockReturnValue({
        events: mockEvents,
        freebusy: { query: mockFreebusyQuery },
      }),
    },
  };
});

vi.mock("node:fs", () => ({
  readFileSync: vi.fn().mockReturnValue(JSON.stringify({ type: "service_account" })),
  existsSync: vi.fn().mockReturnValue(true),
}));

describe("GoogleCalendarAdapter", () => {
  let adapter: GoogleCalendarAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new GoogleCalendarAdapter(
      "test-sa@test.iam.gserviceaccount.com",
      "secrets/test-sa-key.json",
      "test-calendar-id",
    );
  });

  describe("createEvent", () => {
    it("should create an event and return the event ID", async () => {
      const eventId = await adapter.createEvent({
        title: "GROUP - Beginner",
        startTime: new Date("2026-07-30T10:00:00Z"),
        endTime: new Date("2026-07-30T11:00:00Z"),
        timezone: "Europe/Madrid",
      });

      expect(eventId).toBe("mock-event-id-123");
    });

    it("should throw ServiceUnavailableError on API failure", async () => {
      const { google } = await import("googleapis");
      const mockCalendar = google.calendar as unknown as MockCalendarFactory;
      const mockInsert = mockCalendar().events.insert as ReturnType<typeof vi.fn>;
      mockInsert.mockRejectedValueOnce(new Error("API quota exceeded"));

      await expect(
        adapter.createEvent({
          title: "GROUP - Beginner",
          startTime: new Date("2026-07-30T10:00:00Z"),
          endTime: new Date("2026-07-30T11:00:00Z"),
          timezone: "Europe/Madrid",
        }),
      ).rejects.toThrow(ServiceUnavailableError);
    });
  });

  describe("updateEvent", () => {
    it("should update an event without throwing", async () => {
      await expect(
        adapter.updateEvent("mock-event-id-123", {
          title: "INDIVIDUAL - Intermediate",
          startTime: new Date("2026-07-30T11:00:00Z"),
          endTime: new Date("2026-07-30T12:00:00Z"),
          timezone: "Europe/Madrid",
        }),
      ).resolves.toBeUndefined();
    });

    it("should throw ServiceUnavailableError on API failure", async () => {
      const { google } = await import("googleapis");
      const mockCalendar = google.calendar as unknown as MockCalendarFactory;
      const mockPatch = mockCalendar().events.patch as ReturnType<typeof vi.fn>;
      mockPatch.mockRejectedValueOnce(new Error("Not found"));

      await expect(
        adapter.updateEvent("nonexistent-id", {
          title: "GROUP - Beginner",
          startTime: new Date("2026-07-30T10:00:00Z"),
          endTime: new Date("2026-07-30T11:00:00Z"),
          timezone: "Europe/Madrid",
        }),
      ).rejects.toThrow(ServiceUnavailableError);
    });
  });

  describe("deleteEvent", () => {
    it("should delete an event without throwing", async () => {
      await expect(adapter.deleteEvent("mock-event-id-123")).resolves.toBeUndefined();
    });

    it("should throw ServiceUnavailableError on API failure", async () => {
      const { google } = await import("googleapis");
      const mockCalendar = google.calendar as unknown as MockCalendarFactory;
      const mockDelete = mockCalendar().events.delete as ReturnType<typeof vi.fn>;
      mockDelete.mockRejectedValueOnce(new Error("Not found"));

      await expect(adapter.deleteEvent("nonexistent-id")).rejects.toThrow(ServiceUnavailableError);
    });
  });

  describe("queryFreeBusy", () => {
    it("should return busy slots for the queried calendar", async () => {
      const result = await adapter.queryFreeBusy({
        timeMin: new Date("2026-07-30T08:00:00Z"),
        timeMax: new Date("2026-07-30T20:00:00Z"),
      });

      expect(result.queriedCalendar).toBe("test-calendar-id");
      expect(result.busySlots).toHaveLength(1);
      expect(result.busySlots[0].start).toBe("2026-07-30T10:00:00Z");
      expect(result.busySlots[0].end).toBe("2026-07-30T11:00:00Z");
    });

    it("should throw ServiceUnavailableError on API failure", async () => {
      const { google } = await import("googleapis");
      const mockCalendar = google.calendar as unknown as MockCalendarFactory;
      const mockFreebusyQuery = mockCalendar().freebusy.query as ReturnType<typeof vi.fn>;
      mockFreebusyQuery.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        adapter.queryFreeBusy({
          timeMin: new Date("2026-07-30T08:00:00Z"),
          timeMax: new Date("2026-07-30T20:00:00Z"),
        }),
      ).rejects.toThrow(ServiceUnavailableError);
    });
  });
});
