# CalendarProvider Contract

## Overview

The `CalendarProvider` is a domain-layer port that abstracts calendar event operations and free/busy queries. The domain and application layers depend on this interface only — never on Google Calendar types or SDKs.

## Interface

```typescript
export interface CalendarEventData {
  title: string;          // "<ClassType> - <Level>" format, no PII
  startTime: Date;        // Event start (ISO)
  endTime: Date;          // Event end (start + 60min for classes)
  timezone: string;       // IANA timezone (e.g., "Europe/Madrid")
  description?: string;   // Optional notes (also PII-free)
}

export interface FreeBusyQuery {
  timeMin: Date;          // Window start
  timeMax: Date;          // Window end
  calendarIds?: string[]; // Calendars to query (defaults to system calendar)
}

export interface FreeBusySlot {
  start: string;          // ISO datetime
  end: string;            // ISO datetime
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
```

## Contract Rules

### createEvent(data) → eventId
- **Precondition**: `data.title` matches `<ClassType> - <Level>` or `<ClassType>` pattern
- **Postcondition**: Returns a non-empty Google Calendar event ID string
- **Error**: Throws `ServiceUnavailableError` (wrapping `AppError`) if Google Calendar API fails

### updateEvent(eventId, data) → void
- **Precondition**: `eventId` references an existing Google Calendar event
- **Postcondition**: The Google Calendar event's title, times, and description are updated
- **Error**: Throws `ServiceUnavailableError` if Google Calendar API fails; logs error if event not found

### deleteEvent(eventId) → void
- **Precondition**: `eventId` references an existing Google Calendar event
- **Postcondition**: The Google Calendar event is deleted
- **Error**: Throws `ServiceUnavailableError` if Google Calendar API fails; gracefully handles "not found"

### queryFreeBusy(query) → FreeBusyResult
- **Precondition**: `query.timeMin` < `query.timeMax`
- **Postcondition**: Returns all busy intervals within the queried time range
- **Error**: Throws `ServiceUnavailableError` if Google Calendar API fails

## Integration Points

### Consumed by
- Class creation/update/deletion use cases (to sync Google Calendar events)
- Block creation/deletion use cases (to sync Google Calendar events)
- Availability checking use cases (free/busy queries)

### Implementation
- `GoogleCalendarAdapter` in `src/infrastructure/adapters/calendar/GoogleCalendarAdapter.ts`
- Uses `googleapis` SDK with Service Account JWT auth
- Calendar ID resolved from env config per NODE_ENV
