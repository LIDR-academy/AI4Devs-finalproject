# DiviDox Prompts — Project Generation Guide

This document contains the **exact prompts** used to generate all documentation and architecture for DiviDox using AI assistance. Each prompt was executed sequentially in the logical order of real-world project execution: Vision → Requirements → User Stories → Architecture Decisions → System Design → Visual Mockups.

---

## Prompt Execution Order (Project Workflow)

These prompts follow the natural flow of building a project:

1. **Define Vision** — What problem are we solving?
2. **Define Requirements** — What are the PRDs for each feature?
3. **Define User Stories** — How do users interact with features?
4. **Make Architecture Decisions** — What are our key technical choices?
5. **Design System Architecture** — How do we structure the codebase?
6. **Create Visual Mockups** — What does the UI look like?

---

## 1. Project Vision & Overview

### Prompt 1.1: Project Vision & Overview

**Objective:** Define the problem, value proposition, key features, and UX flow at a high level.

**Prompt:**
```
You are an expert product architect. I'm building DiviDox, a cross-platform dividend portfolio 
tracker for individual investors using Kotlin Multiplatform. 

Help me define the product overview by answering:

1. What is the core problem DiviDox solves for dividend investors?
2. What are the 5 key features that differentiate it from other portfolio trackers?
3. How should the user experience flow from splash screen → authentication → dashboard?
4. What platforms should we support (Android, iOS, Desktop)?
5. What design system should we use? (Material Design 3, custom, etc.)

Generate a comprehensive product overview section (300-500 words) that includes:
- Objective & problem statement
- Key features with brief descriptions
- User experience flow
- Design system specification

Format as markdown with clear subsections.
```

**Output:** README section 1.1-1.3 (Objective, Key Features, UX Design)

---

## 2. Requirements & User Stories Prompts

### Prompt 2.1: Product Requirements Documents (PRDs)

**Objective:** Define feature specifications as 8 PRD modules (Auth, Dashboard, Portfolio, Dividends, Analysis, Favorites, Search, Settings).

**Prompt:**
```
Create a comprehensive Product Requirements Document (PRD) for DiviDox based on the Project Vision and Overview.

For each PRD:
- Write a 200-300 word feature description
- List 5-7 acceptance criteria
- Specify user role (individual investor)
- Note any dependencies (e.g., PRD-02 depends on PRD-01)

Format as separate markdown files: PRD-01.md, PRD-02.md, ... PRD-08.md
Each file: one feature only, with clear sections.
```

**Output:** docs/prd/PRD-01.md through PRD-08.md

---

### Prompt 2.2: User Stories with Acceptance Criteria

**Objective:** Convert PRDs into actionable user stories with testable acceptance criteria.

**Prompt:**
```
Convert the DiviDox product requirements on /docs/prd file into detailed user stories 
following the format: "As a [role], I want to [action], so that [benefit]"

For each user story:
- **Story ID:** DVX-US-XXX
- **Title:** One-line summary
- **Story:** Full "As a... I want... so that..." statement
- **Acceptance Criteria:** 4-5 bullet points (testable conditions)
- **Story Points:** T-shirt sizing (S=1-2, M=3-5, L=8-13, XL=21+)
- **Dependencies:** List related stories or modules
- **Test Cases:** How to verify acceptance criteria

Format as markdown with a table of contents. Each story gets its own subsection.
```

**Output:** docs/user-stories.md

---

## 3. Architecture & Technical Decisions

### Prompt 3.1: Architecture Decision Records (ADRs)

**Objective:** Document key architectural decisions with context, rationale, consequences, and alternatives.

**Prompt:**
```
Create Architecture Decision Records (ADRs) for DiviDox covering:

Each ADR should follow this structure:
1. **Title:** Brief 5-10 word summary
2. **Context:** Why is this decision needed? What's the problem?
3. **Decision:** What did we decide?
4. **Rationale:** Why this approach? What are the tradeoffs?
5. **Consequences:** What will be affected? (positive & negative)
6. **Alternatives:** What other options did we consider?
```

