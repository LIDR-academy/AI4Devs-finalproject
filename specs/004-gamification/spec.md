# Feature Specification: Gamification and Achievement System

**Feature Branch**: `004-gamification`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "docs/tickets/extendedMVP/EXT-009-gamification.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Earn and see points for handling food (Priority: P1)

A user consumes or discards pantry items as part of their normal routine. Each time
they consume an item before it expires, they earn points; each time they let an item
go to waste, they lose points. The user can see their running point total update
immediately so the effort of reducing waste feels rewarded.

**Why this priority**: The points loop is the heart of the gamification system. Without
it, there are no badges, no history, and no motivation mechanic. It is the smallest
slice that delivers standalone value: a user can consume an item and watch their score
grow. Everything else builds on this signal.

**Independent Test**: Consume an item before its expiry date and confirm the point total
increases by the expected amount on the dashboard; waste an item and confirm the total
decreases — all without any badge or history feature present.

**Acceptance Scenarios**:

1. **Given** a user with a pantry item that has not yet expired, **When** they mark it as
   consumed, **Then** their point total increases by 10.
2. **Given** a user consuming an item with 3 or more days remaining before expiry,
   **When** they mark it as consumed, **Then** they receive an additional 5-point bonus
   (15 points total for that item).
3. **Given** a user consuming an item on or after its expiry date, **When** they mark it
   as consumed, **Then** no points are awarded for that item (the consumption is still
   recorded).
4. **Given** a user with a pantry item, **When** they mark it as wasted, **Then** their
   point total decreases by 5.
5. **Given** a user whose deductions exceed their earnings, **When** they view their point
   total, **Then** the displayed total is shown as 0 rather than a negative number.
6. **Given** the points calculation encounters an internal error, **When** a user consumes
   or wastes an item, **Then** the consume/waste action still succeeds and the error does
   not surface to the user.

---

### User Story 2 - Unlock achievement badges (Priority: P2)

As the user builds better habits, the system recognizes milestones by awarding badges —
their first save, reaching cumulative saving milestones, going a full week without waste,
and saving a meaningful amount of money. The user can browse all badges on an
achievements page, seeing which they have earned and what is required to unlock the rest.

**Why this priority**: Badges turn a numeric score into memorable accomplishments and give
users medium- and long-term goals. They depend on the points/consumption signal from
User Story 1 but add a distinct layer of motivation and a richer UI surface.

**Independent Test**: Consume the first qualifying item and confirm the "First Save" badge
appears as earned on the achievements page, while unearned badges show in a locked state
with their unlock requirement.

**Acceptance Scenarios**:

1. **Given** a user who has never consumed an item before expiry, **When** they consume
   their first item before expiry, **Then** the "First Save" badge is awarded and is not
   awarded a second time on subsequent saves.
2. **Given** a user reaching 10, 50, or 100 items consumed before expiry, **When** the
   corresponding threshold is crossed, **Then** the matching milestone badge is awarded
   once.
3. **Given** a user whose cumulative value of items saved (consumed, not wasted) reaches
   €10, **When** the threshold is crossed, **Then** the money-saver badge is awarded once.
4. **Given** a user who records no wasted items during a calendar week (Monday–Sunday),
   **When** the week ends, **Then** the "Zero Waste Week" badge is awarded for that week.
5. **Given** a user viewing the achievements page, **When** the page loads, **Then**
   earned badges are shown in full colour and unearned badges are shown in a locked
   (greyed) state alongside the condition required to unlock them.
6. **Given** a badge has already been earned, **When** its condition is evaluated again,
   **Then** no duplicate badge is created.

---

### User Story 3 - Review points history (Priority: P3)

A user wants to understand how their score was built — which actions earned points, which
deducted them, and when badges were unlocked. The system presents a chronological,
paginated history of point changes and badge awards with a human-readable reason for each.

**Why this priority**: History adds transparency and trust to the scoring system but is
not required for the core motivational loop. Users can earn points and badges (US1, US2)
without it; it enhances comprehension rather than enabling the mechanic.

