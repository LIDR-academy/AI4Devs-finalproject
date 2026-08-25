# ROLE
You are a Senior Product Manager and Business Analyst specializing in B2B2C SaaS platforms, with deep expertise in marketplace/booking systems, role-based access control (RBAC), and calendar-integrated scheduling products. You have extensive experience writing Product Requirements Documents (PRDs) that are immediately actionable for engineering and design teams.

# OBJECTIVE
Generate a complete, well-structured Product Requirements Document (PRD) in English for a personal training management platform, based strictly on the requirements provided in the "PRODUCT REQUIREMENTS" section below. Do not invent, assume, or add features, roles, screens, or business rules beyond what is explicitly stated there.

# CONTEXT
The platform is being built for a personal trainer ("Coach") who manages both individual and group coaching sessions ("classes") at a physical gym location with limited room capacity. The system must unify two user-facing experiences (Coach/Admin side and Coachee side) into a single backend application, with screens rendered conditionally based on user role. Calendar management must be built on top of the Google Calendar API rather than a custom-built scheduling engine.

# INSTRUCTIONS
1. Read all requirements carefully before drafting anything.
2. Organize the PRD using the OUTPUT STRUCTURE defined below.
3. Preserve every business rule, constraint, numeric limit, and screen detail exactly as specified (e.g., max 4 people per group class, 1-hour fixed duration, gym capacity limits).
4. Document UI behavior (colors, icons, modals, buttons) precisely as functional/UI requirements — do not redesign or reinterpret it.
5. Consolidate related details into coherent sections (e.g., group all Coachee-screen rules together) without altering their meaning.
6. If a genuine ambiguity or gap exists that engineering would need resolved before building (e.g., an undefined edge case), flag it explicitly in the "Open Questions / Clarifications Needed" section — do not silently resolve it with an assumption.
7. Use clear Markdown formatting: headers, tables, and nested bullet/numbered lists for readability and easy copy-paste into documentation tools.
8. Do not add competitive analysis, market sizing, monetization strategy, success metrics/KPIs, or a timeline/roadmap — these are out of scope.

# OUTPUT STRUCTURE
1. **Document Overview** (product name placeholder, purpose, intended audience)
2. **Problem Statement & Goals**
3. **User Roles & Permissions** (table: Role | Capabilities/Permissions)
4. **Glossary of Key Terms** (Coach, Coachee, Individual Class, Group Class, Level, Waiting List, etc.)
5. **Business Rules & Constraints**
   - Levels/categories system
   - Class types and capacity rules (individual vs. group)
   - Gym/venue capacity constraints
   - Class duration rules
   - Waiting list logic
6. **Functional Requirements by Screen**
   - 6.1 Shared Architecture Notes (single app, role-based rendering, Google Calendar API integration)
   - 6.2 Admin & Coach Screens (sidebar navigation, notifications bell, Today page, Calendar page incl. "Add Class" modal logic, Coachees page incl. table + filters + "Add Coachee" modal)
   - 6.3 Admin-Only Screens (Coaches page incl. table + filters + "Add Coach" modal + "View Details" modal)
   - 6.4 Coachee Screens (mobile-first: Home, Calendar, Notifications — including color-coding logic for class visibility: blue/green/gray rules)
7. **Notifications & Push Notification Rules** (each triggering event and its recipient, explicitly listed)
8. **Technical Requirements** (web app with push notification support, installable home-screen shortcut, Google Calendar API integration, Clean/Hexagonal Architecture, performance and UX expectations)
9. **Open Questions / Clarifications Needed**

# OUTPUT FORMAT
- Entire output in Markdown.
- Tables for roles/permissions and any structured comparisons.
- Nested bullet points for screen-level UI/functional details to preserve hierarchy.
- Keep section headers exactly as listed above (numbered) for consistency.

# PRODUCT REQUIREMENTS

## Vision
A platform for a personal trainer (the "Coach") to manage his coaching business. The Coach currently has one additional coach working for him. The system has two sides — a management side (Admin/Coach) and a client-facing side (Coachee) — built as a single application, with the UI rendered conditionally based on the logged-in user's role. All calendar functionality must be built on the **Google Calendar API**, not a custom scheduling engine from scratch.

## Roles & Permissions
- **Admin**: Adds users (Coachees), creates and schedules classes, blocks off calendar time, adds Coaches.
- **Coach**: Creates and schedules classes.
- **Coachee**: Views the calendar with all classes, subject to visibility rules (see below).

## Core Business Concepts
- **Levels**: Coachees are assigned to one of **5 levels**, each represented by a distinct color.
- **Class types**:
  - **Individual classes**: one Coachee per class.
  - **Group classes**: grouped by level; **minimum 3, maximum 4 Coachees** per class.
- **Class duration**: All classes are fixed at **1 hour**.
- **Venue/gym capacity** (simultaneous classes):
  - Up to **2 individual classes** at the same time.
  - Up to **1 group class** at the same time.

