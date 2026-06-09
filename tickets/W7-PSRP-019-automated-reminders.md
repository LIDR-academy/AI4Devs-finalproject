## PSRP-019: feat(reminders): automated-reminders

**Type:** feat
**Priority:** P1 (Should)
**Estimated Effort:** M (2-3d)
**Sprint Week:** W7
**Dependencies:** PSRP-010, PSRP-012, PSRP-014

## Feature Summary
Implementar el sistema automatizado de recordatorios RSVP: un CronJob que se ejecuta diariamente a las 03:00 UTC, consulta invitados que no han respondido RSVP a medida que se acerca el deadline de RSVP, y encola mensajes de recordatorio vía el mismo canal que la invitación original (email o WhatsApp). Incluye programación de recordatorios configurable (por defecto: 7 días antes del deadline de RSVP), trigger manual desde el gestor de invitados, y cancelación cuando un invitado responde.

## Requirements
- [ ] Implement `ReminderSchedulerWorker` as a CronJob (Kubernetes CronJob, `schedule: "0 3 * * *"`) or BackgroundService with timer
- [ ] Implement reminder query: find Guests where EventId has EventDate - 7 days <= NOW (configurable), InviteStatus = 'sent', and no RSVP record exists (LEFT JOIN Invitations → RSVPs WHERE RSVP.Id IS NULL)
- [ ] Implement channel routing: check original Invitation.SentVia to determine whether to enqueue to `email:queue` or `whatsapp:queue`
- [ ] Implement email reminder: enqueue to `email:queue` with type='reminder', template='rsvp-reminder', tokens={guestName, eventName, rsvpLink, eventDate}
- [ ] Implement WhatsApp reminder: enqueue to `whatsapp:queue` with type='reminder', templateName='rsvp_reminder', variables={guestName, eventName, rsvpLink}
- [ ] Implement manual reminder trigger: `POST /api/events/{slug}/reminders/send` — accepts list of guest IDs, enqueues reminders immediately for selected guests
- [ ] Implement reminder cancellation: when a guest submits an RSVP (PSRP-014), check if a reminder was scheduled and cancel it (or simply skip in the query since RSVP exists)
- [ ] Implement reminder deduplication: track sent reminders in DeliveryLogs to avoid sending multiple reminders to the same guest within 24 hours
- [ ] Implement "Send Reminder" button in guest manager: select pending guests (checkbox), click "Send Reminder", confirm dialog
- [ ] Create Kubernetes CronJob manifest for Reminder Scheduler (`concurrencyPolicy: Forbid`)
- [ ] Write unit tests for reminder query logic, channel routing, and deduplication

## Technical Notes
- **Backend:**
  - CronJob runs daily at 03:00 UTC. Query: `SELECT g.* FROM "Guests" g JOIN "Invitations" i ON g.Id = i."GuestId" LEFT JOIN "RSVPs" r ON i."Id" = r."InvitationId" JOIN "Events" e ON g."EventId" = e."Id" WHERE r."Id" IS NULL AND g."IsDeleted" = false AND e."EventDate" - INTERVAL '7 days' <= NOW() AND e."Status" = 'published'`
  - Channel routing: `i."SentVia"` determines queue. If 'email' → `email:queue`, if 'whatsapp' → `whatsapp:queue`, if 'both' → both queues
  - Manual trigger: same logic but filtered by provided guest IDs
  - Deduplication: check DeliveryLogs WHERE EntityType='reminder' AND EntityId=guestId AND SentAt > NOW() - 24 hours
- **Frontend:**
  - "Send Reminder" button in guest manager (visible when pending guests exist)
  - Checkbox selection for manual reminder targeting
  - Confirmation dialog: "Send reminders to N guests?"
- **Database:** Guests, Invitations, RSVPs, DeliveryLogs tables
- **Integrations:** Dragonfly (enqueue to `email:queue` or `whatsapp:queue`), Email Dispatcher (PSRP-010), WhatsApp Dispatcher (PSRP-012)
- **Key files:**
  - `backend/workers/Aura.Workers.Email/ReminderSchedulerWorker.cs` (or separate worker project)
  - `backend/src/Aura.Core/Interfaces/Services/IReminderService.cs`
  - `backend/src/Aura.Core/Services/ReminderService.cs`
  - `backend/src/Aura.Api/Controllers/RemindersController.cs`
  - `k8s/base/cronjobs/reminder-cronjob.yaml`
  - `frontend/src/app/features/events/components/guest-manager.page.ts` (send reminder button)

## Acceptance Criteria
- [ ] AC1: Given an event has guests who haven't RSVP'd and the RSVP deadline is within 7 days, when the CronJob runs at 03:00 UTC, then reminders are enqueued for non-responders via their original invitation channel
- [ ] AC2: Given the host selects 5 pending guests and clicks "Send Reminder", when confirmed, then reminders are sent immediately to those 5 guests
- [ ] AC3: Given a guest responds before the reminder is sent, when the CronJob runs, then no reminder is sent to that guest (RSVP exists)
- [ ] AC4: Given a guest email bounced, when a reminder would be sent via email, then the reminder is not sent (check DeliveryLogs for bounce status)
- [ ] AC5: Given a reminder was sent to a guest within the last 24 hours, when the CronJob runs again, then no duplicate reminder is sent to that guest
- [ ] AC6: Given the Kubernetes CronJob manifest is applied, when `kubectl get cronjobs` is run, then the reminder-scheduler cronjob exists with schedule "0 3 * * *"

## Related Items
- **PRD section:** 06-mvp-features.md (6.3.2 Automated Reminders, US-REM-01, US-REM-02, AC-REM-01, AC-REM-02, AC-REM-03)
- **Architecture:** 02-components.md (Reminder Scheduler CronJob)
- **Data model:** entities.md (Guests, Invitations, RSVPs, DeliveryLogs)

## Blockers
Blocked by: PSRP-010, PSRP-012, PSRP-014

## Branch Name
`feature/PSRP-019-automated-reminders`

(End of file - total 62 lines)