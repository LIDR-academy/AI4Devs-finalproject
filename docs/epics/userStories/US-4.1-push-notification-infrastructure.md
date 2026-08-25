# US-4.1: Push Notification Infrastructure

**Part of:** US-4.1 — Push Notification Infrastructure
**Epic:** EP-04 — Notifications & Automation

## Tasks

- [ ] T-4.1.1: **Backend** — Define `NotificationSender` port interface in domain layer with domain types (no FCM-specific types in interface)
- [ ] T-4.1.2: **Backend** — Implement `FCMNotificationAdapter` using Firebase Admin SDK HTTP v1 API, handle token management, delivery confirmation, and error logging
- [ ] T-4.1.3: **Backend** — Implement device token registration endpoint (`POST /notifications/device-token`) for frontend to register FCM tokens
- [ ] T-4.1.4: **Backend** — Wire `NotificationSender` via dependency injection, create base `SendNotificationService` that orchestrates storage + push
- [ ] T-4.1.5: **Backend** — Create Notification entity in Prisma schema (id, notificationType 1-12, recipientId, classId nullable, content, isRead, sentAt, createdAt) + migration
- [ ] T-4.1.6: **Frontend** — Configure service worker (`vite-plugin-pwa` / Workbox) to handle push events and display notifications
- [ ] T-4.1.7: **Frontend** — Implement notification permission request flow (browser prompt) and register device token with backend on login

---

