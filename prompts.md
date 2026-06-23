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

## 8. Feature Implementation Prompts (Delivery 2)

These prompts demonstrate how tickets were executed during Delivery 2 using the Developer Agent and associated skills.

### Prompt 8.1: DVX-TK-023 — Dividends Activity Screen

**Objective:** Implement the full Dividend Activity screen with MVI pattern, collapsible month groups, and 12-month projection chart.

**Prompt:**
```
Execute ticket DVX-TK-023. Follow the task-planner subtasks exactly.

Context:
- Module: :feature:dividends
- User Stories: DVX-US-016, DVX-US-017, DVX-US-018, DVX-US-019
- PRD: PRD-04
- ADRs: ADR-010 (MVI), ADR-011 (Navigation)
- Design Reference: https://stitch.withgoogle.com/projects/10568397103146599411
- Depends on: TK-022 (integration:dividend is already complete)

Implementation order:
1. Scaffold :feature:dividends module (dividox.kmp.library + dividox.compose.multiplatform + dividox.kmp.ios + dividox.kmp.test)
2. DividendsContract — State: summary, projectionBars, upcomingPayments, historyByMonth, expandedMonths, isLoading, error
   Events: SecurityClicked, MonthGroupToggled, Refresh
   Effects: NavigateToSecurity(ticker)
3. DividendsViewModel with unit tests — call all 4 integration use cases on init; expand most recent month by default
4. DividendsScreen composable:
   - Critical Metrics Block (6 values + YoC progress indicator)
   - 12-month bar chart (filled past / outlined future)
   - Upcoming Payments list (Confirmed green / Estimated gray badge)
   - Collapsible month groups (Cash vs Reinvested visual distinction)
5. Wire DividendsRoute in mainGraph — onSecurityClick(ticker) → SecurityDetailRoute
6. Register :feature:dividends Koin module in App.kt

Verify at each phase:
- ./gradlew :feature:dividends:compileKotlinJvm
- ./gradlew :feature:dividends:jvmTest
- ./gradlew :composeApp:assembleDebug
- ./gradlew detekt
```

**Output:** Full `:feature:dividends` module with ViewModel tests, screen composable, and navigation wiring.

---

### Prompt 8.2: DVX-TK-026 — Search Feature with Debounce

**Objective:** Implement search screen with 250ms debounce, real-time results from Yahoo Finance, and favorite toggle.

**Prompt:**
```
Execute ticket DVX-TK-026. Use skill: implement-ui for the screen, skill: implement-domain 
for the debounce logic, and skill: write-unit-test for ViewModel coverage.

Context:
- Module: :feature:search
- User Story: DVX-US-026
- PRD: PRD-07
- Depends on: TK-025 (SecurityCard composable already in :common:ui-resources)

Requirements:
1. SearchContract:
   - State: query, results: List<EnrichedWatchlistEntry>, isLoading, isEmpty, error
   - Events: QueryChanged, FavouriteToggled(ticker), SecurityClicked(ticker), BackClicked
   - Effects: NavigateToSecurity, NavigateBack

2. SearchViewModel:
   - SearchSecuritiesUseCase with 250ms debounce (use kotlinx.coroutines.delay + Job cancellation)
   - IsInWatchlistUseCase for initial heart state
   - AddToWatchlistUseCase / RemoveFromWatchlistUseCase on toggle

3. SearchScreen:
   - Auto-focus search bar with back arrow + "Search" title
   - Placeholder state (before first char typed)
   - Loading skeleton while fetching
   - SecurityCard for each result (from :common:ui-resources)
   - No-results: "No results for '{query}'."
   - Offline: "Search requires an internet connection."
   - Disclaimer footer: "Prices delayed 15 minutes"

4. Navigation:
   - SearchRoute opens from central FAB in BottomNavBar
   - onSecurityClick → SecurityDetailRoute
   - onBack → popBackStack

Commit messages follow: DVX-TK-026 <description>
```

**Output:** Full `:feature:search` module with debounced search, SecurityCard integration, and FAB wiring.

---

### Prompt 8.3: DVX-TK-035 — Market Indices Carousel

**Objective:** Add a horizontal carousel of global market index cards to the Dashboard, loading independently of other content.

