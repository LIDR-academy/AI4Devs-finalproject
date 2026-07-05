# Epics — Personal Training Management Platform

## Overview

This directory defines the project in a hierarchical structure:

```
Epics (milestones) → User Stories (value delivery) → Tasks (technical work)
```

**No. of Epics:** 5 | **User Stories:** 23 | **Tasks:** ~160

---

## Development Order

| Order | Epic | Milestone | Stories | Tasks |
|-------|------|-----------|---------|-------|
| 1 | [EP-01: Auth & User Foundation](./EP-01-auth-user-foundation.md) | **Users can log in; Admins manage users** | 4 | ~28 |
| 2 | [EP-02: Core Scheduling Engine](./EP-02-core-scheduling.md) | **Coaches/Admins schedule and manage classes** | 5 | ~35 |
| 3 | [EP-03: Coachee Self-Service](./EP-03-coachee-self-service.md) | **Coachees manage their own participation** | 4 | ~27 |
| 4 | [EP-04: Notifications & Automation](./EP-04-notifications-automation.md) | **All events trigger automatic notifications** | 5 | ~31 |
| 5 | [EP-05: Production Launch](./EP-05-production-launch.md) | **App is secure, tested, and deployable** | 5 | ~33 |

---

## Dependency Graph

```
EP-01 (Auth & User Foundation)
│
└── EP-02 (Core Scheduling Engine)
    │
    ├── EP-03 (Coachee Self-Service)
    │   │
    │   └── EP-04 (Notifications & Automation)
    │
    └── EP-05 (Production Launch)
```

---

## Epic Details

### EP-01: Auth & User Foundation
**Milestone:** *Users can log in; Admins manage Coachees, Coaches, and levels*
| Story | Summary |
|-------|---------|
| US-1.1 | User Login & Session Management |
| US-1.2 | Coachee Lifecycle Management |
| US-1.3 | Coach Lifecycle & Financial Data |
| US-1.4 | Level System & Role-Based UI |

### EP-02: Core Scheduling Engine
**Milestone:** *Coaches and Admins can schedule and manage classes visually*
| Story | Summary |
|-------|---------|
| US-2.1 | Google Calendar as Scheduling Engine |
| US-2.2 | Class Creation (Individual, Group, Recurring) |
| US-2.3 | Class Viewing & Cancellation |
| US-2.4 | Calendar Block Management |
| US-2.5 | Admin/Coach Calendar UI |

### EP-03: Coachee Self-Service
**Milestone:** *Coachees can independently join, view, and cancel classes, and manage waiting lists*
| Story | Summary |
|-------|---------|
| US-3.1 | Class Enrollment & Cancellation |
| US-3.2 | Coachee Dashboard & Calendar |
| US-3.3 | Waiting List Join/Leave |
| US-3.4 | Calendar Interactions for Coachees |

### EP-04: Notifications & Automation
**Milestone:** *All events trigger automatic notifications; waiting lists are auto-processed*
| Story | Summary |
|-------|---------|
| US-4.1 | Push Notification Infrastructure |
| US-4.2 | Waiting List Automation |
| US-4.3 | Class Lifecycle Notifications |
| US-4.4 | Profile Change Notifications |
| US-4.5 | In-App Notification Center |

### EP-05: Production Launch
**Milestone:** *Application is secure, tested, deployable, and mobile-ready*
| Story | Summary |
|-------|---------|
| US-5.1 | Security Hardening |
| US-5.2 | Testing Suite |
| US-5.3 | CI/CD & Deployment |
| US-5.4 | PWA & Mobile Optimization |
| US-5.5 | Monitoring, Logging & Documentation |

---

## Structure

```
docs/epics/
├── README.md                          # This file
├── EP-01-auth-user-foundation.md      # Epic 1: 4 user stories
├── EP-02-core-scheduling.md           # Epic 2: 5 user stories
├── EP-03-coachee-self-service.md      # Epic 3: 4 user stories
├── EP-04-notifications-automation.md  # Epic 4: 5 user stories
├── EP-05-production-launch.md         # Epic 5: 5 user stories
└── userStories/
    ├── US-1.1-user-login-session.md
    ├── US-1.2-coachee-lifecycle.md
    ├── US-1.3-coach-lifecycle.md
    ├── US-1.4-levels-role-ui.md
    ├── US-2.1-google-calendar-integration.md
    ├── US-2.2-class-creation.md
    ├── US-2.3-class-viewing-cancellation.md
    ├── US-2.4-block-management.md
    ├── US-2.5-admin-coach-calendar-ui.md
    ├── US-3.1-enrollment-cancellation.md
    ├── US-3.2-coachee-dashboard-calendar.md
    ├── US-3.3-waiting-list-join-leave.md
    ├── US-3.4-calendar-interactions.md
    ├── US-4.1-push-notification-infrastructure.md
    ├── US-4.2-waiting-list-automation.md
    ├── US-4.3-class-lifecycle-notifications.md
    ├── US-4.4-profile-change-notifications.md
    ├── US-4.5-in-app-notification-center.md
    ├── US-5.1-security-hardening.md
    ├── US-5.2-testing-suite.md
    ├── US-5.3-cicd-deployment.md
    ├── US-5.4-pwa-mobile-optimization.md
    └── US-5.5-monitoring-documentation.md
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **5 epics instead of 10** | Each epic is a milestone that delivers end-to-end value to a stakeholder |
| **23 user stories instead of 119** | Stories describe *what* a user can do, not *how* it's built |
| **Tasks in separate directory** | Keeps epics focused on value; tasks are technical breakdowns |
| **Waiting list split across EP-03/04** | EP-03: User-facing join/leave. EP-04: Backend automation + notifications |
| **Notifications as a separate epic** | 12 notification types + FCM infra + in-app UI warrant their own milestone |

---

## Notes for Linear Import

| Artifact | Linear Entity | How to Import |
|----------|---------------|---------------|
| Epic | **Epic** | Create from each `EP-*.md` — description includes milestone definition |
| User Story | **Issue** | Create from each user story within the epic — title, description, acceptance criteria |
| Task | **Sub-issue / Checklist** | Add as sub-issues or checklist items — tracked independently with assignees |
| Dependency | **Issue link** | Link epics according to dependency graph; mark blocking relationships |

**Suggested labels:** `backend`, `frontend`, `infrastructure`, `security`, `testing`, `docs`
