## PSRP-006: feat(events): event-crud-and-onboarding-wizard

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W2
**Dependencies:** PSRP-004, PSRP-005

## Feature Summary
Implement the complete Event CRUD backend (create, read, update, delete with slug generation, Google Maps geocoding, DataRetentionJob auto-creation) and the Angular onboarding wizard frontend (template selection, event basics form, guest import step). This is the core entity that all other features (guests, invitations, RSVPs, accomplices) depend on.

## Requirements
- [ ] Implement `IEventService` and `EventService` in Aura.Core/Services/ with methods: CreateEventAsync, GetEventBySlugAsync, GetEventsByUserAsync, UpdateEventAsync, DeleteEventAsync
- [ ] Implement slug generation: lowercase, replace spaces with hyphens, remove special chars, append year. If duplicate, append `-2`, `-3`, etc.
- [ ] Implement `EventsController` with endpoints: `POST /api/events` (create), `GET /api/events/{slug}` (get with stats), `PUT /api/events/{slug}` (update), `DELETE /api/events/{slug}` (soft delete)
- [ ] Implement `TemplatesController` with endpoint: `GET /api/templates?category=wedding&isPremium=false` (list available templates)
- [ ] Implement Google Maps geocoding: when venue address is provided, call Geocoding API to get lat/lng and store on Event
- [ ] Auto-create DataRetentionJob on event creation (ScheduledDeleteAt = EventDate + 30 days)
- [ ] Enforce EventOwner authorization policy on all event endpoints
- [ ] Implement FluentValidation for CreateEventRequest and UpdateEventRequest (name: 2-200 chars, EventDate: future date, venue: required fields)
- [ ] Implement onboarding wizard page (`features/onboarding/pages/onboarding-wizard.page.ts`) with 3 steps: template selection, event basics, guest import (optional/skippable)
- [ ] Implement template selection step: fetch templates, display grid with previews, select one
- [ ] Implement event basics step: name, date/time, venue name & address, couple names, color scheme (primary/secondary), font family
- [ ] Implement guest import step: manual add or skip (full CSV import in PSRP-008)
- [ ] Implement `EventService` in Angular frontend for API calls
- [ ] Write unit tests for EventService (slug generation, validation, CRUD logic)

## Technical Notes
- **Backend:**
  - `POST /api/events` — creates Event with status='draft', generates slug, geocodes venue, creates DataRetentionJob. Returns EventResponse with slug
  - `GET /api/events/{slug}` — returns event details with guest count, RSVP stats. Requires EventOwner policy
  - `PUT /api/events/{slug}` — updates event fields, re-geocodes if address changed
  - `DELETE /api/events/{slug}` — soft delete (future V2; for MVP, hard delete if draft)
- **Frontend:**
  - Onboarding wizard uses Angular new control flow (@switch for steps)
  - Typed reactive forms for event basics
  - Color picker for primary/secondary colors
  - Font family dropdown (from allowed list)
- **Database:** Events table, Templates table (seeded in PSRP-002), DataRetentionJobs table
- **Integrations:** Google Maps Geocoding API (API key from K8s Secret)
- **Key files:**
  - `backend/src/Aura.Core/Interfaces/Services/IEventService.cs`
  - `backend/src/Aura.Core/Services/EventService.cs`
  - `backend/src/Aura.Api/Controllers/EventsController.cs`
  - `backend/src/Aura.Api/Controllers/TemplatesController.cs`
  - `backend/src/Aura.Core/DTOs/Events/CreateEventRequest.cs`
  - `backend/src/Aura.Core/DTOs/Events/UpdateEventRequest.cs`
  - `backend/src/Aura.Core/DTOs/Events/EventResponse.cs`
  - `backend/src/Aura.Core/Services/SlugGenerator.cs`
  - `frontend/src/app/features/onboarding/pages/onboarding-wizard.page.ts`
  - `frontend/src/app/features/onboarding/steps/template-selection.step.ts`
  - `frontend/src/app/features/onboarding/steps/event-basics.step.ts`
  - `frontend/src/app/features/onboarding/steps/guest-import.step.ts`
  - `frontend/src/app/core/services/event.service.ts`

## Acceptance Criteria
- [ ] AC1: Given an authenticated user, when `POST /api/events` is called with valid data, then an Event is created with status='draft', a URL-safe slug is auto-generated, venue is geocoded, and a DataRetentionJob is created with ScheduledDeleteAt = EventDate + 30 days
- [ ] AC2: Given a duplicate slug exists, when a new event would generate the same slug, then `-2` is appended (e.g., `maria-y-juan-2026-2`)
- [ ] AC3: Given an event exists, when `GET /api/events/{slug}` is called by the owner, then event details are returned with guest count and RSVP stats
- [ ] AC4: Given an event exists, when `GET /api/events/{slug}` is called by a different user, then 403 Forbidden is returned (EventOwner policy)
- [ ] AC5: Given the user is on the onboarding wizard, when they complete all 3 steps, then the event is created and they are redirected to the event dashboard
- [ ] AC6: Given the user is on the onboarding wizard, when they skip the guest import step, then the event is created with 0 guests and they are redirected to the dashboard

## Related Items
- **PRD section:** 05-registration-onboarding.md (onboarding wizard), 06-mvp-features.md (US-T-01 for template selection)
- **Architecture:** 02-components.md (Host Dashboard), 03-project-structure.md (EventsController)
- **Data model:** entities.md (Events, Templates, DataRetentionJobs), README.md (key relationships)

## Blockers
Blocked by: PSRP-004, PSRP-005

## Branch Name
`feature/PSRP-006-event-crud-and-onboarding-wizard`
