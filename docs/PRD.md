# Personal Training Management Platform

## 1\. Document Overview

**Product Name:** TBD ("Personal Training Management Platform")  

**Purpose:** Define actionable requirements for a unified web application for personal training business management, combining coach/admin operations with coachee access. This document captures all business rules, UI/UX details, and system constraints for actionable engineering and design work.

**Intended Audience:** Product managers, engineers, designers, QA/testers, and stakeholders directly involved in developing, testing, and deploying the application.

---

## 2\. Problem Statement & Goals

The Coach and their team require a single, web-based solution for scheduling, managing, and tracking both individual and group coaching sessions at a physical gym with strict space and time constraints. The solution must streamline class creation, attendee tracking, level management, waiting lists, coach staffing, and notifications, while providing a mobile-first user experience for coachees and leveraging Google Calendar as the scheduling backbone.

---

## 3\. User Roles & Permissions

| Role | Capabilities / Permissions |
| --- | --- |
| Admin | Add/activate/deactivate Users (Coachees); create/schedule all class types; block gym-wide time; block own calendar time; add/activate/deactivate Coaches; full navigation access |
| Coach | Create/schedule all class types (can assign self or another Coach); cancel own or assigned classes; block own calendar time; view all classes from all Coaches on the calendar; access to all non-admin-only screens |
| Coachee | View calendar (per visibility rules); join/cancel group classes (if available/in scope); join/leave waiting lists for both group and individual classes; receive notifications; mobile navigation |

---

## 4\. Glossary of Key Terms

* **Coach:** User who delivers training sessions; can create and schedule classes. The Coach who creates a class is its assigned Coach by default; a different Coach may be selected at creation time.
* **Coachee:** Client who attends classes and interacts with the system mainly via mobile.
* **Admin:** Admin-level user who manages Coaches, Coachees, classes, and blocked time.
* **Individual Class:** 1-hour session with a single Coachee; up to 2 such classes may occur simultaneously.
* **Group Class:** 1-hour session with a group (min 3, max 4) of Coachees at a defined level; only 1 group class can occur at a time.
* **Block (Calendar — Personal):** Time blocked by a Coach or Admin on their own calendar; no classes assigned to that person during the block.
* **Block (Calendar — Gym-wide):** Time blocked by an Admin for the entire gym; no classes of any kind may be scheduled during a gym-wide block.
* **Level:** One of 5 named tiers assigned to Coachees by a Coach/Admin, representing skill or experience. The levels are: **Principiante, Básico, Intermedio, Avanzado, Experto**. Each maps to a specific color (to be defined by design).
* **Warning:** Informational push notification sent to a coachee when a spot opens up in a class they are waitlisted for. No penalty associated.
* **Waiting List:** Queue for a class at full capacity (group) or for a specific time slot (individual). Coachees may join if a spot is not immediately available. Maximum size: 4. First-come, first-serve with no hold time. When one or more spots open, all waitlisted coachees are notified simultaneously.
* **Status:** User or Coach activation state (Active/Inactive).
* **Reach:** A class is within a Coachee’s reach if it matches their level, one above, or one below.
* **Weekly recurrence:** A class may be created as a one-off or as a weekly recurring series (same day, time, level, and assigned Coach every week).

---

## 5\. Business Rules & Constraints

### Levels & Categories

* Each Coachee is assigned one of 5 defined levels; each level is mapped to a distinct color.

### Class Types & Capacity Rules

* **Individual Class:** 1 Coachee only. Max 2 concurrent at any given time.
* **Group Class:** Min 3, max 4 Coachees from the same level (or reach); only 1 group class at a time.

### Gym/Venue Capacity

* At most 2 individual classes and 1 group class may run simultaneously (per hour).

### Class Duration Rules

* All classes (individual/group) are always 1-hour fixed duration; no modification allowed.

### Waiting List Logic

* If a group class is full, additional eligible Coachees may join a waiting list. When a spot opens (due to cancellation), the waiting list is processed in order, with notifications to Coachees as spots become available.

---

## 6\. Functional Requirements by Screen

### 6.1 Shared Architecture Notes

* Single web application with conditional UI rendering based on authenticated user’s role.
* Backed by a single application backend handling all business logic/rules.
* **Calendar management is built on the Google Calendar API.**
* All notification and scheduling events synchronize with Google Calendar as the single source of scheduling truth.

