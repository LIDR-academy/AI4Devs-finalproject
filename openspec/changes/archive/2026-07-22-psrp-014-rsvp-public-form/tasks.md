## 1. Core Interfaces and Models

- [x] 1.1 Create `IRsvpService` interface in `Aura.Core/Interfaces/Services/` with methods for fetching RSVP info and submitting/updating RSVPs.
- [x] 1.2 Create DTOs `RsvpInfoResponse`, `SubmitRsvpRequest`, and `RsvpConfirmationResponse` in `Aura.Core/DTOs/Rsvp/`.

## 2. Backend Services

- [x] 2.1 Implement `RsvpService` in `Aura.Core/Services/` to handle token hashing and database lookups.
- [x] 2.2 Add RSVP deadline validation logic in `RsvpService` (7 days before `EventDate`).
- [x] 2.3 Add idempotent UPSERT logic for `Rsvp` records in `RsvpService`.
- [x] 2.4 Add FluentValidation rules for `SubmitRsvpRequest`.

## 3. Backend Controllers and Security

- [x] 3.1 Implement `RsvpController` with `GET /api/rsvp/{token}` and `POST /api/rsvp/{token}`.
- [x] 3.2 Configure Rate Limiting middleware on the `RsvpController` endpoints.

## 4. Frontend Integration

- [x] 4.1 Create `RsvpService` in Angular frontend to call the new `/api/rsvp` endpoints.
- [x] 4.2 Create standalone `RsvpFormPageComponent` for `/rsvp/:token` route.
- [x] 4.3 Implement UI for RSVP form (Attendance, Dietary Restrictions, Logistic Needs, Message).
- [x] 4.4 Create standalone `RsvpConfirmationPageComponent` for successful submissions.
- [x] 4.5 Implement "Invalid Token" and "Deadline Passed" UI states.

## 5. Testing and Validation

- [x] 5.1 Write unit tests for `RsvpService` token hashing, deadline validation, and upsert logic.
- [x] 5.2 Validate end-to-end flow using local deployment.
