## 1. Backend Core Services

- [x] 1.1 Implement `SlugGenerator` service to generate unique URL-friendly slugs.
- [x] 1.2 Update the DataRetentionJob creation logic or create a utility to easily enqueue a job.
- [x] 1.3 Implement `IEventService` and `EventService` with full CRUD operations (`CreateEventAsync`, `GetEventBySlugAsync`, `UpdateEventAsync`, `DeleteEventAsync`).
- [x] 1.4 Implement automated DataRetentionJob creation in `CreateEventAsync` (ScheduledDeleteAt = EventDate + 30 days).
- [x] 1.5 Add Unit Tests for `SlugGenerator` and `EventService`.

## 2. Backend API Controllers

- [x] 2.1 Implement `EventsController` with endpoints: `POST /api/events`, `GET /api/events/{slug}`, `PUT /api/events/{slug}`, and `DELETE /api/events/{slug}`.
- [x] 2.2 Add FluentValidation for `CreateEventRequest` and `UpdateEventRequest`.
- [x] 2.3 Implement the `EventOwner` authorization policy and apply it to all `EventsController` endpoints (except creation).
- [x] 2.4 Implement `TemplatesController` with `GET /api/templates` endpoint to fetch available templates.

## 3. Frontend Services & Routing

- [x] 3.1 Implement `EventService` in Angular (`frontend/src/app/core/services/event.service.ts`) to interact with the backend API.
- [x] 3.2 Implement `TemplateService` in Angular to interact with the Templates API.
- [x] 3.3 Set up routing for the onboarding wizard in the frontend module (`/onboarding/wizard`).

## 4. Frontend Onboarding Wizard UI

- [x] 4.1 Create `onboarding.page.ts` component structure.
- [x] 4.2 Build `TemplateSelectionStep` component.
- [x] 4.3 Build `EventDetailsStep` component using Reactive Forms.
- [x] 4.4 Build `GuestImportStep` component (can just be a placeholder for MVP).
- [x] 4.5 Integrate Google Maps Javascript API (`iframe`) for visualizing the venue address in `EventDetailsStep`.
