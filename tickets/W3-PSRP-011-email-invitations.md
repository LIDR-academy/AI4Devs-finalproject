## PSRP-011: feat(invitations): email-invitations

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** M (2-3d)
**Sprint Week:** W3
**Dependencies:** PSRP-008, PSRP-010

## Feature Summary
Implementar el flujo de envío de invitaciones por email: generar tokens de invitación únicos por invitado, crear registros de Invitation, encolar emails de invitación a la cola Dragonfly `email:queue` para procesamiento asíncrono por el Email Dispatcher, y proporcionar una interfaz de dashboard para触发 el envío. Esto incluye la generación de tokens de invitación (hash SHA-256), renderizado de plantillas de email personalizadas con enlace RSVP, y seguimiento del estado de entrega visible en el gestor de invitados.

## Requirements
- [ ] Implement invitation token generation: 256-bit cryptographically secure random string, hashed with SHA-256 before storage in Invitation.TokenHash
- [ ] Implement `IInvitationService` and `InvitationService` with methods: CreateInvitationsForEventAsync (generates tokens for all guests without invitations), SendInvitationsAsync (enqueues emails), GetInvitationsByEventAsync
- [ ] Implement `POST /api/events/{slug}/invitations/send` endpoint — creates Invitation records for all guests with email addresses, generates tokens, enqueues email messages to `email:queue` with type='invitation', template='invitation-email', tokens={guestName, rsvpLink, eventName, coupleNames}
- [ ] Implement `GET /api/events/{slug}/invitations` endpoint — returns invitation list with delivery status per guest
- [ ] Build RSVP link URL: `{frontendBaseUrl}/rsvp/{plaintextToken}` (plaintext token included in URL, only hash stored in DB)
- [ ] Implement invitation status tracking in guest manager: show delivery status badge per guest (pending, sent, delivered, failed)
- [ ] Implement "Send Email Invitations" button in guest manager dashboard
- [ ] Implement delivery status polling in guest manager (updates every 10 seconds)
- [ ] Implement Invitation creation with EventId denormalization for query performance
- [ ] Write unit tests for token generation, invitation creation, and enqueue logic

## Technical Notes
- **Backend:**
  - Token generation: `RandomNumberGenerator.GetBytes(32)` → Base64 → SHA-256 hash for storage
  - RSVP link: `{MagicLink:BaseUrl}/rsvp/{plaintextToken}` — guest clicks link, token is hashed and compared to stored hash
  - Enqueue payload: `{ type: "invitation", to: guest.Email, subject: "You're invited to {eventName}!", templateName: "invitation-email", tokens: { guestName, rsvpLink, eventName, coupleNames, eventDate, venueName }, eventId, entityType: "invitation", entityId: invitation.Id }`
  - One invitation per guest per event (service layer enforcement)
- **Frontend:**
  - "Send Email Invitations" button with confirmation dialog ("Send invitations to N guests?")
  - Delivery status column in guest table with BadgeComponent (pending=gray, sent=blue, delivered=green, failed=red)
  - Polling for delivery status updates
- **Database:** Invitations table (TokenHash, SentVia, SentAt, DeliveryStatus), DeliveryLogs table (created by Email Dispatcher)
- **Integrations:** Dragonfly queue (enqueue to `email:queue`), Email Dispatcher (PSRP-010)
- **Key files:**
  - `backend/src/Aura.Core/Interfaces/Services/IInvitationService.cs`
  - `backend/src/Aura.Core/Services/InvitationService.cs`
  - `backend/src/Aura.Api/Controllers/InvitationsController.cs`
  - `backend/src/Aura.Core/DTOs/Invitations/InvitationResponse.cs`
  - `backend/src/Aura.Core/DTOs/Invitations/SendInvitationsRequest.cs`
  - `frontend/src/app/features/events/components/guest-manager.page.ts` (send button, status column)
  - `frontend/src/app/core/services/invitation.service.ts`

## Acceptance Criteria
- [ ] AC1: Given an event with 10 guests (all with email addresses), when the host clicks "Send Email Invitations", then 10 Invitation records are created with unique token hashes, 10 email messages are enqueued to `email:queue`, and the guest table shows status='pending' for all
- [ ] AC2: Given the Email Dispatcher processes an invitation email, when the email is sent successfully, then the Invitation.DeliveryStatus is updated to 'sent' and the guest table shows status='sent'
- [ ] AC3: Given a guest receives the invitation email, when they click the RSVP link, then the link contains the plaintext token and navigates to the RSVP form (RSVP form in PSRP-014)
- [ ] AC4: Given an invitation already exists for a guest, when invitations are sent again, then no duplicate invitation is created (one per guest enforcement)
- [ ] AC5: Given the host views the guest manager after sending invitations, when delivery statuses are updated by the Email Dispatcher, then the guest table reflects the latest status within 10 seconds (polling)

## Related Items
- **PRD section:** 06-mvp-features.md (6.3.1 Email + WhatsApp Invitations, US-COM-01, AC-COM-01)
- **Architecture:** 02-components.md (Email Dispatcher), 03-project-structure.md
- **Data model:** entities.md (Invitations), README.md (token security, token lifecycle)

## Blockers
Blocked by: PSRP-008, PSRP-010

## Branch Name
`feature/PSRP-011-email-invitations`

(End of file - total 61 lines)