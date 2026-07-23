## 1. Database Updates

- [x] 1.1 Add `ThankYouMessage` (string) and `PhotoGalleryUrl` (string) to the `Event` entity in `Aura.Core`.
- [x] 1.2 Update `EventConfiguration` in `Aura.Infrastructure` to map these new fields.
- [x] 1.3 Create and apply an Entity Framework Core migration (`AddThankYouFields`).

## 2. Worker Project

- [x] 2.1 Create the new `Aura.Workers.ThankYouCards` worker project with Dockerfile.
- [x] 2.2 Add `Aura.Workers.ThankYouCards` to the solution and update all other Dockerfiles to include it in the solution restore step.
- [x] 2.3 Implement the `ThankYouCardWorker` background service (CronJob schedule setup not required in code if using Kubernetes CronJob, but worker execution logic is).
- [x] 2.4 Implement querying logic to fetch events exactly 1 day after `EventDate` with `Status = 'published'`.
- [x] 2.5 For eligible events, fetch guests with RSVP `attendance = 'yes'`.
- [x] 2.6 Enqueue thank you messages via Dragonfly to `email:queue` or `whatsapp:queue` based on `SentVia`.
- [x] 2.7 Include deduplication checks via `DeliveryLogs` where `EntityType = 'thank_you'`.

## 3. Frontend Integration

- [x] 3.1 Update the frontend `Event` interface/model to include `thankYouMessage` and `photoGalleryUrl`.
- [x] 3.2 Update `template-editor.component.ts` and its HTML to include a "Post-Event" section.
- [x] 3.3 Add fields for custom "Thank You Message" and "Photo Gallery URL" in the Event Editor.

## 4. Kubernetes and Infrastructure

- [x] 4.1 Update `k8s/base/kustomization.yaml` to include `worker-thank-you-cards-cronjob.yaml`.
- [x] 4.2 Create `k8s/base/workers/thank-you-cards-cronjob.yaml` as a CronJob running daily at `0 12 * * *`.
