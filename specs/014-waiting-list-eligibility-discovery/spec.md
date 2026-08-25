# Feature Specification: Waiting List Eligibility Discovery

**Feature Branch**: `014-waiting-list-eligibility-discovery`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "US-3.4 (COACHER-N) — Waiting List Eligibility Discovery — As a coachee, I should be able to see the potential group classes that I am able to join its waiting list."

**Top-level goal**: Give Coachees a discovery surface that lists the group classes they can currently join a waiting list for (full, within level reach ±1, not already enrolled, not already on the list, waiting list has a free slot), each with a functional "Join waiting list" action that reuses the existing US-3.3 join/leave backend.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover which full group classes I can join a waiting list for (Priority: P1)

A Coachee opens their Coachee Home screen and sees a "Waiting List Opportunities" section listing the group classes they are eligible to join a waiting list for right now: group classes at full capacity (4 of 4 spots taken), within the Coachee's level reach (their level, one above, or one below), that the Coachee is not enrolled in and is not already on the waiting list for, and whose waiting list has a free slot (fewer than 4 members). Every entry shows the class type, date and time, level, assigned Coach, and enrollment count (4/4). Eligibility is computed server-side on every fetch using exactly the same rules the join endpoint enforces — the client never decides eligibility. When there are no eligible classes, the section shows a clear empty state that is distinct from the open-spot "Joinable Classes" section, and no individual classes ever appear in it.

**Why this priority**: This is the core of the story. Today a full-but-within-reach group class is classified "gray" by the ClassVisibility policy — indistinguishable from an out-of-reach class — the dashboard's joinableClasses only ever contains classes with open spots, and the calendar hides gray classes entirely. The 013 join flow exists but is effectively unreachable because nothing tells the frontend which full classes a Coachee may join a waiting list for. Without this discovery surface the rest of the feature has no entry point.

**Independent Test**: Can be fully tested by a Coachee with a valid level verifying that a full within-reach group class with a free waiting-list slot appears in the discovery section, while a full out-of-reach class, a partially-full class, an enrolled class, a class they are already waitlisted on, a class with a full waiting list, a canceled class, and any individual class all remain absent and the empty state renders when nothing qualifies — it delivers the waiting-list discovery surface on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee authenticated with a valid level and an ACTIVE group class at full capacity (4/4) within reach with a waiting list that has a free slot, and the Coachee is not enrolled and not on the waiting list, **When** the Coachee Home loads, **Then** the class appears in the "Waiting List Opportunities" section showing the class type, date and time, level, assigned Coach, and enrollment count (4/4).
2. **Given** a full group class whose level is outside the Coachee's reach (two or more levels away), **When** the Coachee Home loads, **Then** the class is not listed in the discovery section.
3. **Given** a group class with an open spot (3/4) within reach, **When** the Coachee Home loads, **Then** the class appears in the open-spot "Joinable Classes" section and is NOT listed in the discovery section — the two sections are mutually exclusive.
4. **Given** a full group class in which the Coachee is already enrolled, **When** the Coachee Home loads, **Then** the class is not listed in the discovery section.
5. **Given** a full group class whose waiting list the Coachee is already on, **When** the Coachee Home loads, **Then** the class is not listed in the discovery section (it is surfaced by MyWaitingLists instead).
6. **Given** a full group class whose waiting list already has 4 members, **When** the Coachee Home loads, **Then** the class is not listed in the discovery section.
7. **Given** a CANCELED group class or any INDIVIDUAL class, **When** the Coachee Home loads, **Then** it is never listed in the discovery section.
8. **Given** a Coachee for whom no full within-reach group class qualifies, **When** the Coachee Home loads, **Then** the discovery section renders an empty state (not an error) that reads differently from the open-spot empty state.
9. **Given** the dashboard response for the authenticated Coachee, **When** the discovery payload is inspected, **Then** every listed entry exposes only id, classType (`GROUP`), startTime, level, assignedCoach, enrollmentCount, capacity, isWithinReach, and isOnWaitingList, and reveals no other Coachee identities.

