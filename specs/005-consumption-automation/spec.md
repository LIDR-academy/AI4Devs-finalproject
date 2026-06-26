# Feature Specification: Consumption Automation for Long-Expired Items

**Feature Branch**: `005-consumption-automation`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "docs/tickets/extendedMVP/EXT-010-consumption-automation.md — Consumption Automation for Long-Expired Items"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review and resolve expired items in bulk (Priority: P1)

A user opens their pantry and sees a banner telling them that several items have been
sitting past their expiry date for a long time. The user opens a review screen, sees the
list of stale items with how long each has been expired and its estimated value, and either
marks them all as wasted in one action or keeps specific items they still intend to use.
After resolving, the banner disappears and the pantry list is accurate again.

**Why this priority**: This is the core value of the feature — letting users keep their
pantry accurate without visiting every old item individually. It delivers a usable MVP on its
own even without any automation: the user is proactively surfaced ghost items and can clear
them in one place.

**Independent Test**: Seed a pantry with one item expired beyond the threshold, load the
pantry view, confirm the banner appears, open the review screen, mark the item as wasted, and
confirm the banner disappears and the item is recorded as wasted.

**Acceptance Scenarios**:

1. **Given** a pantry item expired for more than the configured threshold (default 14 days),
   **When** the user opens the pantry, **Then** a banner indicates how many items may be
   expired and offers a way to review them.
2. **Given** the review screen is open with stale candidates, **When** the user chooses "Mark
   all as wasted", **Then** every candidate is recorded as wasted, removed from the active
   pantry, and the banner disappears.
3. **Given** the review screen is open, **When** the user keeps a specific item, **Then** that
   item remains in the pantry in its current state and is removed from the candidate list.
4. **Given** the review screen is open, **When** the user chooses "Dismiss all", **Then** all
   items stay in the pantry and the banner is suppressed for the grace period (7 days).

---

### User Story 2 - Automatic cleanup after a grace period (Priority: P2)

A user is notified that they have stale expired items but takes no action. After a grace
period of 7 days, the system automatically marks those items as wasted on the user's behalf so
the pantry does not accumulate ghost items indefinitely. The waste records are clearly tagged
as automatic so the user can distinguish them from manual decisions.

**Why this priority**: Automation closes the loop for users who never engage with the digest,
which is the main reason ghost items accumulate. It depends on the candidate-detection and
waste mechanics from Story 1, so it is built second.

**Independent Test**: Seed an unresolved digest dated more than 7 days ago with stale
candidate items, run the auto-resolve process, and confirm each candidate is recorded as
wasted with an automatic tag and the digest is marked resolved.

**Acceptance Scenarios**:

1. **Given** a pending digest older than the 7-day grace period with unresolved stale items,
   **When** the auto-resolve process runs, **Then** each item is recorded as wasted with an
   automatic-expiry tag and the digest is marked auto-resolved.
2. **Given** a pending digest younger than the 7-day grace period, **When** the auto-resolve
   process runs, **Then** no items are auto-wasted.
3. **Given** a user resolved their items manually before the grace period elapsed, **When** the
   auto-resolve process runs, **Then** nothing further happens to those items.

---

### User Story 3 - Control automation via settings (Priority: P3)

A user who prefers full manual control opens settings and turns off automatic expiry, or
adjusts how many days an item must be expired before it becomes a candidate. With automation
off, the user is never sent a digest and items are never auto-wasted.

**Why this priority**: Opt-out and threshold control protect user trust and prevent unwanted
deletions, but the feature is still demonstrable without them. It refines, rather than enables,
the core flow.

**Independent Test**: Toggle auto-expiry off in settings, run the daily detection process, and
confirm no digest is created for that user; toggle on with a custom threshold and confirm the
threshold is honored.

**Acceptance Scenarios**:

1. **Given** a user with automatic expiry disabled, **When** the daily detection process runs,
   **Then** no digest is created and no items are auto-wasted for that user.
2. **Given** a user sets a custom threshold within the allowed range (7–60 days), **When**
   detection runs, **Then** only items expired beyond that custom threshold are flagged.
3. **Given** a user submits a threshold outside the allowed range, **When** they try to save,
   **Then** the change is rejected with a clear validation message.

---

### Edge Cases

- What happens when a user has no stale items? No banner is shown and no digest is created.
- What happens when detection runs and a pending digest already exists for the user within the
  last 7 days? No new digest is created and the same candidates are not re-notified.
- What happens when a user dismisses all items but the items remain expired in the pantry? The
  banner is suppressed for 7 days, after which the items resurface as candidates.
- What happens when one item in a bulk-waste request fails to process? The whole bulk action is
  rolled back and the user is told which items could not be wasted so they can retry.
- What happens when a bulk request contains an item that does not belong to the user? The
  request is rejected; no cross-user items are ever wasted.
- What happens when the notification delivery capability is unavailable? The digest is still
  recorded and the in-app banner serves as the fallback; the missing notification does not
  fail the process.
- What happens when the auto-resolve process fails for one user? The error is isolated to that
  user and the process continues for the remaining users.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST identify pantry items that are active and expired beyond the user's
  configured threshold (default 14 days) as stale candidates.
- **FR-002**: System MUST exclude items already covered by a pending digest issued within the
  last 7 days from being re-flagged as new candidates.
