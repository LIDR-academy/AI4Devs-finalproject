# Prompt: Generate a PRD for a Weight-Loss Challenge Web App

---

## Role

You are a senior Product Manager and UX strategist with deep experience writing Product Requirements Documents (PRDs) for consumer-facing web applications. You excel at translating rough product ideas, wireframes, and business logic into clear, structured, and developer-ready documentation.

---

## Objective

Write a comprehensive, professional **PRD in English** for a **weight-loss challenge web application**. The PRD must be precise, unambiguous, and ready to hand off to a design and engineering team. It must incorporate all requirements described below **and** reflect the UI/UX details visible in the wireframe image provided.

---

## Context & Background

The product is a **social weight-loss challenge platform**. Friends join a shared challenge (via an invite code, similar to online game lobbies) and motivate each other to lose weight over a defined period. The platform tracks individual weight progress, calculates BMI, and ranks participants by weight lost.

---

## Users & Roles

There are two user roles:

| Role | Permissions |
|------|-------------|
| **Admin** | Can create challenges AND participate in them |
| **Gordi** (standard user) | Can only participate in existing challenges |

---

## Registration

When a user registers, they must provide:

- Full name
- Email address
- Current weight (kg)
- Height (cm)
- Desired/target weight (kg)
- Aim date to reach the desired weight

The system must automatically calculate and store:
- BMI at registration (`weight / height²`)
- BMI for desired weight

---

## Core Features

### 1. Joining a Challenge
- Users join an existing challenge using a **unique invite code** (similar to online game room codes).
- The code is generated when an Admin creates a challenge.

### 2. Creating a Challenge (Admin only)
Required fields:
- Challenge name
- Start date
- End date
- Prize description

Business rules:
- A challenge must last **at least 1 week**.

### 3. Weekly Weight Entry
- Every **Monday**, each participant must log their current weight.
- The date field should **default to today's date**.

---

## Screens & Detailed Requirements

### Screen 1 — Home
- Lists all challenges the logged-in user is participating in.
- Each challenge is shown as a card displaying the **challenge name**.
- Provides navigation access to the user's **Profile**.

---

### Screen 2 — Profile
Displays the following information:

**Static (from registration):**
- Name
- Email
- Height (cm)
- Start weight (weight at registration) + date
- BMI at registration

**Dynamic (current):**
- Current weight + date
- Current BMI

**Goal:**
- Desired/target weight
- BMI at desired weight

**Progress metrics:**
- Total weight lost since registration (in kg and %)
- Remaining weight to reach goal (in kg and %)
- Visual **status progress indicator** (relative to time elapsed and weight lost)
- **Weight progress chart** (line graph over time)

**Other:**
- List of challenges the user is participating in

> ⚠️ The wireframe shows a **progress bar** for overall challenge progress (%) and a **line graph** for weight evolution over time. Both must be included.

---

### Screen 3 — Challenge Detail
This screen has multiple sub-sections:

#### 3a. Challenge Header
- Challenge name
- Time remaining (e.g., "3 weeks left")

#### 3b. Last Week Summary (table)
Columns:
- Participant name
- Weight (kg) at beginning of current week / end of last week
- Weight lost (kg) last week

Sorted by: **weight lost descending**

Includes a link/button: **"All weeks"**

#### 3c. Weight Chart
- Line graph showing **each participant's weight** from the beginning of the challenge.
- One line per participant, color-coded.

#### 3d. Kg Lost Chart
- Bar chart showing **total kg lost per participant** since the beginning of the challenge.

#### 3e. Ranking
- Leaderboard considering the **entire challenge duration** (not just last week).
- Columns: Rank, Name, Total kg lost
- Ranking is global for the whole challenge.

#### 3f. All Weeks View (table)
- Columns: Week date, Weight per participant
- Each participant has their own column.
- Highlights cells where applicable (e.g., lowest weight in a column, as suggested by the wireframe).

---

### Screen 4 — Add Weight Entry
- Fields: Date (defaults to today), Weight (kg)
- Save button
- Simple, minimal form.

---

### Screen 5 — Edit Profile
- Editable fields: Name, Email, Height, Original weight (read context), Current weight, Desired weight.
- Save button.

---

## Business Rules Summary

| Rule | Detail |
|------|--------|
| Minimum challenge duration | 1 week |
| Weekly weigh-in day | Every Monday |
| Default date on forms | Today's date |
| BMI formula | `weight (kg) / height (m)²` |
| Ranking scope | Entire challenge (not per week) |

---

## Wireframe Reference

The wireframe image included shows the following screens:
- **Home** (challenge list + profile access)
- **Profile** (with progress bar, stats, and weight line chart)
- **Edit Profile** (form)
- **Challenge Detail** (last week table, weight chart, kg lost chart)
- **Ranking** (leaderboard)
- **All Weeks** (full data table)
- **Add Weight** (simple form)

> The PRD must describe UI components and data displayed consistently with what is shown in the wireframe. Where the wireframe contradicts or adds detail beyond the text description, **the wireframe takes precedence**.

---

## PRD Output Structure

Please structure the PRD using the following sections:

1. **Overview** — Product summary, problem statement, goals
2. **Target Users** — Personas and roles
3. **Scope** — In-scope and out-of-scope features (v1)
4. **User Flows** — Key flows (registration, joining a challenge, weekly weigh-in, viewing progress)
5. **Functional Requirements** — Broken down by screen/feature
6. **Non-Functional Requirements** — Performance, security, accessibility basics
7. **Data Models** — Key entities (User, Challenge, Period, WeightEntry) with fields and relationships
8. **Business Logic** — Rules, validations, calculations (BMI, progress %, ranking)
9. **Open Questions** — Anything that needs clarification before development begins

---

## Tone & Format

- Write in **clear, professional English**.
- Use **tables, bullet points, and headers** for scannability.
- Be **specific and unambiguous** — avoid vague language like "some data" or "appropriate validation".
- Assume the reader is a **mid-level full-stack developer** who will implement this without further explanation.