---

### User Story 2 - Join the waiting list of a full group class from the discovery surface (Priority: P1)

A Coachee taps "Join waiting list" on an eligible full group class in the discovery section, confirms in the dialog, and the join is performed by the existing `POST /classes/:id/waiting-list` endpoint — no new join logic. On success the Coachee receives confirmation identifying the class, the class is immediately removed from the discovery section, the "on waiting list" badge count increments by one, and the class appears under MyWaitingLists — all without a full page reload, because a successful join refreshes the dashboard, the class list, and the waiting-lists queries (this fixes the current gap where `useJoinWaitingList` does not invalidate the dashboard query). If the join is refused for any reason, the Coachee sees a clear, specific, user-friendly message and the surface re-syncs from the server so it no longer offers an ineligible class.

**Why this priority**: A discovery list with no working action has no value — this is the action that converts the surface into the actual waitlisting mechanism. It reuses the fully-implemented US-3.3 backend, so the only new server work is the eligibility signal; making the join refresh the dashboard closes a real bug where the Home badge and sections would render stale state after joining.

**Independent Test**: Can be fully tested by a Coachee joining a listed full group class and verifying the confirmation, the class's immediate removal from the discovery list, the incremented badge, the new MyWaitingLists entry, and the immediate re-sync of the dashboard queries — it delivers a working, self-service join action on its own.

**Acceptance Scenarios**:

1. **Given** an eligible full group class listed in the discovery section, **When** the Coachee taps "Join waiting list" and confirms, **Then** the existing `POST /classes/:id/waiting-list` is invoked with identity taken exclusively from the authenticated session, the Coachee receives confirmation, the class is removed from the discovery section, the active waiting-list count increments by one, and MyWaitingLists shows the new entry — all without a full page reload.
2. **Given** a successful join, **When** the mutation completes and queries are invalidated, **Then** the `["coachee", "dashboard"]`, `["classes"]`, and `["waiting-lists"]` React Query keys are all refreshed (the missing dashboard invalidation in `useJoinWaitingList` is fixed).
3. **Given** a full group class whose waiting list has filled to 4 members after the section rendered (stale data), **When** the Coachee attempts to join, **Then** the join is refused with the "waiting list is full" message, no entry is recorded, and after refetch the class disappears from the discovery section.
4. **Given** a class whose spot opened (no longer full) after the section rendered, **When** the Coachee attempts to join, **Then** the join is refused with a clear message directing them to the normal join flow, no waiting-list entry is recorded, and after refetch the class leaves the discovery section and appears in the open-spot "Joinable Classes" section.
5. **Given** stale data in which the Coachee has become enrolled since the section rendered, **When** they attempt to join, **Then** the join is refused with the "already enrolled" message, no entry is created, and after refetch the class is no longer offered.
6. **Given** stale data in which the Coachee is already on the waiting list, **When** they attempt to join again, **Then** the join is refused with the "already on waiting list" message, no duplicate entry is created, and after refetch the class is no longer offered.
7. **Given** a canceled class, **When** the Coachee attempts to join its waiting list, **Then** the join is refused with a clear message and nothing is recorded.
8. **Given** an expired or invalid session, **When** the Coachee attempts to join, **Then** the join is refused with an authentication error, no waiting-list change occurs, and the Coachee is asked to sign in again.
9. **Given** a Coachee who double-taps "Join waiting list" while the mutation is pending, **When** both submissions reach the server, **Then** exactly one waiting-list entry is created and the subsequent response reflects the already-on-list state (no duplicate entry).

---

### User Story 3 - Keep membership consistent across join, leave, and refresh (Priority: P2)

A Coachee who joins or leaves waiting lists sees every Home surface stay in sync: leaving a waiting list from MyWaitingLists removes the entry and decrements the badge count, and — if the class is still full, still within reach, and its waiting list still has a slot — brings that class back into the discovery section so the Coachee may rejoin. The Home refresh button and pull-to-refresh refetch the dashboard and waiting lists in one pass, and the discovery section is always re-derived from that fresh server data rather than from locally-computed state. Leaving causes no penalty and notifies no other party.

