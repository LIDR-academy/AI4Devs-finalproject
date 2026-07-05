# EP-03: Coachee Self-Service

## Milestone
**Coachees can independently join, view, and cancel classes, and manage waiting lists.**

## Description
Empower Coachees to manage their own gym experience. After this epic, a Coachee can log in, see their personalized dashboard, browse available classes on a calendar, join/cancel classes, and join/leave waiting lists. The waiting list stores entries but is not yet automatically processed (deferred to EP-04).

## Priority: High
## Dependencies: EP-01 (Auth), EP-02 (Scheduling)

---

## User Stories

### US-3.1: Class Enrollment & Cancellation

**As a** Coachee,  
**I want** to join and cancel group classes,  
**So that** I can manage my own attendance.

**Acceptance Criteria:**
- [ ] Coachee can join a group class with available spots (validates capacity, level reach, overlap)
- [ ] Coachee cannot join individual classes (Admin/Coach assignment only)
- [ ] Coachee can cancel their own attendance from any class they're enrolled in
- [ ] No penalties or restrictions on cancellation
- [ ] Cancellation removes enrollment record
- [ ] If class becomes full after enrollment, join button replaced with waiting list option
- [ ] Appropriate error responses: CLASS_FULL, LEVEL_MISMATCH, OVERLAP_DETECTED, ALREADY_ENROLLED
- [ ] Coachee identity derived from JWT (no ID in request body)

**Task File:** `userStories/US-3.1-enrollment-cancellation.md`

---

### US-3.2: Coachee Dashboard & Calendar

**As a** Coachee,  
**I want** a personalized home screen and color-coded calendar,  
**So that** I can see my schedule and discover new classes.

**Acceptance Criteria:**
- [ ] Home screen shows next scheduled class (or "No upcoming classes" if none)
- [ ] Home screen lists joinable group classes within a 10-day window
- [ ] Calendar shows 1-week view with color coding:
  - Blue: own scheduled classes (tap to view/cancel)
  - Green: joinable group classes within reach (tap to join)
  - Gray: other classes / busy blocks (tap to join waiting list)
- [ ] Loading, empty, and error states for all views
- [ ] Pull-to-refresh on mobile
- [ ] Home screen shows count of active waiting lists

**Task File:** `userStories/US-3.2-coachee-dashboard-calendar.md`

---

### US-3.3: Waiting List Join/Leave

**As a** Coachee,  
**I want** to join and leave waiting lists,  
**So that** I can be considered for spots when they open.

**Acceptance Criteria:**
- [ ] Coachee can join waiting list for full group class (4/4 capacity)
- [ ] Coachee can join waiting list for occupied individual class slot (via gray block)
- [ ] Maximum 4 Coachees per waiting list (409 WAITING_LIST_FULL)
- [ ] Coachee can leave any waiting list at any time
- [ ] Coachee can view all their active waiting lists
- [ ] Coachee cannot join waiting list if already enrolled or already on the list
- [ ] Position not shown (simultaneous notification model)
- [ ] No limit on number of different waiting lists a Coachee can join

**Task File:** `userStories/US-3.3-waiting-list-join-leave.md`

---

### US-3.4: Calendar Interactions for Coachees

**As a** Coachee,  
**I want** to interact with the calendar — joining, canceling, and waitlisting directly,  
**So that** I can manage everything from one view.

**Acceptance Criteria:**
- [ ] Tap blue own-class → detail modal with cancel option
- [ ] Tap green joinable class → detail modal with join option
- [ ] Tap gray busy block → join waiting list option for that slot
- [ ] All actions trigger confirmation dialogs
- [ ] Calendar updates optimistically after actions
- [ ] Error feedback displayed in case of API failure
- [ ] Waiting list entry shows confirmation with class details

**Task File:** `userStories/US-3.4-calendar-interactions.md`
