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

* Each Coachee is assigned one of 5 defined levels: **Principiante, Básico, Intermedio, Avanzado, Experto** (in ascending order). Each level is mapped to a distinct color (to be defined by design).
* Levels are assigned and can be changed at any time by a Coach or Admin.
* A class is within a Coachee's **reach** if it matches their level, one above, or one below.

### Class Types & Capacity Rules

* **Individual Class:** 1 Coachee only. Max 2 concurrent at any given time. A Coach creates the class and assigns the Coachee.
* **Group Class:** Min 3, max 4 Coachees from the same level (or reach); only 1 group class at a time.
* An **assigned Coach** is set at class creation (defaults to the creating Coach; a different Coach may be selected).

### Gym/Venue Capacity

* At most 2 individual classes and 1 group class may run simultaneously (per hour).

### Class Duration Rules

* All classes (individual/group) are always 1-hour fixed duration; no modification allowed.

### Class Overlap Rules

* A Coachee cannot be scheduled in two classes (individual + group, or two individuals) that overlap in time, even partially.

### Recurring Classes

* A class may be created as a one-off or as a weekly recurring series. When weekly recurrence is selected, the system generates a class instance for the same day and time every week with the same level, assigned Coach, and class type. Recurrence starts on the selected date and has no automatic end date (Coach can delete individual instances or cancel the entire series).

### Waiting List Logic

* **Group classes:** When a group class is full (4/4), additional eligible Coachees may join its waiting list.
* **Individual classes:** When an individual class time slot is already occupied, other Coachees may click the gray busy block on the calendar to join a waiting list for that specific time slot.
* **Maximum size:** Waiting list is capped at 4 Coachees per class.
* **Notifications:** When one or more spots open (due to cancellation), **all Coachees on the waiting list are notified simultaneously**. The spot is claimed on a first-come, first-served basis with no hold time.
* **Multiple waiting lists:** A Coachee may be on any number of waiting lists simultaneously (both group and individual).
* **Leaving:** A Coachee may voluntarily leave a waiting list at any time.

### Class Cancellation Rules