**Why this priority**: Walk-through correctness is what makes the discovery surface trustworthy. Readers who leave and rejoin need the list to reflect the new reality immediately; the current invalidation handling is already correct for leaves but the join path misses dashboard invalidation, and this story pins down the full refresh contract so no surface can render stale eligibility after a mutation.

**Independent Test**: Can be fully tested by a Coachee who leaves a waiting list from MyWaitingLists and verifies the badge decrements and the class reappears in the discovery section when still eligible, and that pull-to-refresh reconciles every Home section — it delivers correct leave-and-refresh behavior on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee who is on a waiting list for a still-full, in-reach group class with a free slot, **When** they leave it from MyWaitingLists, **Then** the entry is removed, the badge count decrements by one, and the class reappears in the discovery section with a working Join action — all without a full page reload.
2. **Given** a Coachee who leaves a waiting list, **When** the leave succeeds, **Then** no penalty, fee, or restriction is applied, no other party is notified, and the freed slot becomes available to other Coachees.
3. **Given** a Coachee on the discovery section, **When** they trigger a refresh (Home Refresh button or pull-to-refresh), **Then** the discovery section, the badge, and MyWaitingLists are all refetched from the server in a single pass and re-render consistently.
4. **Given** a Coachee who is not on a particular class's waiting list, **When** they try to leave it, **Then** they are informed the waiting-list entry does not exist and nothing changes.
5. **Given** cached dashboard data on the Coachee Home, **When** a join or leave mutation succeeds, **Then** the cache is invalidated so no Home section continues to render pre-mutation eligibility.
6. **Given** a class on a Coachee's waiting list that is later canceled, **When** the leave is attempted, **Then** the leave is handled cleanly, the entry is removed without error, and the canceled class is never offered in the discovery section.

---

### User Story 4 - Server stays the source of truth under races and changing conditions (Priority: P2)

The eligibility shown by the discovery surface is always a hint computed at fetch time; the server decides at join time. The feature guarantees that every join outcome — success or refusal — leaves the surface consistent with the server's verdict, and that the client never applies waiting-list business rules (level-reach math, capacity/fullness checks, list-size checks) on its own. Refusals always carry a specific, distinguishable reason drawn from the same decision logic as the join endpoint, and never expose internal details.

**Why this priority**: The surface is only safe to ship if the internet-facing truth stays server-authoritative. Bad actors, race conditions (last-slot contention, spot opening mid-flow, a level changing between render and join) and stale caches must all converge to the same join verdict; this story pins that invariant and prevents a drift where the client would start making eligibility decisions.

**Independent Test**: Can be fully tested by provoking race and revalidation conditions — two Coachees racing for the last waiting-list slot, a spot opening between render and join, a level change between render and join, and an enrollment created by another path — and verifying the server's verdict is always honored with a specific message and a re-synced surface — it delivers server-authoritative correctness on its own.

**Acceptance Scenarios**:

1. **Given** two Coachees who both join the last free waiting-list slot (the 4th) of the same full class at the same moment, **When** both submissions arrive, **Then** exactly one join succeeds, the other is refused with the "waiting list is full" message, no over-capacity entry exists, and both Coachees' surfaces re-sync to the true state.
2. **Given** a full group class listed on the discovery surface whose level (or the Coachee's level) changes between the fetch and the join attempt, **When** the Coachee attempts to join, **Then** the server refuses with the level mismatch reason, no entry is created, and after refetch the section no longer offers the class.
3. **Given** a class listed on the discovery surface into which the Coachee is enrolled by another path between fetch and join, **When** the Coachee attempts to join, **Then** the server refuses with the already-enrolled reason, no entry is created, and after refetch the class is removed from the section.
4. **Given** the discovery eligibility decision and the join decision, **When** they are compared, **Then** both are produced by the same domain decision function (single source of truth), and no waiting-list business rule is implemented in the frontend.
5. **Given** stale, corrupted, or adversarially-crafted eligibility data, **When** a Coachee attempts to join, **Then** the server's verdict overrides the hint with a specific error, the surface re-syncs, and zero data changes occur on any refusal.

---

### Edge Cases

- What happens if two Coachees try to join the last free waiting-list slot (the 4th) at the same time? Exactly one join succeeds; the other receives the "waiting list is full" message and their surface re-syncs so the class is no longer offered.
- What happens when a spot opens in a listed class between the dashboard fetch and the join attempt? The join is evaluated against the class state at the moment of the attempt: the class no longer qualifies, the join is refused with a message directing the Coachee to the normal join flow, and after refetch the class moves from the discovery section to the open-spot "Joinable Classes" section.
- What happens when the waiting list of a listed class fills to 4 members between render and join? The join is refused with the "waiting list is full" message and after refetch the class disappears from the discovery section.
- What happens when a Coachee's level changes while the discovery section is showing them an eligible class? The class ceases to be offered after the next refetch; the join attempt in the meantime is refused with the level mismatch reason. Existing waiting-list membership is unaffected (level reach applies at join time only).
- What happens when a Coachee double-taps the Join action while the mutation is pending? The server creates exactly one entry; the second response reflects the already-on-list state and no duplicate entry exists.
- What happens when a Coachee is on the waiting list for a class and a spot opens? They are NOT enrolled automatically in this release (deferred to the waiting-list processing epic EP-04); the class is excluded from the discovery section because membership already exists, and MyWaitingLists continues to surface the entry.
- What happens when a class a Coachee is waitlisted on is canceled? The entry is excluded from active waiting-list counts and is never re-offered in the discovery section; the leave flow still works cleanly.
- What happens when a waitlist slot frees up (someone leaves) shortly after a fetch? The class becomes eligible again and appears in the discovery section on the next refetch; no push notification is sent in this release.
- What happens when the authenticated session expires mid-flow (after the list was rendered but before the join completes)? The action is refused with an authentication error, no partial waiting-list change occurs, and the Coachee is asked to sign in again.
- What happens when a Coachee has no level assigned? They are offered nothing in the discovery section (level reach cannot be satisfied); the section renders its empty state, not an error.
- What happens when a class is simultaneously eligible in the discovery section and in the open-spot "Joinable Classes" section? This cannot occur — the two sets are mutually exclusive by construction (open spots vs. full).
- What happens if the 10-day discovery window contains many full classes? All eligible classes are listed in ascending start-time order with no pagination, mirroring the behavior of the open-spot "Joinable Classes" list.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST compute waiting-list eligibility for the discovery surface server-side, in domain services, applying exactly the same rules as the join endpoint: ACTIVE status, GROUP class type, full capacity (enrollment = 4), class level within the Coachee's reach (±1), Coachee not already enrolled, Coachee not already on the class's waiting list, and the waiting list having a free slot (fewer than 4 members). Business rules MUST NOT be duplicated in the client.
- **FR-002**: System MUST extend `GET /coachee/dashboard` with a `waitlistEligibleClasses` array containing every group class satisfying FR-001 inside the discovery window, and MUST return an empty array when none qualify. Each entry MUST expose id, classType (`GROUP`), startTime, level, assignedCoach, enrollmentCount, capacity, isWithinReach, and isOnWaitingList, and MUST NOT expose the identities of other Coachees.
- **FR-003**: System MUST apply the same Madrid wall-clock "now + 10 days" discovery window used by the open-spot joinable classes, so the two sections cover the same time range and are mutually exclusive (a class is open-spot joinable XOR waitlist-eligible at any instant).
- **FR-004**: System MUST exclude from `waitlistEligibleClasses` any class that is CANCELED, INDIVIDUAL, not full, out of reach, already enrolled by the Coachee, already on the Coachee's waiting list, or whose waiting list is already full (4 members).
- **FR-005**: System MUST render a "Waiting List Opportunities" discovery section on the Coachee Home screen that lists every `waitlistEligibleClasses` entry with the class type, date and time, level, assigned Coach, and enrollment count.
- **FR-006**: System MUST show a clear empty state in the discovery section when `waitlistEligibleClasses` is empty, visually and textually distinct from the open-spot "Joinable Classes" empty state, and MUST NOT show an error in that case.
- **FR-007**: System MUST offer a functional "Join waiting list" action on each listed eligible class that invokes the existing `POST /classes/:id/waiting-list` (reusing the US-3.3 backend, with Coachee identity taken exclusively from the authenticated session), preceded by a confirmation step and showing a pending state while in flight.
- **FR-008**: On a successful join from the discovery surface, the System MUST remove the class from the section, increment the active waiting-list count shown in the badge, and make the new entry appear under MyWaitingLists, all without a full page reload.
- **FR-009**: Upon a successful join, the System MUST invalidate and refresh the `["coachee", "dashboard"]`, `["classes"]`, and `["waiting-lists"]` React Query keys — this fixes the existing gap in `useJoinWaitingList`, which currently invalidates only the class list and waiting lists.
- **FR-010**: Every refused join from the discovery surface MUST surface a specific, user-friendly message that reflects the refusal reason (waiting list full, group not full, already enrolled, already on waiting list, level mismatch, canceled) without exposing internal details or stack traces, consistent with the standard error envelope.
- **FR-011**: After any refusal caused by a changed condition, the System MUST re-sync the discovery section from server data (refetch) so it no longer offers an ineligible class; a refusal MUST cause zero waiting-list data changes.
- **FR-012**: When a Coachee leaves a waiting list (from MyWaitingLists), the System MUST remove the entry, decrement the active waiting-list count, and, when the class remains full, within reach, and on a waiting list with a free slot, return the class to the discovery section with a working Join action.
- **FR-013**: The discovery section, the badge, and MyWaitingLists MUST all be refetched consistently by the Home refresh button and pull-to-refresh, and MUST never be derived from locally-computed eligibility state.
- **FR-014**: The System MUST return `waitlistEligibleClasses` only to the authenticated Coachee role, scoped to that Coachee, and MUST NOT leak the eligibility views of any other user.
- **FR-015**: The System MUST keep the existing dashboard contract stable: `nextClass`, the open-spot `joinableClasses`, and `activeWaitingListCount` semantics MUST NOT change, and the visibility classification of classes in the list/calendar endpoints MUST remain unchanged by this feature.
- **FR-016**: `waitlistEligibleClasses` entries MUST be ordered by start time ascending (deterministic ordering).
- **FR-017**: The changed `GET /coachee/dashboard` contract MUST be documented in `docs/api-specifications.md` before implementation (Constitution IV).
- **FR-018**: Tests MUST be written first (Red-Green-Refactor, Constitution II): domain eligibility logic MUST reach 100% branch coverage; the dashboard application use case MUST have happy-path plus refusal-path tests; integration tests via Supertest MUST cover the extended dashboard endpoint and the join/leave round-trip through the discovery surface; frontend unit tests MUST cover any new derive/render logic and mutation behavior.

### Key Entities *(include if feature involves data)*

- **Class (reused)**: A single 60-minute training session (individual or group) assigned to one Coach, with a level, a start time, a status of "Active" or "Canceled", and — for group classes — a capacity of 4. Fullness determines whether the class can appear in the discovery section.
- **Class Enrollment (reused)**: The record linking one Coachee to one class occurrence; its existence excludes the class from the discovery section (already-enrolled rule).
- **Waiting List Entry (reused)**: The record linking one Coachee to one class waiting list, capped at 4 entries per class and carrying no position; its existence excludes the class from the discovery section (already-on-waiting-list rule) and its count gates eligibility (free-slot rule).
- **Coachee (reused)**: The user role whose Home screen shows the discovery surface; identified from the authenticated session, with a level that determines reach (±1) and drives continuity with the join endpoint's validation.
- **Level (reused)**: The difficulty tier of a class and of a Coachee; the basis of the level-reach rule applied to eligibility and join alike.
- **Waitlist-Eligible Class (derived projection, not a stored entity)**: A group class that satisfies the FR-001 predicate at fetch time; it carries id, classType, startTime, level, assignedCoach, enrollmentCount, capacity, isWithinReach, and isOnWaitingList, and is produced server-side by the same domain decision function used at join time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of full, within-reach, not-enrolled, not-waitlisted group classes with a free waiting-list slot inside the 10-day discovery window appear in the discovery section, and 100% of classes failing any FR-001 condition do not appear.
- **SC-002**: Every class listed in the discovery section passes the server join policy at the moment of rendering, and a Coachee can complete a successful join from the surface in under 1 minute from deciding to join, with immediate confirmation and an instantly updated surface.
- **SC-003**: After any successful join or leave, the discovery section, the badge count, and MyWaitingLists all reflect the new state in 100% of cases without a full page reload (verified by the dashboard invalidation in `useJoinWaitingList`).
- **SC-004**: 100% of refused joins under race or stale-data conditions (list full, spot opened, already enrolled, already on list, level mismatch, canceled, session expired) show the specific, distinguishable message and cause zero waiting-list data changes.
- **SC-005**: When exactly one waiting-list slot remains, exactly one of any concurrent join attempts succeeds and all others are refused as full; this holds in 100% of tested contention cases.
- **SC-006**: The domain eligibility logic reaches 100% branch coverage, and the extended dashboard endpoint has at least one happy-path and one validation/refusal-path test via Supertest (Constitution II).
- **SC-007**: After a leave, a class that remains full, in reach, and on a non-full waiting list reappears in the discovery section in 100% of cases, so the Coachee can rejoin without leaving the Home screen.

## Assumptions

- The primary server-driven signal is an extension of `GET /coachee/dashboard` with a `waitlistEligibleClasses` array. Extending `GET /classes` list responses with per-class `coacheeStatus` was considered but is NOT required for this feature: it would enlarge the list payload consumed by the calendar (which deliberately hides gray classes) and increase surface area without contributing to the Home discovery goal. It may be revisited by a later calendar-interaction story.
- The discovery surface lives on the Coachee Home screen as a new section below the open-spot "Joinable Classes" section, reusing the same navigation; no new route is required. The 013 `CoacheeClassCard`/`CoacheeClassList` components may be reused or replaced by a lighter discovery-list component at implementation discretion — the spec requires the behavior, not the component.
- Eligibility is recomputed server-side on every dashboard fetch and again at join time; the discovery list is a hint and the join endpoint is the source of truth. A refusal can therefore legitimately occur after a stale render, and the client MUST handle it with a specific message and a refetch.
- The discovery window reuses the existing 10-day Madrid wall-clock window from `CoacheeDashboardPolicy.joinableWindow`, and `waitlistEligibleClasses` is ordered ascending by start time with no pagination, mirroring the open-spot joinable classes.
- The discovery section lists only group classes; individual occupied slots keep their 013/calendar waiting-list affordances and are out of scope for this surface.
- Waiting-list semantics from 013/PRD Section 5 are unchanged: max 4 members per class, no position priority (all waitlisted coachees notified simultaneously), no auto-enrollment in this release, and automatic processing deferred to EP-04.
- A Coachee who is already on a class's waiting list is excluded from the discovery section for that class (membership is surfaced by MyWaitingLists); after leaving, the class reappears when it is still eligible.
- The `useJoinWaitingList` invalidation gap is a defect fixed by this feature: a successful join must refresh the dashboard query just like a leave does.
- The frontend never applies waiting-list business rules; any future UI that needs to derive an action from raw list data must consume a server-computed signal (such as `coacheeStatus` or a discovery payload) rather than recomputing level reach or capacity locally.