# Weight-Loss Challenge Web App – Product Requirements Document (PRD)

## 1\. Overview

### Product Summary

A social web platform enabling friends to create and join weight-loss challenges, track progress, and build motivation through group accountability. Participants join with an invite code, log their weight weekly, and compete to achieve the highest total weight loss over a defined period. The system calculates BMI, manages leaderboard rankings, and delivers a visually-rich experience in line with wireframes.

### Problem Statement

Traditional weight-loss efforts often lack motivation and peer accountability, leading to user drop-off. A challenge-based, social solution can increase engagement, adherence, and results.

### Goals

* Increase user engagement and motivation through gamified weight-loss challenges.
* Provide transparent, real-time tracking of progress for individuals and groups.
* Drive retention by making goal achievement visible and rewarding.
* Foster supportive, healthy competition among friends.

## 2\. Target Users

| Persona | Description | Permissions |
| --- | --- | --- |
| Admin | User who can create and join challenges; often the initiator for friend groups | Create + join challenges |
| Gordi | Standard user; joins existing challenges | Join challenges only |

## 3\. Scope

### In-Scope (v1)

* Registration with personal and health metadata
* Challenge creation/joining using invite code
* Weekly weight logging (Monday)
* Profile with progress metrics (progress bar, weight chart)
* Challenge detail: group stats, charts, rankings
* All key UI features and data as shown in the wireframe

### Out-of-Scope (v1)

* Social networking (in-app chat, posts, comments)
* 3rd-party integrations (wearables, health apps)
* Mobile app (web app only for now)
* Automated challenge reminders via push/SMS/email

## 4\. User Flows

### Registration Flow

1. Enter: name, email, height (cm), start weight, target weight, aim date for goal
2. Automatic calculation and storage of BMI (start and target)
3. Account created and user is taken to Home

### Challenge Join Flow

1. User enters an invite code
2. Validates code; joins corresponding challenge
3. Challenge appears on user’s Home

### Challenge Creation Flow (Admin)

1. Fill: Name, Start/End date, Prize description
2. Validation: enforce min duration (1 week)
3. Generates unique invite code
4. Challenge card appears on Home

### Weekly Weigh-In Flow

1. On Monday: Prompt to enter new weight (defaults to today’s date)
2. Stores entry, updates charts, progress bars, and rankings

### Viewing Progress

1. Home → Select challenge or profile
2. Profile: See stats, charts, challenges
3. Challenge Detail: Group summary, charts (last week, all weeks, ranking)

## 5\. Functional Requirements

### Screen 1 — Home

* Visible to all logged-in users
* Lists participating challenges as cards displaying challenge name
* Tap card → Challenge Detail
* Profile button (top right or in nav)

### Screen 2 — Profile

* Read-only fields: Name, Email, Height, Start weight (with date), BMI at registration
* Dynamic fields: Current weight & date, current BMI
* Goals: Target weight, BMI at target
* Progress:
  * Weight lost (kg & %)
  * Remaining kg/% to goal
  * **Progress bar** for challenge overall status (% elapsed, % to goal)
  * **Weight-over-time line chart** (API returns weight history series)
* **Weight progress graphic** — A cartesian line chart with three overlaid series:
  * **Actual progress (solid line):** Plots the user's logged weight entries over time (x-axis = date, y-axis = weight in kg). Also has dots to mark every weight input from the user.
  * **Trend prediction (dotted line):** Extends beyond the last logged entry to the aim date, computed via linear regression (or exponential smoothing) on the user's actual entries, showing the projected trajectory if current momentum continues.
  * **Linear goal target (dotted line, distinct style):** A straight line from start weight on the start date to target weight on the aim date, representing the exact linear pace required to reach the goal on time.
  * The chart includes a horizontal dashed line marking the target weight, and shaded regions or annotations for start/target weights. A legend distinguishes the three series.
* List of joined challenges

### Screen 3 — Challenge Detail

* **Header:** Name, Time remaining
* **Last Week Summary:**
  * Table: Name | Start-of-week weight | Weekly loss, sorted by loss desc
  * "All weeks" link/button
* **Weight Chart:**
  * Multiline graph, each participant is one color-coded line
* **Kg Lost Chart:**
  * Bar chart; x-axis = participant, y-axis = total kg lost
* **Ranking:**
  * Table: Rank | Name | Total kg lost (challenge duration)
* **All Weeks:**
  * Table: Week | \[Participant columns\], cells for each participant’s weight per week
  * Cell highlights as per wireframe (e.g., min values)

### Screen 4 — Add Weight Entry

* Fields: Date (defaults to today), Weight (kg)
* Validation: Monday entries only (per UI)
* Save button; feedback on success or error

### Screen 5 — Edit Profile

* Editable fields: Name, Email, Height, Current, Desired weight
* Start weight: Display but not editable
* Save button; validation on all fields

## 6\. Non-Functional Requirements

* Must load all main screens ≤2s (P95)
* Secure data handling, passwords hashed (auth not detailed here)
* All fields validated (non-empty, email format, numeric ranges)
* Accessibility: Color contrast, keyboard navigation, ARIA labels
* Responsive design (desktop/tablet/mobile)
* Charts are accessible and use descriptive hints/captions
* GDPR-compliant storage of personal and health data

## 7\. Data Models

### User

* id (UUID)
* name (string)
* email (string, unique)
* hashed_password (string)
* height_cm (int)
* start_weight_kg (float)
* current_weight_kg (float)
* desired_weight_kg (float)
* aim_date (date)
* created_at
* updated_at
* role (enum: Admin, Gordi)

### Challenge

* id (UUID)
* name (string)
* start_date (date)
* end_date (date)
* prize_description (string)
* invite_code (string, unique)
* created_by (user_id, foreign key)

### Participation

* id
* user_id (foreign key)
* challenge_id (foreign key)
* joined_at (datetime)

### WeightEntry

* id
* user_id (foreign key)
* challenge_id (foreign key)
* date (date)
* weight_kg (float)
* created_at

## 8\. Business Logic

* **BMI Calculation:** BMI = weight_kg / ((height_cm / 100) ^ 2)
* **Challenge duration:** Start/end must be ≥7 days
* **Invite Code:** Random 6–8 character code, unique per challenge
* **Weekly Weigh-In:** Only allow one entry per user/challenge for each Monday
* **Progress Calculations:**
  * Total loss (kg, % since registration)
  * Remaining (kg, % to goal)
  * Progress bar: Weight lost vs total needed for goal
  * Challenge progress (%): Time elapsed vs total challenge duration, weight lost relative to goal
* **Ranking:** Sorted by total kg lost from start of challenge (descending)
* **Data Freshness:** All charts/tables update on new weight entry

## 9\. Open Questions

* What anti-cheating or auditing is required to ensure weight authenticity?
* Should notifications/reminders be sent for missed weigh-ins (if so, method)?
* Should users be able to leave or rejoin ongoing challenges?
* Is there a max/min user limit per challenge?
* What should happen if a user misses multiple weigh-ins?
* Are prize winners handled automatically, or externally (manual)?

---

**End of PRD**