**Independent Test**: After consuming and wasting several items, open the history view and
confirm each point change and badge award appears as a dated entry with a clear reason,
paginated in pages of a fixed size.

**Acceptance Scenarios**:

1. **Given** a user who has earned and lost points, **When** they open their history,
   **Then** they see a reverse-chronological list of entries, each showing the point
   change (or badge earned), a reason, and the time it occurred.
2. **Given** a user with more history entries than fit on one page, **When** they request
   the next page, **Then** the subsequent set of entries is returned and the total count
   of entries is available.

---

### Edge Cases

- **Item with no expiry date**: If a consumed item has no recorded expiry date, it is
  treated as consumed without the before-expiry bonus (base behaviour: no expiry-based
  points), and it does not count toward "consumed before expiry" milestones.
- **Consuming exactly on the expiry date**: Treated as not before expiry — no points
  awarded (see US1 scenario 3).
- **Repeated badge evaluation / retries**: Re-evaluating an already-earned badge is a
  no-op; the user never sees the same badge awarded twice.
- **Negative running total**: Internally the score may go negative, but the value shown to
  the user is clamped to 0 (see US1 scenario 5).
- **Notification channel unavailable**: If the badge push-notification channel is not
  available, the badge is still recorded; only the notification is skipped.
- **Week with no activity at all**: A week in which the user records neither consumed nor
  wasted items does not earn a "Zero Waste Week" badge (the badge rewards active weeks
  with zero waste, not inactivity).
- **Concurrent events crossing a threshold**: If two qualifying events are processed close
  together, a milestone badge is still awarded exactly once.

## Requirements *(mandatory)*

### Functional Requirements

#### Points

- **FR-001**: System MUST award 10 points when a user consumes an item before its expiry
  date.
- **FR-002**: System MUST award an additional 5-point bonus (15 total) when a consumed
  item had 3 or more days remaining before expiry at the time of consumption.
- **FR-003**: System MUST award 0 points when an item is consumed on or after its expiry
  date, while still recording the consumption.
- **FR-004**: System MUST deduct 5 points when a user marks an item as wasted.
- **FR-005**: System MUST record each point change with the reason for the change and a
  reference to the consumption/waste action that triggered it, for auditability.
- **FR-006**: System MUST compute and expose a user's current total points, total value
  saved, total value wasted, count of items consumed before expiry, and count of items
  wasted.
- **FR-007**: System MUST display the user-facing point total clamped to a minimum of 0,
  even when internal deductions exceed earnings.

#### Badges

- **FR-008**: System MUST award a "First Save" badge the first time a user consumes an
  item before its expiry date.
- **FR-009**: System MUST award milestone badges when a user reaches 10, 50, and 100 items
  consumed before expiry.
- **FR-010**: System MUST award a money-saver badge when the cumulative value of items
  saved (consumed before expiry) reaches €10.
- **FR-011**: System MUST award a "Zero Waste Week" badge for any Monday–Sunday calendar
  week in which the user records at least one item event and no wasted items.
- **FR-012**: System MUST award each distinct badge to a user at most once and MUST treat
  re-evaluation of an already-earned badge as a no-op.
- **FR-013**: System MUST record the date and time each badge was earned.
- **FR-014**: System MUST present every badge to the user with a label and a description,
  indicating for each whether it is earned (with its earned date) or locked (with the
  condition required to unlock it).

#### Streak & Summary

- **FR-015**: System MUST compute a weekly streak representing the number of consecutive
  zero-waste weeks and expose it in the user's summary.

#### History

- **FR-016**: System MUST provide a chronological history of point changes and badge
  awards, each entry including its type, point value (where applicable), badge reference
  (where applicable), a human-readable reason, and the time it occurred.
- **FR-017**: System MUST paginate the history and expose the total number of entries.

#### Cross-cutting