* **Coachee cancels own attendance:** No restrictions or penalties. If the class is full or has a waiting list, the system processes the waiting list automatically.
* **Coach cancels a class entirely:** All enrolled Coachees receive a push notification. The class is marked as "Canceled" and shown in gray in the calendar.
* **Coach cancels an individual class:** If the class has a waiting list, the first person to claim from the waiting list gets the newly freed slot.
* **No-show tracking:** Not implemented in v1. Reserved for future.

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
* Calendar shows all classes from all Coaches (no Coach-specific filtering in v1).
* **Add Class Modal**
  * Fields:
    * Class type: Individual / Group / Block
    * Assigned Coach: defaults to the creating Coach; dropdown to select any other Coach (hidden when Block is selected).
    * Coachee(s): single-select for Individual, multi-select for Group (as per type rules). For Individual, only one Coachee can be assigned.
    * Description (visible to all users who can see the class).
    * Level: 5-level selector (hidden when Block or Individual is chosen).
    * Date
    * Recurrence: toggle to enable weekly recurrence. When enabled, the class repeats weekly from the selected date.
    * Block type: selector with two options — "Personal" (block own/assigned Coach's calendar) or "Gym-wide" (block entire gym, Admin only). Only shown when Class type is Block.
    * Available time slots: surfaced to user (implementation detail to be decided).
    * Save button.
  * **Validation**:
    * If Individual: exactly 1 Coachee required.
    * If Group: min 3, max 4 Coachees required.
    * If Block: hide Coachee, Level, and Assigned Coach fields. Show Block type selector instead.
    * Assigned Coach: required for Individual and Group.

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
  * Top: Date/time of Coachee’s next class. If no class is scheduled, shows "No upcoming classes".
  * Upcoming group classes to join (within 10-day window).
* **Bottom navigation bar** with three items:
  * Home
  * Calendar (1-week window, with color-coded visibility per rules)
  * Notifications (bell, dropdown panel)

**Calendar Visibility Logic for Coachees**

* Individual classes of other users: shown as gray busy/blocked (no detail). **Tapping a gray block opens an option to join the waiting list** for that specific time slot.
* Own scheduled classes (individual/group): blue, option to cancel.
* Group classes within reach and not already joined: green, option to join. If full, Join button is replaced with "Join waiting list".
* Group classes outside reach: gray busy/blocked (same as above).

**Waiting List Management**

* **View:** The Home screen or a dedicated section (to be defined in design) shows all active waiting lists the Coachee is on, including the class name, date/time, and position (if applicable — since notification is simultaneous, position doesn't guarantee priority).
* **Join:**
  * **Group:** Tap "Join waiting list" on a full green group class card.
  * **Individual:** Tap a gray busy/blocked individual class slot → "Join waiting list for this time slot".
* **Leave:** Each waiting list entry includes a "Leave" option. Leaving does not notify the Coach.
* **Notifications:** When a spot opens, the Coachee receives a push notification (see Section 7). Tapping the notification opens the class details for direct booking.

---

## 7\. Notifications & Push Notification Rules

All notifications are push notifications delivered to the relevant user's device. Notifications are also visible in-app in the Notifications panel (bell icon). Below is the complete catalog of notification events:

| # | Trigger Event | Recipient(s) | Push Content |
|---|--------------|--------------|--------------|
| 1 | Spot(s) open in a class with a waiting list (group or individual) | All Coachees on that waiting list | "¡Hay hueco(s) libre(s) en [clase/nivel]! Corre a reservarlo." |
| 2 | New group class created within reach with at least one open spot | All Coachees in reach of that class's level | "Nueva clase de [nivel] disponible el [fecha/hora]" |
| 3 | Coachee cancels their **individual** class | Assigned Coach | "[Coachee nombre] canceló su clase individual de las [hora]" |
| 4 | Coachee cancels their spot in a **group** class — waiting list exists | Assigned Coach | "[Coachee nombre] canceló. Se ha notificado a [N] coache(s) en waiting list." |
| 5 | Coachee cancels their spot in a **group** class — no waiting list | Assigned Coach | "[Coachee nombre] canceló. El hueco está libre." |
| 6 | Waitlisted Coachee claims a newly opened spot (group or individual) | Assigned Coach | "[Coachee nombre] ha ocupado el hueco libre en [clase/hora]" |
| 7 | Coach cancels an entire class (group or individual) | All enrolled Coachees | "La clase de [nivel] del [fecha/hora] ha sido cancelada." |
| 8 | Coach creates an individual class and assigns a Coachee | Assigned Coachee | "Tienes una clase individual con [Coach nombre] el [fecha/hora]" |
| 9 | Coachee joins a waiting list | The Coachee who joined | "Te has apuntado a la waiting list de [clase/hora]. Te avisaremos cuando haya hueco." |
| 10 | Coachee leaves a waiting list voluntarily | The Coachee who left | "Has salido de la waiting list de [clase/hora]" |
| 11 | Coachee's level is changed by a Coach or Admin | The affected Coachee | "Tu nivel ha sido actualizado a [nuevo nivel]" |
| 12 | A Coach is assigned to a class they did not create | The newly assigned Coach | "Has sido asignado a [clase/tipo] el [fecha/hora]" |

**Notes:**
* When multiple spots open simultaneously, all waitlisted Coachees are notified together (#1). The spots are claimed first-come, first-served. There is no hold time or per-user expiry.
* Notifications #4 and #5 are mutually exclusive: the system checks whether a waiting list exists and sends the appropriate variant.
* Notification #1 is not sent if a spot opens but the waiting list is empty; instead, the Coach is notified (#4 or #5 depending on context).
* The in-app Notifications panel (bell icon) shows only the **current day's** notifications for Admin and Coach roles. Coachees see a full chronological history.

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

### Resolved
The following items from earlier versions have been clarified and are now reflected in the sections above:

* **Block types:** Personal (Coach/Admin) vs Gym-wide (Admin only). Notifications not required for blocks.
* **Max classes per Coachee per week/day:** No limit. Coachees may join any class within reach as long as times don't overlap.
* **Waiting list mechanics:** First-come, first-served with no hold time. All waitlisted Coachees notified simultaneously when spots open. Max 4 per class.
* **Individual class waiting list:** Works like group. Coachees tap a gray busy block to join the waiting list for that time slot.
* **Coach-Coachee assignment:** Coach is assigned to the class (not to the Coachee). Coach creates the class and is the default assigned Coach, but any other Coach can be selected at creation.
* **Multiple coaches:** Yes, all Coaches see all classes in the calendar.
* **Recurring classes:** Weekly recurrence supported via toggle in the Add Class modal.
* **Coach cancels class:** All enrolled Coachees receive a push notification.
* **Class reminders:** Not in scope for v1.

### Still Pending

* **Available time slots UI/UX:** How "Available time slots" are programmatically surfaced in the Add Class modal (details around integration with Google Calendar's free/busy logic). Implementation decision needed.
* **Level color mapping:** The 5 levels (Principiante, Básico, Intermedio, Avanzado, Experto) need specific hex color codes assigned. Design input required.
* **Waiting list placement feedback:** When a Coachee joins a waiting list with 0 spots open and no prior members, the concept of "position" is moot (all notified simultaneously). Design decision needed on whether to display a simple "You're on the list" confirmation vs a numbered position.

---