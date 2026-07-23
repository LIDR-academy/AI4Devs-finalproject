## Why

Implement automated post-event thank you cards to enhance the guest experience after an event. Sending personalized thank you messages, optionally with a photo gallery link, one day after the event saves hosts time and ensures attendees feel appreciated. 

## What Changes

- Add a new `ThankYouCardWorker` CronJob that runs daily at 04:00 UTC.
- Implement a query to find published events where `EventDate` was exactly 1 day ago.
- For these events, find guests who attended (RSVP attendance='yes').
- Enqueue thank you messages via Dragonfly to the `email:queue` or `whatsapp:queue` based on the guest's original invitation channel.
- Add `ThankYouMessage` and `PhotoGalleryUrl` fields to the `Events` database table.
- Update the Event Editor UI in the frontend to include a "Post-Event" section for configuring the custom message and gallery link.
- Implement deduplication logic checking `DeliveryLogs` to ensure guests do not receive multiple thank you messages for the same event.

## Capabilities

### New Capabilities
- `thank-you-cards`: Automated daily worker that queries eligible guests 1 day post-event and schedules customized thank you cards via their original communication channel.

### Modified Capabilities
- `event-management`: Adding `ThankYouMessage` and `PhotoGalleryUrl` configuration fields to the Event model and the Event Editor UI.

## Impact

- **Database**: Adds two new fields to the `Events` table, requiring an Entity Framework migration.
- **Backend Workers**: New Kubernetes CronJob manifest and worker logic (either in `Aura.Workers.Email` or a dedicated worker project).
- **Frontend UI**: Modifications to the `template-editor.component.ts` to support the new Post-Event section.
- **Queues**: Increased usage of Dragonfly for `email:queue` and `whatsapp:queue` with a new `thank_you` message type.
