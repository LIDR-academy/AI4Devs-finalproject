## PSRP-020: feat(messaging): thank-you-cards

**Type:** feat
**Priority:** P2 (Could)
**Estimated Effort:** S (1d)
**Sprint Week:** W7
**Dependencies:** PSRP-010, PSRP-012

## Feature Summary
Implement automated post-event thank you cards: a CronJob or scheduled task that runs 1 day after the event date, queries all guests who attended (RSVP attendance='yes'), and sends personalized thank you messages via the same channel as the original invitation. Includes customizable thank you message and optional photo gallery link.

## Requirements
- [ ] Implement `ThankYouCardWorker` as a CronJob (Kubernetes CronJob, `schedule: "0 4 * * *"`) or BackgroundService with timer
- [ ] Implement thank you query: find Events where EventDate = NOW() - 1 day AND Status = 'published', then for each event, find Guests with RSVP attendance='yes'
- [ ] Implement channel routing: check original Invitation.SentVia to determine email or WhatsApp
- [ ] Implement email thank you: enqueue to `email:queue` with type='thank_you', template='thank-you-card', tokens={guestName, eventName, coupleNames, photoGalleryLink (optional)}
- [ ] Implement WhatsApp thank you: enqueue to `whatsapp:queue` with type='thank_you', templateName='thank_you', variables={guestName, eventName, coupleNames}
- [ ] Implement customizable thank you message: host can set a custom message on the event (add ThankYouMessage field to Events table or use a separate config). Default: "Thank you for celebrating with us!"
- [ ] Implement optional photo gallery link: host can add a photo gallery URL (external: Drive, Pixieset). If provided, include in thank you message
- [ ] Implement thank you deduplication: check DeliveryLogs to avoid sending duplicate thank you cards
- [ ] Add ThankYouMessage and PhotoGalleryUrl fields to Events entity (migration)
- [ ] Add thank you message customization to event editor UI (optional text area + photo gallery URL input)
- [ ] Create Kubernetes CronJob manifest for Thank You Card worker
- [ ] Write unit tests for thank you query, channel routing, and deduplication

## Technical Notes
- **Backend:**
  - CronJob runs daily at 04:00 UTC (after reminder scheduler at 03:00). Query: `SELECT e.* FROM "Events" e WHERE e."EventDate"::date = (NOW() - INTERVAL '1 day')::date AND e."Status" = 'published'`
  - For each event: `SELECT g.*, i."SentVia" FROM "Guests" g JOIN "Invitations" i ON g."Id" = i."GuestId" JOIN "RSVPs" r ON i."Id" = r."InvitationId" WHERE g."EventId" = @eventId AND r."Attendance" = 'yes' AND g."IsDeleted" = false`
  - Deduplication: check DeliveryLogs WHERE EntityType='thank_you' AND EntityId=guestId
  - New fields: `Events.ThankYouMessage` (text, nullable), `Events.PhotoGalleryUrl` (varchar(500), nullable)
- **Frontend:**
  - Event editor: add "Thank You Message" textarea and "Photo Gallery URL" input in a new "Post-Event" section
- **Database:** Events table (new fields), DeliveryLogs table (dedup check)
- **Integrations:** Dragonfly (enqueue to `email:queue` or `whatsapp:queue`), Email Dispatcher, WhatsApp Dispatcher
- **Key files:**
  - `backend/workers/Aura.Workers.Email/ThankYouCardWorker.cs` (or separate worker)
  - `backend/src/Aura.Core/Models/Event.cs` (add ThankYouMessage, PhotoGalleryUrl)
  - `backend/src/Aura.Infrastructure/Data/Configurations/EventConfiguration.cs` (update config)
  - `backend/src/Aura.Infrastructure/Migrations/*_AddThankYouFields.cs`
  - `k8s/base/cronjobs/thankyou-cronjob.yaml`
  - `frontend/src/app/features/events/components/template-editor.component.ts` (thank you section)

## Acceptance Criteria
- [ ] AC1: Given an event date has passed and it is now 1 day after, when the CronJob runs, then thank you cards are sent to all attendees (RSVP attendance='yes') via their original channel
- [ ] AC2: Given the host has customized the thank you message, when thank you cards are sent, then the custom message is used instead of the default
- [ ] AC3: Given the host has added a photo gallery URL, when thank you cards are sent, then the link is included in the thank you message
- [ ] AC4: Given an event has no attendees (all declined), when the CronJob runs, then no thank you cards are sent
- [ ] AC5: Given a guest email bounced, when a thank you would be sent via email, then the thank you is not sent via email (try WhatsApp if available)
- [ ] AC6: Given a thank you was already sent to a guest, when the CronJob runs again, then no duplicate is sent (deduplication)

## Related Items
- **PRD section:** 06-mvp-features.md (6.3.3 Post-Event Thank You Cards, US-TY-01, US-TY-02, AC-TY-01, AC-TY-02, AC-TY-03)
- **Architecture:** 02-components.md (N/A — new worker)
- **Data model:** entities.md (Events — new fields, DeliveryLogs)

## Blockers
Blocked by: PSRP-010, PSRP-012

## Branch Name
`feature/PSRP-020-thank-you-cards`
