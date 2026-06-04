# Feature Specification: HomePath MVP

**Feature Branch**: `001-homepath-mvp`

**Created**: 2026-06-04

**Status**: Draft

**Input**: AI-powered financial companion for Spanish first-time home buyers. Three pillars: listing transparency (Listing Lens), mortgage education (Mortgage Compass), and progress tracking (Dashboard). PWA mobile-first, no auth, educational tool.

## User Scenarios & Testing

### User Story 1 - Listing Lens: Analyze a Property Listing (P1)

A user pastes an Idealista or similar listing URL. The system fetches the listing content server-side, runs an LLM-powered analysis to detect manipulative language, missing information, and red flags. It cross-references the estimated location against cadastral data to verify claimed vs actual square meters and construction year. The result is a transparency score and a detailed report of what the listing reveals — and what it hides.

**Why this priority**: The entry point. Hooks users with immediate value. Demonstrates AI engineering (LLM prompt design, structured output parsing, external API integration). Each user story is independently deployable, but this one provides the strongest "wow" moment for first-time visitors.

**Independent Test**: Paste a known listing URL → verify score, red flags, and cadastral comparison are returned. Can be fully tested with a mocked listing endpoint.

**Acceptance Scenarios**:

1. **Given** a valid listing URL, **When** the user submits it, **Then** a transparency score (0-100) and red flags list are displayed within 10 seconds.
2. **Given** an invalid or unreachable URL, **When** the user submits it, **Then** an error message is shown with a prompt to paste listing text manually.
3. **Given** a listing with location clues, **When** analysis completes, **Then** a confidence percentage for estimated location and a MiraTuZona link are shown.
4. **Given** cadastral data is available for the estimated location, **When** analysis completes, **Then** a comparison of claimed m² vs cadastral m² and construction year is displayed.
5. **Given** a listing with no energy certificate mentioned, **When** analysis completes, **Then** "missing energy certificate" appears as a red flag.

---

### User Story 2 - Mortgage Compass: Understand Real Costs & Options (P1)

A user enters property price, savings, monthly income, and existing debts. The system calculates the hidden costs of buying (ITP/IVA, notaría, registro, gestoría, tasación) and reveals the real cash needed — often 10-12% above the listing price. The user then answers 2-3 risk-tolerance questions to build a persona. Based on the persona and real numbers, the system shows 30-year mortgage scenarios with voluntary amortization paths (none, light, moderate, aggressive) and compares them against an investing alternative. All outputs are educational narratives, never financial advice.

**Why this priority**: The core differentiator. No existing tool shows Spanish buyers the amortization-vs-investing tradeoff alongside hidden costs in a persona-driven experience. This is the feature that makes the project memorable.

**Independent Test**: Enter property price + savings + income → verify hidden costs breakdown, persona questions, and strategy comparison table are generated. No external dependencies beyond basic math.

**Acceptance Scenarios**:

1. **Given** property price €200,000, savings €45,000, and income €3,500/month, **When** the user submits, **Then** hidden costs (ITP/IVA, notaría, registro, gestoría, tasación) are itemized and the total cash needed (~€58,200) is shown with a gap indicator.
2. **Given** the user has completed the financial profile, **When** they answer persona questions, **Then** a recommended mortgage duration (30, 25, or 20 years) is suggested based on affordability.
3. **Given** a 30-year mortgage at 3.5% for €160,000, **When** the strategy playground loads, **Then** four scenarios are shown: baseline (no amortization), light (€100/mo), moderate (€300/mo), aggressive (€500/mo) — each with years shortened and interest saved.
4. **Given** all scenarios are displayed, **When** the investing alternative is shown, **Then** the estimated portfolio value at 30 years (5-7% annual return) is displayed alongside the amortization scenarios.
5. **Given** a conservative persona, **When** the narrative is generated, **Then** the educational takeaway emphasizes guaranteed savings through amortization.

---

### User Story 3 - Dashboard: Track Your Journey (P2)

A user sees a dashboard summarizing their analyzed listings, financial profile snapshot, and quick access to all tools. The dashboard persists data per anonymous session (UUID) with no login required. Users can re-analyze previously viewed listings to see what changed (snapshot diff).

**Why this priority**: Retention and navigation hub. Ties the two P1 features together into a coherent experience. Demonstrates data persistence and state management.

**Independent Test**: Analyze a listing, complete a financial profile, then reload the dashboard → verify all data persists and is displayed correctly.

**Acceptance Scenarios**:

1. **Given** a user has analyzed 3 listings, **When** they visit the dashboard, **Then** all 3 listings are shown with scores, dates, and quick re-analyze buttons.
2. **Given** a user has completed the financial profile, **When** they visit the dashboard, **Then** a snapshot of affordability and hidden costs is displayed.
3. **Given** a previously analyzed listing, **When** the user clicks "re-analyze", **Then** a new analysis is run and any differences from the previous snapshot are highlighted (e.g., "Price changed: -€10,000 since last analysis").
4. **Given** a fresh session with no data, **When** the user visits the dashboard, **Then** an empty state with CTAs to try Listing Lens and Mortgage Compass is shown.

---

### User Story 4 - Interactive Timeline: Know What's Next (P3)

A user views a visual 60-90 day timeline of the home buying process from arras (deposit) to escritura (deed signing). Each milestone shows what happens, what documents are needed, and typical duration.