- **FR-003**: System MUST expose, per user, the current list of stale candidates including each
  item's name, expiration date, number of days expired, and estimated value when available,
  along with the identifier of any pending digest.
- **FR-004**: System MUST allow a user to mark a selected set of stale candidates as wasted in a
  single bulk action, recording a waste event for each.
- **FR-005**: System MUST treat a bulk-waste action atomically: if any item cannot be wasted,
  no items are wasted and the user is informed which items failed.
- **FR-006**: System MUST allow a user to dismiss a selected set of candidates, keeping the
  items in the pantry unchanged and suppressing them from the banner for the grace period.
- **FR-007**: System MUST resolve the active digest when the user completes a bulk-waste or
  bulk-dismiss action.
- **FR-008**: System MUST run a daily detection process that, for each user with automatic
  expiry enabled, creates a pending digest and requests a digest notification when stale
  candidates exist and no pending digest was issued in the last 7 days.
- **FR-009**: System MUST run an auto-resolve process that, for each pending digest older than
  the 7-day grace period, marks the still-stale candidate items as wasted with an
  automatic-expiry tag and records the digest as auto-resolved.
- **FR-010**: System MUST distinguish automatically wasted items from manually wasted items via
  a persisted automatic-expiry tag on the waste record.
- **FR-011**: System MUST let a user enable or disable automatic expiry; when disabled, the user
  receives no digest and has no items auto-wasted.
- **FR-012**: System MUST let a user configure the staleness threshold within an allowed range
  of 7 to 60 days and reject values outside that range with a clear message.
- **FR-013**: System MUST expose the user's current automatic-expiry setting and threshold.
- **FR-014**: System MUST show a banner on the pantry view when stale candidates exist and hide
  it once all candidates are resolved or dismissed.
- **FR-015**: System MUST restrict every bulk and settings action to the authenticated user's
  own items and settings; no action may affect another user's data.
- **FR-016**: System MUST degrade gracefully when the notification capability is unavailable by
  still recording the digest and relying on the in-app banner, without failing the process.
- **FR-017**: System MUST isolate per-user failures in the daily and auto-resolve processes so a
  failure for one user does not stop processing for others.
- **FR-018**: System MUST default new and existing users to automatic expiry enabled with a
  14-day threshold without losing any existing data.

### Key Entities *(include if feature involves data)*

- **Stale Candidate**: A pantry item that is active and expired beyond the user's threshold.
  Carries the item's name, expiration date, days expired, and estimated value. Derived from
  existing pantry items rather than stored separately.
- **Auto-Expiry Digest**: A per-user record of a batch of stale candidates surfaced to the user
  at a point in time. Tracks when it was sent, its resolution state (pending, user-resolved,
  auto-resolved), and when it was resolved.
- **Waste Record**: An existing consumption record marking an item as wasted, extended to
  capture whether the waste was automatic (long-expired auto-cleanup) versus user-initiated.
- **Automatic-Expiry Setting**: Per-user preference holding whether automatic expiry is enabled
  and the staleness threshold in days, stored alongside the user's existing notification
  preferences.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A pantry item expired beyond the default 14-day threshold appears as a stale
  candidate and surfaces in the pantry banner the next time the user views their pantry.
- **SC-002**: A user can clear all stale candidates from their pantry in a single bulk action in
  under 30 seconds from opening the review screen.
- **SC-003**: Items left unresolved are automatically wasted no earlier than 7 days after the
  user was notified, and never before.
- **SC-004**: Users with automatic expiry disabled receive zero digests and have zero items
  auto-wasted over any period.
- **SC-005**: 100% of automatically wasted items are distinguishable from manually wasted items
  in the user's consumption history.
- **SC-006**: No bulk or settings action ever affects an item or setting that does not belong to
  the requesting user (zero cross-user effects).
- **SC-007**: When the notification capability is unavailable, 100% of eligible users still have
  their stale items surfaced via the in-app banner.

## Assumptions

- **Dismiss duration**: "Dismiss all" suppresses the banner for the 7-day grace period rather
  than permanently. If the items remain in the pantry and still expired after 7 days, they
  resurface as candidates (resolves ticket Open Question 1, per its recommendation).
- **Post-auto-resolve summary**: After the auto-resolve process wastes items, the system sends a
  summary notification ("N items were automatically marked as wasted") only when the
  notification capability is available; otherwise it is skipped silently (resolves ticket Open
  Question 2, per its recommendation).
- **Grace period**: The grace period between notifying the user and auto-wasting is fixed at 7
  days and is not user-configurable in this feature.
- **Threshold range**: The configurable staleness threshold is bounded to 7–60 days, with a
  default of 14 days.
- **Schedule cadence**: Daily detection runs once per day; auto-resolution is evaluated on a
  regular recurring schedule. Exact run times are an implementation detail.
- **Single threshold**: A single global threshold per user applies to all items; per-category
  thresholds are out of scope (Non-Goal).
- **Undo**: There is no dedicated undo for auto-waste; recovery uses the existing re-add flow
  (Non-Goal).
- **Reused capabilities**: The feature reuses the existing consumption-event/waste mechanism,
  the existing user notification-preferences storage, and the existing notification-delivery
  capability where present.
- **Estimated value**: Estimated value is shown when available for an item and omitted when not;
  its absence does not block any action.
