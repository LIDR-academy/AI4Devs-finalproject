# Data Model: Google Calendar Integration

## CalendarProvider Port (Domain)

### Interface

| Method | Input | Output | Description |
|--------|-------|--------|-------------|
| `createEvent` | `CalendarEventData` | `string` (Google event ID) | Creates a new calendar event |
| `updateEvent` | `string` (event ID), `CalendarEventData` | `void` | Updates an existing calendar event |
| `deleteEvent` | `string` (event ID) | `void` | Deletes a calendar event |
| `queryFreeBusy` | `FreeBusyQuery` | `FreeBusyResult` | Returns busy intervals for a time range |

### Data Types

#### CalendarEventData
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Event title: `<ClassType> - <Level>` format, no PII |
| `startTime` | `Date` (ISO) | Yes | Event start date/time |
| `endTime` | `Date` (ISO) | Yes | Event end date/time (start + 60 min for classes) |
| `timezone` | `string` | Yes | IANA timezone (e.g., `Europe/Madrid`) |
| `description` | `string` | No | Optional internal notes (must also be PII-free) |

#### FreeBusyQuery
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timeMin` | `Date` (ISO) | Yes | Start of query window |
| `timeMax` | `Date` (ISO) | Yes | End of query window |
| `calendarIds` | `string[]` | No | Calendars to query; defaults to system calendar |

#### FreeBusyResult
| Field | Type | Description |
|-------|------|-------------|
| `busySlots` | `Array<{ start: string; end: string }>` | Busy time intervals in ISO format |
| `queriedCalendar` | `string` | The calendar ID that was queried |

## GoogleCalendarAdapter (Infrastructure)

### Dependencies
- `googleapis` SDK v173
- Service Account JSON key file (path from env)
- Calendar ID resolved per `NODE_ENV` from env config

### Authentication
- Scope: `https://www.googleapis.com/auth/calendar`
- Method: JWT client from Service Account credentials
- Implementation mirrors `test-calendar-access.mjs` pattern

### Calendar ID Resolution
| NODE_ENV | Env Var | Example |
|----------|---------|---------|
| `development` | `GOOGLE_CALENDAR_ID_DEV` | `<hex>@group.calendar.google.com` |
| `production` | `GOOGLE_CALENDAR_ID_PROD` | `<hex>@group.calendar.google.com` |
| `test` | `GOOGLE_CALENDAR_ID_DEV` | Test mode uses dev calendar |

## CalendarHealthMonitor (Infrastructure)

### Internal State
| Field | Type | Description |
|-------|------|-------------|
| `calls` | `Array<{ timestamp: number; success: boolean }>` | Rolling window of API call outcomes |
| `windowMinutes` | `number` | Default: 5 |

### Methods
| Method | Returns | Description |
|--------|---------|-------------|
| `recordCall(success)` | `void` | Record a call outcome with current timestamp |
| `getHealth()` | `CalendarHealthStatus` | Compute current health from rolling window |

### CalendarHealthStatus
| Field | Type | Description |
|-------|------|-------------|
| `status` | `"healthy" \| "degraded"` | Healthy if failure rate ≤5% |
| `failureRate` | `number` | Percentage (0-100) of failures in window |
| `totalCalls` | `number` | Total calls in window |
| `windowMinutes` | `number` | Size of the rolling window |

## Relation to Existing Models

### TrainingClass (Prisma)
- `google_event_id: String?` — populated after successful `createEvent` call
- `class_type: ClassType` — used in event title (e.g., "GROUP", "INDIVIDUAL")
- `level_id: Level?` — level name used in event title (e.g., "Beginner")
- `start_time: DateTime` — event start
- `duration_minutes: Int` — always 60, used to compute end_time

### Block (Prisma)
- `google_event_id: String?` — populated after successful `createEvent` call
- `block_type: BlockType` — used in event title (e.g., "GYM_WIDE", "PERSONAL")
- `start_time: DateTime` — event start
- `end_time: DateTime` — event end

## Validation Rules

1. Event titles MUST match pattern: `<ClassType> - <LevelName>` (e.g., "GROUP - Beginner")
2. If no level assigned: title is just class type (e.g., "INDIVIDUAL")
3. No PII (coach name, coachee name, email, phone) in title or description
4. Class end time = start time + 60 minutes (hard domain invariant)
5. ServiceUnavailableError MUST have unique UUID ref
6. Health monitor window is strictly last 5 minutes (sliding, not fixed calendar minutes)