**Why this priority**: Contextual help that reduces anxiety. Spanish buyers often don't know the sequence of events. Independently valuable but enhances the overall experience.

**Independent Test**: Open the timeline page → verify all milestones are displayed with descriptions and durations.

**Acceptance Scenarios**:

1. **Given** the timeline page, **When** a user opens it, **Then** a visual timeline with milestones from arras to escritura is displayed with estimated durations.
2. **Given** the timeline, **When** a user taps a milestone, **Then** detailed information about that stage (documents needed, typical duration, tips) is shown.

---

### User Story 5 - Document Checklist: Don't Miss Anything (P3)

A user tracks which documents they have and which they still need for each stage of the buying process. Checklist items are organized by milestone (pre-arras, post-arras, pre-escritura, post-escritura).

**Why this priority**: Practical tool for the bureaucratic maze. Simple to implement but highly useful for Spanish buyers who face a complex document trail.

**Independent Test**: Open the checklist → toggle items → verify progress persists on reload.

**Acceptance Scenarios**:

1. **Given** the checklist page, **When** a user opens it, **Then** items are grouped by stage with a progress percentage per stage.
2. **Given** a checklist item, **When** the user toggles it complete, **Then** the progress percentage updates and the state persists across sessions.

---

### Edge Cases

- What happens when the LLM returns malformed JSON for listing analysis? Fallback to `@avena/score` numeric scoring.
- What happens when the Cadastro API is unreachable? Show a message that cadastral verification is unavailable, still display the LLM-based analysis.
- What happens when a URL returns a 403 or requires JavaScript? Attempt `.m.` mobile subdomain, then offer manual text paste fallback.
- What happens when the user has no savings entered in Mortgage Compass? Flag the gap clearly and suggest adjusting the property price.
- What happens when the dashboard session UUID is lost (cleared localStorage)? Data is unrecoverable per design — no auth means no cross-device sync.
- What happens when rate limit (20/day) is exceeded? Show a friendly message suggesting the user return tomorrow.

## Requirements

### Functional Requirements

- **FR-001**: System MUST accept a listing URL, fetch content server-side, and return a transparency analysis within 10 seconds.
- **FR-002**: System MUST use an LLM with a structured system prompt as the primary analysis engine, with `@avena/score` as a fallback.
- **FR-003**: System MUST cross-reference estimated listing location with Cadastro API data when available.
- **FR-004**: System MUST calculate hidden purchase costs (ITP/IVA, notaría, registro, gestoría, tasación) based on property price and region.
- **FR-005**: System MUST present mortgage amortization scenarios (baseline, light, moderate, aggressive) for a 30-year term with voluntary early payments.
- **FR-006**: System MUST display an investing alternative alongside amortization scenarios with estimated long-term returns.
- **FR-007**: System MUST persist all user data per anonymous session UUID without requiring authentication.
- **FR-008**: System MUST support re-analysis of previously analyzed listings with snapshot diff detection.
- **FR-009**: System MUST be installable as a PWA on mobile devices.
- **FR-010**: System MUST enforce a rate limit of 20 analyses per day per user session.
- **FR-011**: System MUST NOT store any third-party content (listing HTML, scraped text). Only analysis results persisted.
- **FR-012**: System MUST use the User-Agent header `HomePath/1.0 (analizador educativo)` on all outbound requests.

### Key Entities

- **User**: Anonymous session identified by UUID. No email, password, or personal data. `userId` field nullable for future auth.
- **PurchaseProcess**: Tracks the user's home buying journey. Contains financial profile as JSON value object.
- **AnalyzedListing**: Result of a Listing Lens analysis. Contains score, red flags, location confidence, cadastral comparison, snapshot hash, and timestamp.
- **Checklist**: Document checklist organized by bureaucratic stage. Contains items with completion status.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A listing URL analysis completes and displays results in under 10 seconds.
- **SC-002**: The Mortgage Compass generates personalized strategy comparisons based on real financial inputs.
- **SC-003**: The complete E2E flow (paste URL → analysis → financial profile → mortgage strategy → dashboard) can be completed in under 5 minutes by a first-time user.
- **SC-004**: All 5 user stories have independent test coverage (unit + integration + at least 1 E2E test for the full flow).
- **SC-005**: The PWA installs and runs on iOS Safari and Android Chrome.
- **SC-006**: CI/CD pipeline passes (lint → typecheck → unit tests → integration tests → build → E2E) on every push to main.

## Assumptions

- Users have stable internet connectivity for listing analysis (server-side fetch required).
- Spanish listing sites (Idealista, Fotocasa, etc.) do not aggressively block our User-Agent.
- The Cadastro API (Sede Electrónica del Catastro) is publicly accessible and returns structured data.
- The LLM provider (OpenAI, Anthropic, or similar) is available and returns structured JSON for the system prompt.
- Users understand basic Spanish financial concepts (ITP, IVA, Euribor) or the UI provides inline explanations.
- `@avena/score` package is available and compatible with the chosen Node.js version.
- Euribor average rate is used as default mortgage rate and can be overridden by the user.
- Mobile-first design targets screen widths of 375px and above.
- Anonymous session data is stored in localStorage/IndexedDB on the client and PostgreSQL on the server.
- No cross-device sync is expected in MVP (no auth).