**Output:** docs/adr/ADR-001.md through ADR-013.md

---

## 4. System Architecture & Design

### Prompt 4.1: System Architecture & High-Level Design

**Objective:** Design layered modular architecture, integration diagrams, module structure, and dependencies.

**Prompt:**
```
I have a cross-platform Kotlin Multiplatform (KMP) project called DiviDox. 

Design a layered modular architecture that:
1. Separates presentation (screens) from domain logic
2. Follows Clean Architecture principles
3. Supports Kotlin Multiplatform (Android/iOS/Desktop)
4. Integrates Firebase (Auth + Firestore) as the backend
5. Fetches market data from Yahoo Finance API

Please provide:
1. A high-level system integration diagram (mermaid) showing:
   - DiviDox app
   - Firebase Auth, Firestore
   - Yahoo Finance API
   - Local Room DB (cache)
   - Data flow between components

2. A detailed layered architecture diagram showing:
   - App Layer (navigation, DI)
   - Presentation Layer (features as screens)
   - Integration Layer (shared business logic)
   - Domain + Data Layer (components)
   - Common Utilities Layer
   - How each layer depends on others

3. A module structure explanation:
   - List all :feature:* modules (auth, dashboard, portfolio, etc.)
   - List all :component:* modules (auth, market, security, dividend)
   - List all :common:* modules (auth, network, ui-resources, settings)
   - Describe module isolation rules

4. A project directory structure (tree format) showing:
   - dividox/composeApp/ (app layer)
   - dividox/feature/ (presentation)
   - dividox/component/ (domain + data)
   - dividox/common/ (utilities)
   - dividox/docs/ (documentation)

Format all diagrams as mermaid graphs. Provide clear explanations for each architectural decision.
```

**Output:** README section 2.0-2.6 (Architecture diagrams, module layers, security, testing)

---

## 5. Visual Design & UI Mockups

### Prompt 5.1: App Screenshots & UI Mockups (Stitch)

**Objective:** Describe visual appearance of 5 key screens for Stitch design system prototype.

**Prompt:**
```
Describe the visual appearance of 5 key DiviDox screens for a design system prototype:

1. **Dashboard Screen (Primary View)**
   - Portfolio value card (large, prominent)
   - Today's gain/loss with color indicator (green/red)
   - Quick-access favorites carousel
   - Period selector buttons (1D, 1W, 1M, 1Y, ALL)
   - Bottom navigation bar (5 tabs)

2. **Portfolio/Holdings Screen**
   - List of user's positions
   - Each card: ticker, company name, shares, current value, gain/loss %
   - Ability to add new holding (FAB button)
   - Swipe to edit/delete

3. **Security Analysis Screen**
   - Stock name & ticker (header)
   - Price chart (interactive, multiple timeframes)
   - Current price, P/E ratio, market cap (metrics grid)
   - Dividend yield, payout ratio
   - Fundamental data cards

4. **Dividend Activity Screen**
   - Historical timeline (5+ years)
   - Annual projection card
   - Upcoming ex-dividend dates
   - Payment frequency indicator

5. **Settings Screen**
   - User profile info
   - Base currency selector
   - Notification toggles
   - Biometric lock option
   - Data export button
   - Delete account button

For each screen:
- Describe layout hierarchy (header, body, footer)
- Specify Material Design 3 components used
- Note color palette (Material You dynamic colors)
- Mention responsive behavior (mobile, tablet, desktop)
- Include dark mode adaptation

Format as markdown with ASCII art mockups or link to Figma/Stitch prototype.
Reference: https://stitch.withgoogle.com/projects/10568397103146599411
```

**Output:** docs/images/stitch.png (interactive prototype) + README section 1.3.1-1.3.2

---

## 6. Work Tickets & Implementation Tasks

### Prompt 6.1: Work Tickets Breakdown

