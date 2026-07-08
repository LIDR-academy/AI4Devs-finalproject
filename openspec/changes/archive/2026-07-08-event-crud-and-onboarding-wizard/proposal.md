## Why

Implementing the core Event entity and its associated onboarding wizard is the critical foundation of the Aura platform. It allows users to create and configure the events that guests will be invited to, establishing the central entity that all other features (guests, RSVPs, accomplices) depend on.

## What Changes

- Implement `IEventService` and `EventService` in the backend for full Event CRUD operations (Create, Read, Update, Delete).
- Add `EventsController` for API endpoints (`POST /api/events`, `GET /api/events/{slug}`, `PUT /api/events/{slug}`, `DELETE /api/events/{slug}`).
- Add `TemplatesController` for fetching available event templates.
- Implement automatic slug generation, ensuring unique URL-friendly identifiers for events.

- Configure automatic `DataRetentionJob` creation when an event is created (ScheduledDeleteAt = EventDate + 30 days).
- Enforce the `EventOwner` authorization policy on event endpoints.
- Build the frontend onboarding wizard in Angular (`onboarding-wizard.page.ts`) with three steps: template selection, event basics, and guest import.
- Implement the `EventService` in the Angular frontend to communicate with the backend API.

## Capabilities

### New Capabilities
- `event-management`: Creation, retrieval, updating, and deletion of core Event entities, including automatic slug generation.
- `onboarding-wizard`: Frontend multi-step wizard for configuring new events (template selection, basic details, and initial guest import).

### Modified Capabilities


## Impact

- **Backend API**: New endpoints in `EventsController` and `TemplatesController`.
- **Database**: Interactions with the `Events`, `Templates`, and `DataRetentionJobs` tables.
- **Frontend**: New onboarding feature module and associated pages/steps in Angular.

