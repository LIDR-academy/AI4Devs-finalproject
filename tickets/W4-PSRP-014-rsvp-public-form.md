## PSRP-014: feat(rsvp): rsvp-public-form

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W4
**Dependencies:** PSRP-006, PSRP-008

## Feature Summary
Implementar el formulario público de RSVP al que los invitados acceden mediante su enlace único con token de invitación. El backend proporciona endpoints basados en tokens para obtener información del evento/invitado y enviar/actualizar respuestas RSVP. El frontend es una página standalone optimizada para móvil (no parte del Angular SPA) con selección de asistencia (Sí/No/Maybe), restricciones dietéticas, necesidades de transporte, acompañante, mensaje personal, aplicación del deadline, y página de confirmación. El formulario RSVP está embebido en el micrositio del invitado pero se comunica directamente con la API.

## Requirements
- [ ] Implement `IRsvpService` and `RsvpService` in Aura.Core/Services/ with methods: GetRsvpInfoAsync(tokenHash), SubmitRsvpAsync(tokenHash, rsvpData), UpdateRsvpAsync(tokenHash, rsvpData)
- [ ] Implement `RsvpController` with endpoints: `GET /api/rsvp/{token}` (get event/guest info for form), `POST /api/rsvp/{token}` (submit or update RSVP)
- [ ] Implement token verification: hash incoming token with SHA-256, compare to stored Invitation.TokenHash, check invitation exists and is not deleted
- [ ] Implement RSVP deadline enforcement: cannot submit or update RSVP less than 7 days before EventDate. Return 403 with "RSVP deadline has passed"
- [ ] Implement idempotent submission: if RSVP already exists for this InvitationId, update instead of creating duplicate (UPSERT pattern)
- [ ] Implement FluentValidation for RsvpRequest: Attendance required ('yes'/'no'/'maybe'), DietaryRestrictions max 500 chars, Message max 1000 chars
- [ ] Implement RSVP confirmation: after successful submission, return confirmation data (guest name, event name, attendance, message)
- [ ] Create RSVP form as a standalone HTML/JS page (not Angular SPA) for fast loading on mobile. Can be part of the Angular build but served as a separate route `/rsvp/:token`
- [ ] Implement RSVP form UI: event header (couple names, date, venue), attendance radio buttons (Yes/No/Maybe), dietary restrictions textarea, transport checkbox, plus-one checkbox, personal message textarea, submit button
- [ ] Implement RSVP confirmation page: success message with event details, "Add to Calendar" button, "Get Directions" button
- [ ] Implement invalid token state: show "This invitation link is not valid" with contact link
- [ ] Implement RSVP deadline state: show "RSVP deadline has passed" message
- [ ] Write unit tests for RsvpService (token verification, deadline check, idempotent submission)

## Technical Notes
- **Backend:**
  - `GET /api/rsvp/{token}` — hash token, lookup Invitation by TokenHash, return { guestName, eventName, coupleNames, eventDate, venueName, venueAddress, existingRsvp (if any), deadlinePassed (bool) }
  - `POST /api/rsvp/{token}` — hash token, lookup Invitation, check deadline, create or update RSVP. Return { confirmationId, guestName, attendance, eventName }
  - Rate limiting: 5 RSVP submissions per token per hour (prevent spam)
  - RSVP deadline: `EventDate - 7 days`. If `DateTime.UtcNow > deadline`, reject
- **Frontend:**
  - RSVP form is a lightweight standalone page (can be Angular component but optimized for mobile)
  - Mobile-first: large touch targets, minimal scrolling, fast load
  - Token is in the URL path: `/rsvp/{plaintextToken}`
  - Form validation: attendance required, character limits on text fields
  - Confirmation page: success state with event details and action buttons
- **Database:** RSVPs table (unique InvitationId), Invitations table (TokenHash lookup), Events table (EventDate for deadline)
- **Integrations:** N/A
- **Key files:**
  - `backend/src/Aura.Core/Interfaces/Services/IRsvpService.cs`
  - `backend/src/Aura.Core/Services/RsvpService.cs`
  - `backend/src/Aura.Api/Controllers/RsvpController.cs`
  - `backend/src/Aura.Core/DTOs/Rsvp/RsvpInfoResponse.cs`
  - `backend/src/Aura.Core/DTOs/Rsvp/SubmitRsvpRequest.cs`
  - `backend/src/Aura.Core/DTOs/Rsvp/RsvpConfirmationResponse.cs`
  - `frontend/src/app/features/rsvp/pages/rsvp-form.page.ts`
  - `frontend/src/app/features/rsvp/pages/rsvp-confirmation.page.ts`
  - `frontend/src/app/core/services/rsvp.service.ts`

## Acceptance Criteria
- [ ] AC1: Given a guest clicks their invitation link, when the RSVP page loads, then the event details and RSVP form are displayed with the guest's name pre-filled
- [ ] AC2: Given a guest selects "Yes, I'll attend" and fills dietary restrictions, when they submit, then the RSVP is saved, a confirmation page is shown, and the host dashboard updates within 5 seconds
- [ ] AC3: Given a guest selects "No, I can't attend", when they submit, then the RSVP is saved with attendance='no' and the declined count increments on the dashboard
- [ ] AC4: Given a guest previously submitted an RSVP, when they click their link again (more than 7 days before event), then their existing RSVP is loaded and they can modify it
- [ ] AC5: Given the RSVP deadline has passed (< 7 days to event), when a guest tries to submit or update, then 403 is returned with "RSVP deadline has passed" message
- [ ] AC6: Given an invalid or tampered token, when the guest accesses the RSVP link, then "This invitation link is not valid" is shown with a contact link

## Related Items
- **PRD section:** 06-mvp-features.md (6.2.2 Smart RSVP Form, US-RSVP-01 through US-RSVP-05, AC-RSVP-01 through AC-RSVP-06)
- **Architecture:** 02-components.md (Guest Microsite — RSVP form), 01-architecture-diagram.md (RSVP flow)
- **Data model:** entities.md (RSVPs, Invitations), README.md (token security)

## Blockers
Blocked by: PSRP-006, PSRP-008

## Branch Name
`feature/PSRP-014-rsvp-public-form`

(End of file - total 69 lines)