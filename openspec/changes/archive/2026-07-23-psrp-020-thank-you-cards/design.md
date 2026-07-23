## Context

After an event concludes, hosts often want to express gratitude to attendees and share moments from the celebration (e.g., a photo gallery). Currently, hosts must do this manually outside the Aura platform. This feature automates the process by checking for events that occurred one day ago and sending a customizable thank you message to all attendees via their original invitation channel (email or WhatsApp).

## Goals / Non-Goals

**Goals:**
- Automatically dispatch thank you messages to attendees (RSVP='yes') exactly 1 day after the event.
- Support a customizable thank you message and an optional photo gallery link.
- Route messages seamlessly through the existing `email:queue` and `whatsapp:queue` using Dragonfly.
- Prevent duplicate dispatches using `DeliveryLogs`.

**Non-Goals:**
- Sending thank you messages to guests who did not attend (RSVP='no' or pending).
- Creating an internal photo gallery hosting feature (we only support external URLs).

## Decisions

### 1. Dedicated Worker Project
**Decision**: Create a new worker project `Aura.Workers.ThankYouCards`.
**Rationale**: Keeping the thank-you logic in its own worker maintains separation of concerns, similar to how Reminders are handled. It will be configured as a Kubernetes CronJob running at 04:00 UTC.

### 2. Event Model Enhancements
**Decision**: Add `ThankYouMessage` (string, max length 1000) and `PhotoGalleryUrl` (string, max length 500) to the `Event` entity.
**Rationale**: Storing this at the event level allows the host to configure it once in the Event Editor. The default message will be "Thank you for celebrating with us!" if the field is left empty.

### 3. Query Strategy
**Decision**: The worker queries for `EventDate` where `EventDate::date == (NOW() - 1 day)::date` and `Status == 'published'`. It then fetches all `Guests` for those events joined with `RSVPs` where `Attendance == 'yes'`. 
**Rationale**: Running this query daily captures all events that just finished, ensuring timely communication.

## Risks / Trade-offs

- **Risk:** Timezone discrepancies might cause messages to be sent slightly early or late depending on the user's local timezone versus the server's UTC time.
  - **Mitigation:** The CronJob is scheduled at 04:00 UTC, which ensures the date has safely rolled over globally for most western timezones, providing a reasonable delay after the event night.

## Migration Plan

1. Create the new EF Core migration for the `Events` table changes.
2. Update the frontend `template-editor.component.ts` to include the new fields.
3. Deploy the new `Aura.Workers.ThankYouCards` Docker container and the corresponding `thankyou-cronjob.yaml` K8s manifest.
