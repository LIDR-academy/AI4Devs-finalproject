# Quickstart: Google Calendar Integration Validation

## Prerequisites

- Backend running locally (`npm run dev` in `backend/`)
- `.env` configured with `GOOGLE_CALENDAR_SA_EMAIL`, `GOOGLE_CALENDAR_SA_KEY_PATH`, `GOOGLE_CALENDAR_ID_DEV`
- Service Account JSON key exists at the path specified in `.env`
- Database migrated with `TrainingClass.google_event_id` and `Block.google_event_id` columns

## Validation Scenarios

### 1. CalendarProvider Port - No Google Imports in Domain

```
Check: grep -r "googleapis\|google\.\|@google-cloud" backend/src/domain/
Expect: No matches (domain layer is pure)
```

### 2. GoogleCalendarAdapter - Create Event

Run the adapter's create method directly (via test script):

```bash
npx tsx src/__tests__/manual/calendar-adapter-test.ts
```

Expected output: Google Calendar event created, event ID returned.

### 3. GoogleCalendarAdapter - Update Event

```typescript
// Pseudocode test
const eventId = await adapter.createEvent({ title: "GROUP - Beginner", startTime, endTime, timezone: "Europe/Madrid" });
await adapter.updateEvent(eventId, { title: "INDIVIDUAL - Intermediate", startTime, endTime, timezone: "Europe/Madrid" });
```

Expected: Event title changes on Google Calendar within 5 seconds.

### 4. GoogleCalendarAdapter - Delete Event

```typescript
const eventId = await adapter.createEvent({ ... });
await adapter.deleteEvent(eventId);
```

Expected: Event is removed from Google Calendar within 5 seconds.

### 5. Free/Busy Query

```typescript
const result = await adapter.queryFreeBusy({
  timeMin: new Date("2026-07-30T08:00:00Z"),
  timeMax: new Date("2026-07-30T20:00:00Z"),
});
console.log(result.busySlots);
```

Expected: Returns busy intervals; query completes within 500ms p95.

### 6. No PII in Event Titles

```
Check: Inspect Google Calendar events → titles are "<ClassType> - <Level>" only
```

### 7. Error Returns 503 with Unique Ref

Simulate invalid calendar ID or network failure:

```typescript
// Set GOOGLE_CALENDAR_ID_DEV to an invalid value, then:
try {
  await adapter.createEvent({ ... });
} catch (error) {
  console.log(error.statusCode); // 503
  console.log(error.ref);        // UUID v4 string
  console.log(error.code);       // "SERVICE_UNAVAILABLE"
}
```

Expected: `ServiceUnavailableError` with 503 status, unique `ref` (UUID), and `code: "SERVICE_UNAVAILABLE"`.

### 8. Health Monitoring

```typescript
const monitor = new CalendarHealthMonitor();
monitor.recordCall(true);  // success
monitor.recordCall(false); // failure
monitor.recordCall(false); // failure
console.log(monitor.getHealth()); // >5% if window is small enough
```

Expected: After enough failures in 5-min window, `status` shows `"degraded"` and `failureRate` > 5.

### 9. End-to-End: Class Creation Syncs to Calendar

```
POST /api/v1/classes
Body: { "class_type": "GROUP", "assigned_coach_id": "...", "level_id": "...", "start_time": "..." }
```

Expected:
- 201 Created with class data
- `google_event_id` populated on the returned class
- Event visible on system Google Calendar

## API Contract Verification

Verify error envelope for calendar failures matches [CalendarProvider contract](contracts/CalendarProvider.md):

```json
// Response when calendar API fails
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Calendar service is currently unavailable",
    "ref": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

## Verification Checklist

- [ ] Domain layer has zero Google Calendar imports
- [ ] Adapter creates events on Google Calendar
- [ ] Adapter updates events on Google Calendar
- [ ] Adapter deletes events on Google Calendar
- [ ] Free/busy query returns accurate results
- [ ] Free/busy query completes within 500ms p95
- [ ] Event titles contain only type + level (no PII)
- [ ] Calendar API failures return 503 with unique UUID ref
- [ ] Health monitor detects >5% failure rate
- [ ] No Google API credentials in frontend bundle
