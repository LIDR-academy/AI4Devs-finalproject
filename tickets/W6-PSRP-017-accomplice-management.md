## PSRP-017: feat(accomplice): accomplice-management

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** M (2-3d)
**Sprint Week:** W6
**Dependencies:** PSRP-004, PSRP-006

## Feature Summary
Implement the host-side accomplice management system: grant accomplice access via email (magic link), manage permissions (send_messages, view_rsvps), revoke access, resend magic link, and view accomplice list. Backend generates accomplice tokens (SHA-256 hashed), sends magic link emails, and provides CRUD endpoints. Frontend adds an accomplice management section to the event dashboard with invite form, accomplice list with status, and revoke/resend actions.

## Requirements
- [ ] Implement `IAccompliceService` and `AccompliceService` with methods: GrantAccessAsync(eventSlug, email, permissions), RevokeAccessAsync(accompliceId), ResendMagicLinkAsync(accompliceId), GetAccomplicesByEventAsync(eventSlug)
- [ ] Implement accomplice token generation: 256-bit random, SHA-256 hashed, stored in Accomplice.TokenHash. ExpiresAt = EventDate + 1 day
- [ ] Implement `POST /api/accomplices/{eventSlug}/grant` endpoint — creates Accomplice record, generates token, sends magic link email via `email:queue` with type='accomplice-invite', template='accomplice-invite'
- [ ] Implement `POST /api/accomplices/{eventSlug}/revoke` endpoint — sets IsRevoked=true, invalidates token
- [ ] Implement `POST /api/accomplices/{eventSlug}/resend` endpoint — generates new token, invalidates old, sends new magic link email
- [ ] Implement `GET /api/accomplices/{eventSlug}` endpoint — returns accomplice list with email, permissions, grantedAt, lastAccessedAt, isRevoked
- [ ] Implement accomplice magic link verification: `GET /api/accomplices/verify?token={token}` — hash token, lookup Accomplice, check not revoked, check not expired, generate JWT with role='accomplice', claims include eventId, permissions array
- [ ] Implement accomplice JWT: 24-hour expiry, claims: sub (AccompliceId), email, role='accomplice', eventId, permissions (JSON array)
- [ ] Implement accomplice management UI section in event dashboard: invite form (email input, permission checkboxes), accomplice list with status badges, revoke/resend action buttons
- [ ] Implement permission checkboxes: "Send Messages" (send_messages), "View RSVPs" (view_rsvps). Default: both checked
- [ ] Write unit tests for AccompliceService (token generation, permission validation, revoke logic)

## Technical Notes
- **Backend:**
  - `POST /api/accomplices/{eventSlug}/grant` — validate email, check not duplicate, create Accomplice (ExpiresAt = Event.EventDate + 1 day), generate token, enqueue magic link email. Email template includes panel URL: `{frontendBaseUrl}/accomplice/{plaintextToken}`
  - `GET /api/accomplices/verify?token={token}` — hash token, lookup by TokenHash, verify IsRevoked=false, ExpiresAt > now, update LastAccessedAt, generate JWT
  - Accomplice JWT claims: `{ sub: accompliceId, email, role: "accomplice", eventId, permissions: ["send_messages", "view_rsvps"] }`
  - Permissions stored as JSON array in Accomplice.Permissions (jsonb column)
- **Frontend:**
  - Accomplice section in event dashboard page (tab or accordion)
  - Invite form: email input, permission checkboxes, "Invite" button
  - Accomplice list: table with email, permissions (badges), status (active/revoked/expired), actions (revoke, resend)
  - Status badges: active=green, revoked=red, expired=gray
- **Database:** Accomplices table (TokenHash, Permissions jsonb, ExpiresAt, IsRevoked)
- **Integrations:** Email Dispatcher (via `email:queue` for magic link delivery)
- **Key files:**
  - `backend/src/Aura.Core/Interfaces/Services/IAccompliceService.cs`
  - `backend/src/Aura.Core/Services/AccompliceService.cs`
  - `backend/src/Aura.Api/Controllers/AccomplicesController.cs`
  - `backend/src/Aura.Core/DTOs/Accomplices/GrantAccessRequest.cs`
  - `backend/src/Aura.Core/DTOs/Accomplices/AccompliceResponse.cs`
  - `frontend/src/app/features/events/components/accomplice-management.component.ts`
  - `frontend/src/app/core/services/accomplice.service.ts`

## Acceptance Criteria
- [ ] AC1: Given the host enters an accomplice email and selects permissions, when "Invite" is clicked, then the accomplice receives a magic link email and the accomplice list shows the new entry with status='active'
- [ ] AC2: Given an accomplice clicks their magic link, when the verify endpoint is called, then a JWT is returned with role='accomplice', eventId, and permissions array
- [ ] AC3: Given the host clicks "Revoke" on an accomplice, when the action is confirmed, then IsRevoked=true, the accomplice can no longer access the panel, and status shows 'revoked'
- [ ] AC4: Given the host clicks "Resend" on an accomplice, when the action is triggered, then a new magic link is sent, the old token is invalidated, and the accomplice can access with the new link
- [ ] AC5: Given an accomplice tries to access after EventDate + 1 day, when the verify endpoint is called, then 401 is returned with "Access has expired"
- [ ] AC6: Given the host views the accomplice list, when there are active accomplices, then their email, permissions, and last accessed time are displayed

## Related Items
- **PRD section:** 06-mvp-features.md (6.4.1 Accomplice Magic-Link Panel, US-LGJ-01, US-LGJ-02, AC-LGJ-01, AC-LGJ-02, AC-LGJ-06)
- **Architecture:** 02-components.md (Accomplice Panel), 05-security.md (accomplice tokens, JWT claims)
- **Data model:** entities.md (Accomplices), README.md (token security)

## Blockers
Blocked by: PSRP-004, PSRP-006

## Branch Name
`feature/PSRP-017-accomplice-management`