**Objective:** Decompose user stories into detailed work tickets with subtasks, acceptance criteria, and testing strategy.

**Prompt:**
```
Based on the DiviDox user stories and architecture, create detailed work tickets for full implementation:

For each ticket:
- **Ticket ID:** DVX-TK-XXX
- **Title:** One-line summary
- **Module:** :component:*, :feature:*, :integration:*
- **Scope:** 2-3 paragraph description
- **Subtasks:** 8-12 actionable, sequential steps
- **Acceptance Criteria:** 5-7 testable conditions
- **Testing:** Unit, integration, UI test strategy
- **Definition of Done:** QA checklist
- **Estimated Effort:** T-shirt size (S/M/L/XL)
- **Dependencies:** Other tickets that must be done first

Format as separate markdown files: docs/tickets/TK-011.md through TK-020.md
Include dependency diagrams and roadmap.
```

**Output:** docs/tickets/TK-011.md, TK-015.md, TK-018.md (Delivery 1) + TK-012 through TK-020 (Delivery 2)

---

## 7. Integration & Deployment

### Prompt 7.1: CI/CD & GitHub Actions

**Objective:** Define automated build, test, and deployment pipelines using GitHub Actions.

**Prompt:**
```
Create a CI/CD pipeline for DiviDox using GitHub Actions that enables:

1. **Build Workflow:**
   - Trigger: push to main, pull requests
   - Steps:
     1. Checkout code
     2. Setup JDK 17
     3. Run Gradle build (compileDebug for all platforms: Android, iOS, Desktop)
     4. Run detekt (code quality analysis)
     5. Run unit tests (Kotlin test framework)
     6. Build apk/app/jar artifacts
     7. Upload build artifacts to GitHub artifacts storage

2. **Testing Workflow:**
   - Trigger: every commit
   - Steps:
     1. Run Kotlin linter (ktlint)
     2. Run unit tests with coverage
     3. Generate coverage report (JaCoCo)
     4. Comment coverage on pull requests
     5. Fail if coverage drops below 70%

3. **Security Workflow:**
   - Trigger: on pull requests
   - Steps:
     1. Scan for secrets (gitleaks)
     2. Check dependencies (OWASP dependency-check)
     3. Run spotbugs (potential bugs detection)
     4. Block merge if critical issues found

4. **Deployment Workflow (Manual):**
   - Trigger: manual dispatch on GitHub
   - Steps:
     1. Build production APK (signed)
     2. Deploy to Firebase App Distribution for testing
     3. Notify testers via Slack
     4. Comment deployment link on PR

For each workflow:
- Include error handling & notifications
- Show how to set up secrets (API keys, credentials)
- Document manual triggers vs. automatic

Include troubleshooting guide for common CI/CD failures.
```

**Output:** README section on CI/CD

---

## How to Use This Prompt Guide

**For new projects:**
1. Start with **Prompt 1.1** to define vision & value proposition
2. Move to **Prompts 2.1 & 2.2** to define requirements and user stories
3. Execute **Prompt 3.1** to make architectural decisions
4. Run **Prompt 4.1** to design system architecture
5. Finish with **Prompt 5.1** to create visual mockups

**For feature development:**
- Use **Prompt 2.1** to write PRD for new feature
- Use **Prompt 2.2** to decompose into user stories
- Create ADRs if new architectural decisions needed

**For design system updates:**
- Use **Prompt 5.1** to revise screen designs
- Update Stitch prototype with new mockups

**For work breakdown:**
- Use **Prompt 6.1** to create tickets for new features
- Link tickets to user stories
- Track dependencies between tickets

**For CI/CD setup:**
- Use **Prompt 7.1** to configure automated builds, tests, and deployments
- Enable pull request checks before merge
- Setup Firebase App Distribution for testing

---

**Last Updated:** May 20, 2026
**Version:** 1.0 (Project Workflow - 7 Core Prompts)
**Created by:** DiviDox Architecture Team (AI-assisted)