### 6.2 Admin & Coach Screens

**Layout & Navigation:**

* Desktop & mobile responsive design.
* Left sidebar: sections for Today, Calendar, Coachees, Coaches (Admin only).
* **Notifications bell icon** (top-right): opens a dropdown showing only current day’s notifications.

Today Page

* Vertical list of scheduled classes for the day (chronological order).
  * Each block: Coachee name(s), start time.
  * Visual distinction: Individual and group classes use two distinct background colors.
  * Canceled classes: shown in gray, with visible "Canceled" tag.

Calendar Page

* Contextual toolbar at top; includes an "Add Class" button.
* Calendar rendered using Google Calendar API (not native events).
* **Add Class Modal**
  * Fields:
    * Class type: Individual / Group / Block
    * Coachees: select (multi-choice as per type rules).
    * Description
    * Level: 5-level selector (except when Block is chosen).
    * Date
    * Available time slots: surfaced to user (implementation detail to be decided).
    * Save button.
  * **Validation**:
    * If Individual: max 1 Coachee.
    * If Group: min 3, max 4 Coachees.
    * If Block: hide Coachee/Level fields.

Coachees Page

* Table: columns for Name, Email, Phone, Class Type (Individual/Group/Both), Status.
* Actions column: vertical three-dot icon → menu: Activate/Deactivate.
* Top-right: "Add Coachee" (Admin only): modal collects First/Last name, Email, Mobile, Class type (multi-select), Additional info, Level selector, Save (records current date).
* Top-left:
  * Active/Inactive filter: multi-select w/ checkboxes.
  * Level filter: multi-select w/ checkboxes.

### 6.3 Admin-Only Screens

Coaches Page

* Table: Name, Email, Phone, Bank account, Social Security Number, DNI, Status.
* Actions: vertical three-dot icon → menu:
  * View details (opens modal "Additional info").
  * Activate / Deactivate.
* Top-right: "Add Coach" (modal: all above fields + Additional info); Save closes modal.
* Top-left: Active/Inactive multi-select checkbox filter.

### 6.4 Coachee Screens (Mobile-First)

* **Home Screen**
  * Top: Date/time of Coachee’s next class.
  * Upcoming group classes to join (within 10-day window).
* **Bottom navigation bar** with three items:
  * Home
  * Calendar (1-week window, with color-coded visibility per rules)
  * Notifications (bell, dropdown panel)

Calendar Visibility Logic for Coachees

* Individual classes of other users: shown as gray busy/blocked (no detail).
* Own scheduled classes (individual/group): blue, option to cancel.
* Group classes within reach and not already joined: green, option to join. If full, Join triggers waiting list.
* Group classes outside reach: gray busy/blocked (same as above).

---

## 7\. Notifications & Push Notification Rules

* **Waiting list → spot opens**: Coachee receives push notification if a spot becomes available in a group class they’re waitlisted for.
* **New group class in reach with open spot**: Coachee receives push notification when a new group class (own level ±1) with open spot is created.
* **Individual class canceled by Coachee**: Assigned Coach receives push notification about the cancellation.

---

## 8\. Technical Requirements

* Web app, supporting push notifications.
* Must implement "Add to Home Screen" (PWA support) for installable mobile experience.
* **All calendar functionality must use Google Calendar API.**
* Back-end and front-end must observe Clean/Hexagonal Architecture principles.
* Performance: fast load/interactions expected for all workflows.
* UX: accessible, responsive, and clear, especially for mobile-first Coachee experience.

---

## 9\. Open Questions / Clarifications Needed

* Clarification needed on how "Available time slots" are programmatically surfaced in the Add Class modal (details around UI/UX and integration with Google Calendar’s free/busy logic).
* The requirements for "Block" calendar type are specified, but the impact on general scheduling logic and notification behavior (if any) needs confirmation.
* Coachee-side: Is there a hard restriction on the max number of classes (group + individual) a Coachee can join per week or day, or can they theoretically join all available within their reach? No limits are specified, but this could matter for operational rules.
* Notification: When a waitlisted user receives a notification about an open spot, is there a hold period before the spot is offered to the next in line, or is it first come, first served?
* Specific color mapping for the 5 levels not provided: Design input required to define exact color codes.

---