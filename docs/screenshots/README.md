# Screenshots — Interactive LMS

Images captured from `http://localhost:8080` (Docker, `LmsDemoSeeder` data).

## Original delivery (calendar, dashboard, courses)

| File | Path | Role |
|------|------|------|
| `login.png` | `/login` | Guest (legacy capture) |
| `login-moodle52.png` | `/login` | Guest (Moodle 5.2 style + ASEMAD branding) |
| `dashboard-teacher.png` | `/dashboard` | Teacher |
| `courses-teacher.png` | `/courses` | Teacher |
| `calendar-teacher.png` | `/calendar` | Teacher (Moodle layout) |
| `calendar-event-create.png` | `/calendar/events/create` | Teacher |
| `dashboard-student.png` | `/dashboard` | Student |
| `calendar-student.png` | `/calendar` | Student |

## Moodle 5.2 pack, comms, gradebook, AI (final project)

| File | Path | Role |
|------|------|------|
| `upgrade-assistant.png` | `/upgrade-assistant` | Teacher — pre-upgrade health checks |
| `comms-notifications.png` | `/comms/notifications` | Any authenticated user |
| `comms-messages.png` | `/comms/messages` | Any authenticated user |
| `comms-mail.png` | `/comms/mail` | Any authenticated user |
| `gradebook-teacher.png` | `/courses/{course}/grades` | Teacher — multi-grader gradebook |
| `ai-grill-me.png` | `/lessons/{lesson}` | Teacher — AI assistant + Grill me panel |

**Credentials:** `teacher@example.com` / `student@example.com` — password `password123`.

**Regenerate new screens:** from this repo (requires LMS running at `http://localhost:8080`):

```bash
npm install
npx playwright install chromium
npm run screenshots
```

Documentation: [readme.md](../../readme.md#9-screenshots).
