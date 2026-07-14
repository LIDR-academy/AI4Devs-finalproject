# Screenshots — Interactive LMS

Images captured from `http://localhost:8080` (Docker, `LmsDemoSeeder` data).

**Folder on GitHub:** [docs/screenshots](https://github.com/Angel-31/AI4Devs-finalproject/tree/finalproject-ABR/docs/screenshots) · **Rendered in:** [readme.md §9](../../readme.md#9-screenshots)

## Original delivery (calendar, dashboard, courses)

| File | Path | Role | Linked in readme |
|------|------|------|------------------|
| [login.png](./login.png) | `/login` | Guest (legacy capture) | — |
| [login-moodle52.png](./login-moodle52.png) | `/login` | Guest (Moodle 5.2 + ASEMAD) | [§9 Access](../../readme.md#access) |
| [dashboard-teacher.png](./dashboard-teacher.png) | `/dashboard` | Teacher | [§9 Teacher](../../readme.md#teacher-role) |
| [dashboard-full-page.png](./dashboard-full-page.png) | `/dashboard` | Teacher (full page) | — |
| [courses-teacher.png](./courses-teacher.png) | `/courses` | Teacher | [§9 Teacher](../../readme.md#teacher-role) |
| [calendar-teacher.png](./calendar-teacher.png) | `/calendar` | Teacher (Moodle layout) | [§9 Teacher](../../readme.md#teacher-role) |
| [calendar-event-create.png](./calendar-event-create.png) | `/calendar/events/create` | Teacher | [§9 Teacher](../../readme.md#teacher-role) |
| [dashboard-student.png](./dashboard-student.png) | `/dashboard` | Student | [§9 Student](../../readme.md#student-role) |
| [calendar-student.png](./calendar-student.png) | `/calendar` | Student | [§9 Student](../../readme.md#student-role) |

## Moodle 5.2 pack, comms, gradebook, AI (final project)

| File | Path | Role | Linked in readme |
|------|------|------|------------------|
| [upgrade-assistant.png](./upgrade-assistant.png) | `/upgrade-assistant` | Admin — pre-upgrade checks | [§9 Teacher](../../readme.md#teacher-role) |
| [comms-notifications.png](./comms-notifications.png) | `/comms/notifications` | Authenticated | [§9 Teacher](../../readme.md#teacher-role) |
| [comms-messages.png](./comms-messages.png) | `/comms/messages` | Authenticated | [§9 Teacher](../../readme.md#teacher-role) |
| [comms-mail.png](./comms-mail.png) | `/comms/mail` | Authenticated | [§9 Teacher](../../readme.md#teacher-role) |
| [gradebook-teacher.png](./gradebook-teacher.png) | `/courses/1/grades` | Teacher | [§9 Teacher](../../readme.md#teacher-role) |
| [gradebook-mark-teacher.png](./gradebook-mark-teacher.png) | `/courses/1/grades/.../students/...` | Teacher — edit mark form | [§9 Teacher](../../readme.md#teacher-role) |
| [gradebook-course-link.png](./gradebook-course-link.png) | `/courses/1` | Teacher — gradebook entry in course summary | [§9 Teacher](../../readme.md#teacher-role) |

## Responsive (mobile viewport 390px)

| File | Path | Role | Linked in readme |
|------|------|------|------------------|
| [dashboard-teacher-mobile.png](./dashboard-teacher-mobile.png) | `/dashboard` | Teacher | [§9 Responsive](../../readme.md#responsive-mobile) |
| [calendar-teacher-mobile.png](./calendar-teacher-mobile.png) | `/calendar` | Teacher | [§9 Responsive](../../readme.md#responsive-mobile) |

## Playwright CI alternates

Same routes as above; kept for traceability when regenerating from automated runs.

| File | Source view |
|------|-------------|
| [playwright-calendar-teacher.png](./playwright-calendar-teacher.png) | Teacher `/calendar` |
| [playwright-calendar-event-create.png](./playwright-calendar-event-create.png) | Teacher `/calendar/events/create` |
| [playwright-calendar-student.png](./playwright-calendar-student.png) | Student `/calendar` |

**Local demo users:** see `database/seeders/` in the [implementation repository](https://github.com/BurgosAngel/codigofinal/tree/angel-burgos-r/lms-cms-laravel12/database/seeders). Passwords are not listed in this documentation.

**Regenerate all screens** (requires LMS at `http://localhost:8080`):

```bash
npm install
npx playwright install chromium
npm run screenshots
```

Documentation: [readme.md](../../readme.md#9-screenshots).