- **FR-018**: System MUST ensure that any failure in points or badge computation never
  causes the underlying consume/waste action to fail; such failures MUST be logged and
  otherwise suppressed.
- **FR-019**: System MUST send a notification when a badge is earned, when a notification
  channel is available; if no channel is available, the badge MUST still be recorded and
  the notification skipped without error.
- **FR-020**: System MUST restrict all gamification data to the authenticated user; a user
  MUST NOT be able to view or affect another user's points, badges, or history.
- **FR-021**: System MUST reflect newly earned points in the user's visible total
  immediately after a consume action completes.

### Key Entities *(include if feature involves data)*

- **Point Change**: A single adjustment to a user's score. Holds the user it belongs to,
  the signed point amount (positive for earned, negative for deducted), the reason, an
  optional reference to the triggering consumption/waste action, and the time it occurred.
- **Badge Award**: A record that a user has earned a specific badge. Holds the user, the
  badge identifier/code, and the time it was earned. A user can hold each badge code only
  once.
- **Gamification Summary**: A derived, read-only view aggregating a user's totals — total
  points (clamped for display), value saved, value wasted, counts of consumed-before-expiry
  and wasted items, the list of earned badges, and the current weekly zero-waste streak.
- **Consumption/Waste Event** *(existing)*: The already-recorded signal (item consumed or
  wasted, with estimated value, expiry date, and timestamp) that drives all gamification
  computation. This feature reads from it but does not change its meaning.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After a user consumes an item before its expiry, their updated point total is
  visible within 2 seconds of the action completing.
- **SC-002**: 100% of consume/waste actions succeed even when points or badge computation
  fails (zero user-facing failures attributable to gamification).
- **SC-003**: Each badge is awarded to a given user at most once across any number of
  qualifying events (no duplicate awards observed).
- **SC-004**: Points are calculated correctly for 100% of the defined scenarios (before
  expiry, before expiry with 3+ days bonus, on/after expiry, wasted).
- **SC-005**: The achievements page distinguishes earned from locked badges and displays an
  unlock condition for every locked badge.
- **SC-006**: A user can never see, query, or alter another user's points, badges, or
  history (0 cross-user data exposures).
- **SC-007**: The points history is browsable in pages of a fixed size and the total entry
  count is available for navigation.

## Assumptions

- **Scoring values are fixed** at the documented amounts (+10 / +5 bonus / 0 / −5) and the
  3-day bonus threshold; these are not user-configurable in this release.
- **Per-item point indicators are out of scope** for the pantry list view — points are
  surfaced only in the dashboard summary widget and on the achievements page (resolves
  ticket Open Question 1 in favour of keeping the pantry list uncluttered).
- **Negative totals are clamped to 0** in all user-facing displays while the raw signed
  history is preserved internally (resolves ticket Open Question 2 in favour of not
  punishing users below zero).
- **Weeks are defined as Monday–Sunday** in a single, consistent time zone for streak and
  zero-waste-week evaluation; UTC is assumed unless the existing system already standardises
  on another zone.
- **The consumption/waste event signal already exists** and reliably records item type,
  estimated value, expiry date, and timestamp; this feature consumes that signal and does
  not modify how events are produced.
- **Badge notifications reuse the existing notification delivery capability** (EXT-001) when
  available; this feature degrades gracefully to recording-only when it is not.
- **Items consumed without an expiry date** receive base treatment (no expiry bonus) and do
  not count toward before-expiry milestones.
- **Authentication is already in place**; gamification endpoints reuse the existing
  authenticated-user identity.

## Dependencies

- **Consumption events (TKT-009)** — completed; provides the event signal this feature
  reads.
- **Notification delivery (EXT-001)** — optional at runtime; used for badge push
  notifications when available, otherwise badge awards are recorded without notifying.

## Out of Scope (Non-Goals)

- Cross-user leaderboards or social comparison.
- CO₂-equivalent or environmental-impact calculations.
- Points decay over time.
- Points redemption, rewards, or any monetary/coupon value.