## Coachee Calendar Visibility Rules
- Other users' **individual classes**: shown as busy/blocked, in **gray**, with no detail.
- The Coachee's **own scheduled classes** (individual or group): shown in **blue**, with an option to **cancel**.
- **Group classes within the Coachee's reach** — defined as their own level, one level above, or one level below, and not already joined — shown in **green**, with an option to **join**. If the class is full, joining adds the Coachee to a **waiting list**.
- **Group classes outside the Coachee's reach**: shown as busy/blocked, in the same **gray** as others' individual classes.

## Screens: Admin & Coach (Desktop & Mobile)
**Layout**: Left sidebar navigation with:
- Today
- Calendar
- Coachees
- Coaches (Admin only)

A notifications bell icon in the top-right corner with a dropdown panel, showing **only the current day's notifications**.

### Today Page
- Lists the Coach's scheduled classes for the day, displayed as vertically stacked blocks in chronological order.
- Each block shows the Coachee name(s) and the start time.
- Individual classes and group classes are visually distinguished using two different background colors.
- Canceled classes are shown in gray with a "Canceled" tag.

### Calendar Page
- Displays a calendar built on the Google Calendar API, with a toolbar above it (starting with an "add event" action).
- Since classes have a different data structure than native Google Calendar events, there is a dedicated **"Add Class"** button that opens a modal with the following fields:
  - **Class type**: Individual / Group / Block
  - **Coachees**: participants to add
  - **Description**
  - **Level**: selector among the 5 levels
  - **Date**
  - **Available time slots**: must be surfaced to the user in some way
  - A **"Save"** button to persist the class
- **Validation rules**:
  - If type = Individual: maximum 1 Coachee allowed.
  - If type = Group: minimum 3, maximum 4 Coachees allowed.
  - If type = Block: no Coachee field and no Level field are shown.

### Coachees Page
- Table of all Coachees with columns: Name, Email, Phone, Class Type (Individual / Group / Both), Status (Active/Inactive).
- A final "Actions" column with a vertical three-dot icon; clicking it opens a menu with the option to **Deactivate** (if active) or **Activate** (if inactive).
- Top-right **"Add Coachee"** button (Admin-only visibility) opens a modal requesting: First name, Last name, Email, Mobile phone number, Class type (multi-select checkboxes: Individual / Group), Additional info (text area), Level (selector among the 5). Includes a **"Save"** button. On save, the current date is also recorded.
- Above the table, top-left: an Active/Inactive filter (multi-select dropdown with checkboxes) and, next to it, a Level filter (same multi-select-with-checkboxes style).

## Screens: Admin Only

### Coaches Page
- Table of all Coaches with columns: Name, Email, Phone, Bank account, Social security number, National ID (DNI), Status.
- Final column has a vertical three-dot icon; clicking it opens a menu with options:
  - **View details** → opens a modal titled "Additional info" showing the contents of that field.
  - **Deactivate** (if active) or **Activate** (if inactive).
- Top-right **"Add Coach"** button opens a modal requesting the same fields shown in the table, plus an "Additional info" text area. Bottom-right **"Save"** button saves the Coach and closes the modal.
- Above the table, top-left: an Active/Inactive filter (multi-select dropdown with checkboxes).

## Screens: Coachee (Mobile-First)
- **Home**:
  - Prominently displays the date and time of the Coachee's next upcoming class near the top.
  - A section showing upcoming group classes the Coachee can join, within a **10-day** look-ahead window.
- **Bottom navigation bar** with 3 items:
  - **Home** (as described above)
  - **Calendar**: a calendar view limited to a **1-week** window, following the visibility rules defined under "Coachee Calendar Visibility Rules."
  - **Notifications**: notifications bell with dropdown panel.

## Notification Rules
- **Waiting list → spot opens up**: If a Coachee on a waiting list gets an opening (due to another Coachee canceling), they receive a **push notification** on their phone informing them a spot is available to join.
- **New group class matches Coachee's level with an open spot**: If a new group class is created within a Coachee's reach (their level ±1) and it has an open spot, that Coachee receives a **push notification** informing them a spot is available.
- **Individual class canceled by Coachee**: The assigned Coach receives a notification informing them of the cancellation.

## Technical Requirements
- Must be a **web app** capable of sending push notifications.
- Must support **"Add to Home Screen"** functionality so it can be installed on mobile and behave like a native app (PWA-style).
- Must integrate with the **Google Calendar API** for all calendar/scheduling functionality.
- Must follow **Clean Architecture** or **Hexagonal Architecture** principles.
- Must deliver **good performance**.
- Must deliver **good UX**.

# FINAL CHECK
Before finalizing, verify that:
- Every business rule and numeric constraint above appears in the PRD.
- No section introduces functionality, metrics, or scope not present in the requirements.
- The document is formatted in clean, copy-paste-ready Markdown.