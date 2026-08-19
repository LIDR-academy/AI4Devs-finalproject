# UI Contracts: Coachee Home Dashboard & Calendar

**Phase 1 output** — the Coachee-facing surface for the Home dashboard and the color-coded 1-week calendar. It consumes server-provided data only: `GET /coachee/dashboard` (Home) and `GET /classes` with per-class `visibility` (calendar). **No client-side copy of the business rules** (reach, capacity, joinability all come from the server).

## 1. Home screen

### 1.1 Next Class section

| Data | Render |
|---|---|
| `nextClass` present | Card with start date/time (gym timezone `Europe/Madrid`), type label, Coach name, level name + color dot |
| `nextClass` is `null` | Clear empty state: "No upcoming classes" (FR-001) |
| loading | Skeleton/spinner in place of the card |
| request failed | Error state with retry (FR-011) |

### 1.2 Joinable Classes section (10-day window)

- Lists `joinableClasses` in chronological order (gym time), each entry showing start time, level, Coach, and a **Join** action (FR-002).
- Join uses the existing `useJoinClass` hook + `enrollmentErrorMessage` mapping (US-3.1). On success the cache is invalidated/refetched so the class disappears from the joinable list (FR-014); on error the mapped toast shows.
- Empty state when `joinableClasses` is empty (FR-010).
- Individual classes never appear here (server only returns `GROUP`).

### 1.3 Active Waiting Lists count

- A badge/tile showing the number of active waiting lists when `activeWaitingListCount > 0`; hidden when `0` (FR-003).

### 1.4 Refresh

- Mobile: pull-to-refresh gesture (touch-based `usePullToRefresh`) → `refetch` of the dashboard query.
- Desktop: equivalent "Refresh" affordance.
- All states use React Query's `isLoading` / `isError` / `data` (loading, error+retry, empty, data).

## 2. Calendar (1-week, day strip + class cards)

Consumes `GET /classes` for the current gym week (`currentGymWeekBounds()`, Monday→Sunday in `Europe/Madrid`) with prev/next week navigation. Rendered as a **selectable day strip** (one column per day: weekday label + day number, today highlighted, selected day ringed) followed by the **cards for the selected day** — only blue/green classes on that day appear as cards. Day/grouping math is a pure util (`coacheeWeekView.ts`); dot/card colors come from `coacheeCalendarEvents.ts`:

| Server `visibility` | Color | Day-strip dot | Card + action |
|---|---|---|---|
| `blue` (own class) | `#3b82f6` | blue dot | card with class title, **Cancel enrollment** action (`useCancelEnrollment`) |
| `green` (joinable) | `#10b981` | green dot | card with class title, **Enroll** button (`useJoinClass`) |
| `gray` (other/busy/full/out-of-reach) | `#6b7280` | gray dot | **hidden from the card list** (not enrolled, not joinable) |
| `CANCELED` class | `#6b7280` (gray) — overrides `visibility` | gray dot | card shows a "Canceled" marker, no action |

- A colored dot appears under a day number for **every** class that day (enrolled or not, up to 3 dots then `+N`), colored by visibility.
- **Cards are scoped to the selected day**: the list below the strip only shows blue/green classes belonging to the tapped day (defaults to today; re-selects today when navigating back to the current week). A day with no blue/green classes shows a "No classes on this day." note.
- Only `blue`/`green` classes render as cards; gray/busy classes never appear in the card list and never show a coachee name.
- No admin/coach filters, no add-class affordances in the Coachee view (coachees have no create access).
- **Loading** state while the week query loads; **empty** card-list state when the week has no blue/green classes; **error** state with retry (FR-009/FR-010/FR-011).
- Colors are **only** derived from `visibility`; the frontend never recomputes reach/capacity (FR-006, D5).
- On class actions (join/cancel) the affected view refreshes so colors/entries update (FR-014).

## 3. Waiting-list affordance (scope boundary)

Waiting-list join/leave stays in US-3.3 scope. The coachee calendar card list only surfaces `blue`/`green` classes, so there is no waiting-list affordance on the calendar itself; gray/busy entries are hidden by design.

## 4. Error-to-message mapping (reuses US-3.1)

| `error.code` | Coachee-facing message (existing map) |
|---|---|
| `CLASS_FULL` | "Class is full." / "Clase completa." |
| `LEVEL_MISMATCH` | "Level mismatch — this class requires a different level." |
| `OVERLAP_DETECTED` | "You already have a class at this time." |
| `ALREADY_ENROLLED` | "You are already enrolled in this class." |
| `NOT_FOUND` | "The class or enrollment was not found." |
| `FORBIDDEN` | "You don't have permission to do that." |
| `VALIDATION_ERROR` | Generic validation message for the action. |
| unknown / network | Generic "Something went wrong, please try again." |

Toasts; never surface `error.ref`. Dashboard/calendar load failures use a view-level error state with a retry button — not a toast.