**Prompt:**
```
Execute ticket DVX-TK-035. This is a new Dashboard section, not a new module.

Context:
- Indices: Nasdaq (^IXIC), EURO STOXX 50 (^STOXX50E), IBEX 35 (^IBEX), DAX (^GDAXI), 
  Nikkei 225 (^N225), FTSE 100 (^FTSE)
- Data source: existing Yahoo Finance integration in :component:market
  using query1.finance.yahoo.com/v8/finance/chart/{ticker}
- ADRs: ADR-005, ADR-007, ADR-010
- Depends on: TK-015 (component:market), TK-018 (feature:dashboard), TK-029 (settings for defaultMarket)

Implementation plan:
1. Domain model in :component:market:
   - MarketIndexQuote(name, ticker, marketKey, points, changePoints, changePercent, lastUpdated)
   - Catalog of 6 supported indices with display name, Yahoo ticker, and market key

2. GetMajorMarketIndicesUseCase:
   - Fetch all 6 through existing MarketRepository.getMultipleQuotes
   - Sort: user's defaultMarket first, then stable global order
   - Partial success: return available results even if some symbols fail
   - Unit tests: ordering, partial failure, all-failed error, field mapping

3. Extend DashboardContract + DashboardViewModel:
   - Add marketIndices: List<MarketIndexQuote> to state
   - Load independently (separate coroutine) — must not delay portfolio/watchlist rendering

4. Dashboard carousel UI:
   - Horizontal LazyRow of cards
   - Each card: index name, signed % change (green/red), current points, absolute points +/-
   - Use MaterialTheme.spacing for all dimensions

Verify: ./gradlew :component:market:jvmTest :composeApp:jvmTest :composeApp:assembleDebug detekt
```

**Output:** Market indices carousel on Dashboard with independent loading and user's preferred market first.

---

### Prompt 8.4: DVX-TK-038 — MASVS Security Tooling

**Objective:** Create a full suite of MASVS v2 security audit skills for automated security review across all code areas.

**Prompt:**
```
I need a complete OWASP MASVS v2 security audit tooling suite for DiviDox.

Context:
- DiviDox is a fintech app at NowSecure Tier 2 (PII + Financial Data)
- Required MASVS categories: STORAGE, CRYPTO, AUTH, NETWORK, PLATFORM, CODE, PRIVACY
- Optional: RESILIENCE (Tier 3)
- Stack: Kotlin Multiplatform, Android Keystore, iOS Keychain, Ktor HTTP, Firebase Auth

Create the following skills under .ai-context/skills/:
1. masvs-checklist — Full compliance report for releases
2. masvs-auth-assessment — Login, tokens, sessions, biometrics, Google Sign-In
3. masvs-secure-storage-audit — SharedPreferences, DataStore, SQLite, Room, files
4. masvs-crypto-review — Encryption, key generation, Keystore/Keychain
5. masvs-network-security-check — Ktor, TLS config, certificates
6. masvs-platform-interaction-review — Deep links, WebViews, Intents, Manifest
7. masvs-code-quality-scan — Dependencies, minSdk, R8/ProGuard, input validation
8. masvs-privacy-audit — Permissions, analytics SDKs, user identifiers
9. masvs-resilience-assessment — Anti-tampering, root detection, obfuscation
10. masvs-mobile-threat-model — Architecture, data flows, threat surface

Also create:
- .ai-context/security-instructions.md — Central security context file linking all skills
- .github/prompts/masvs-audit.prompt.yml — GitHub Copilot prompt for the same audit

Each skill must output a structured PASS/WARN/FAIL report with:
- Executive Summary (risk level)
- Findings Table (category, control, status, severity, location)
- Detailed Findings with evidence and fix
- Recommended Next Steps

Reference: OWASP MASVS v2, OWASP MASTG, NowSecure guidelines
```

**Output:** 10 MASVS skills, security-instructions.md, and GitHub Copilot prompt YAML.

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
- Use **Prompt 8.x** patterns to execute tickets with the Developer Agent
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

**For security:**
- Use **Prompt 8.4** to create MASVS audit tooling
- Run security skills on every PR touching auth, network, or storage

---

**Last Updated:** June 23, 2026
**Version:** 2.0 (Project Workflow - 8 Sections, including Implementation & Security Prompts)
**Created by:** DiviDox Architecture Team (AI-assisted)
