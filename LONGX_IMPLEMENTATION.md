# LongX — Implementation Documentation (User Stories, Backlog, Tickets, Estimates)

**Companion to** `LONGX.md` (the PRD: thesis, features, use cases, data model, architecture, C4, screen map).
**Author role:** Product Manager / Business Analyst
**Scope:** MVP (P1) — disciplined trading gateway on Binance USDT-M, per the Option B architecture.

---

## 0. How to read this document

This document turns the LongX PRD into ready-to-implement artifacts:

1. **User Stories (§2)** — 12 INVEST-compliant stories, each with a descriptive title, role/action/benefit narrative, three BDD acceptance criteria, a complexity estimate, notes, traceability to PRD use cases, and an INVEST self-evaluation.
2. **Product Backlog (§3)** — all stories prioritized with **WSJF** (Weighted Shortest Job First), the SAFe method appropriate to a discipline-critical MVP where some "failure path" stories (rejection, lockout) carry disproportionate value.
3. **Work Tickets (§4)** — each story decomposed into technical tasks as they would emerge in sprint planning (frontend, backend, data, infra, QA), with dependencies.
4. **Effort Estimation (§5)** — story points on the **Fibonacci scale** (1, 2, 3, 5, 8, 13) via Planning-Poker-style reasoning, rolled up per story and per ticket.
5. **Adaptation Phase (§7)** — the brownfield reality: the same artifacts (stories, WSJF backlog, tickets, estimates) for *migrating the existing LongX codebase* rather than building greenfield. This is the section to read if you are starting from the current repo.
6. **Testing & TDD Policy (§8)** — the quality discipline that governs **every ticket in §4 and §7.5**: human-owned tests as the deterministic contract for AI-assisted implementation, Red→Green→Refactor, the testing trophy, mocking boundaries, and the Definition of Done. No ticket is "done" outside this policy.
7. **Backend Development & Refactoring Policy (§9)** — the architecture and refactoring rules (R1–R19: refactor safety, DDD, Hexagonal, SOLID/DRY, design patterns) that govern **how every ticket's code is written and every AI-generated diff is reviewed**. Complementary to §8: §8 defines the contract (tests), §9 defines the structure (code).
8. **Integration, E2E, BDD & AI-QA Policy (§10)** — the rules (R1–R34, namespaced to §10) governing **the levels §8 budgets but doesn't specify in depth**: integration environments and data, E2E selector/independence/CI discipline, Gherkin quality, and the responsible use of AI in QA (tool selection, self-healing, PII, prompt versioning).

**Brownfield note:** §2–§6 describe *what the MVP needs to exist*. §7 describes *how to get there from the app that already exists* — a React/Supabase PWA with a live Postgres schema and Deno edge functions (`evaluate-trade`, `monitor-calls`, etc.). The decision is to **adapt, not rebuild**: the existing frontend and product surface are an asset whose strengths are exactly the backend plan's gaps. §7's adaptation stories (AD-xx) are what you actually pull into sprint one.

**Traceability:** every story maps to one or more use cases (UC-01…UC-12) and entities from the PRD data model, so the backlog is auditable back to the PRD.

---

## 1. Estimation & prioritization legend

**Complexity (story level):** S = small (≤ ~2 days, fits comfortably in a sprint with room to spare), M = medium (~half a sprint), L = large (most of a sprint; candidate for a split if it grows).

**Story points (ticket level):** Fibonacci 1 / 2 / 3 / 5 / 8 / 13. 1 = trivial change; 3 = a typical well-understood task; 8 = significant, some unknowns; 13 = large or risky, should probably be split. Points estimate *effort + uncertainty + risk*, not raw hours.

**WSJF** = Cost of Delay ÷ Job Size, where Cost of Delay = (User/Business Value + Time Criticality + Risk-Reduction/Opportunity-Enablement), each scored 1–10. Higher WSJF = do first.

---

## 2. User Stories

### US-01 — Enforced trade validation at the chokepoint

**User Story:**
As a **disciplined trader (Martín)**,
I want **every trade I submit to be validated against my risk rules before it can execute**,
so that **I cannot place a trade that breaks my own plan, even in a moment of impulse.**

**Acceptance Criteria (BDD):**
- **Given** I have submitted a trade intent with a valid stop on the correct side and an R:R above my tier floor, **when** the discipline engine validates it, **then** it returns `passed = true` with a computed position size and I can proceed to confirm.
- **Given** my submitted intent violates any rule (e.g. R:R below the tier minimum), **when** validation runs, **then** it returns `passed = false` with the specific failing rule(s) and no order is created.
- **Given** my intent passed at submission, **when** I confirm seconds later but the session has since locked, **then** the authoritative confirm-time validation blocks execution and explains why.

**Complexity:** L
**Notes:** Validation runs twice (submit + confirm; confirm authoritative). Position size is an *output*, never an input. Engine must be pure/deterministic with no I/O (CI-enforced).
**Traceability:** UC-01; entities `TRADE_INTENTS`, `VALIDATION_RESULTS`, `RISK_PROFILES`, `RISK_TIERS`, `SESSION_STATES`.
**INVEST:** ✅ *Independent* — the engine is a self-contained library testable without execution. ✅ *Negotiable* — the exact rule set and thresholds are configurable. ✅ *Valuable* — it is the core product guarantee. ✅ *Estimable* — clear inputs/outputs. ⚠️ *Small* — large but bounded; could split into "submit-stage" and "confirm-stage" if needed. ✅ *Testable* — rule outcomes are deterministic and table-testable.

---

### US-02 — Clear, behavior-recording trade rejection

**User Story:**
As a **trader who just had a trade blocked**,
I want **to see exactly which rule stopped me and have that attempt recorded**,
so that **I understand the boundary I hit and build awareness of my own patterns.**

**Acceptance Criteria (BDD):**
- **Given** my trade intent fails validation, **when** the rejection is shown, **then** it names the specific rule and the reason in plain language (e.g. "Blocked: 4th trade today, your cap is 3 — unlocks 09:00 tomorrow"), not a generic error.
- **Given** an intent has been rejected, **when** the system processes it, **then** a `BEHAVIORAL_EVENTS` row is persisted with the event type, failing rules, and session context.
- **Given** I have triggered three rejections within an hour, **when** the third is recorded, **then** a coach intervention is queued referencing the pattern.

**Complexity:** M
**Notes:** Rejection is a domain event with downstream consumers, not a 4xx-and-forget. The rejection screen is the most-read coaching surface.
**Traceability:** UC-02; entities `TRADE_INTENTS`, `VALIDATION_RESULTS`, `BEHAVIORAL_EVENTS`.
**INVEST:** ✅ *Independent* — consumes US-01's validation output but is independently deployable behind it. ✅ *Negotiable* — copy and intervention thresholds are negotiable. ✅ *Valuable* — turns failure into coaching. ✅ *Estimable* — well-scoped. ✅ *Small* — fits a sprint. ✅ *Testable* — event persistence and message content are assertable.

---

### US-03 — Real execution with a protective stop resting on the venue

**User Story:**
As a **trader executing a validated trade**,
I want **my order placed on my own Binance account with the stop loss resting on the exchange**,
so that **my position is protected even if LongX goes offline.**

**Acceptance Criteria (BDD):**
- **Given** an approved intent, **when** the worker places the entry order, **then** it uses an idempotent client order ID derived from the intent so a retry can never double-fill.
- **Given** my entry order fills, **when** the fill is observed on the user-data stream, **then** the worker immediately places a reduce-only stop-market order on Binance at my stop price.
- **Given** LongX backend is unavailable, **when** price reaches my stop, **then** the stop executes on Binance independently of LongX.

**Complexity:** L
**Notes:** Worker is the only process that decrypts keys (KMS, in-memory). Binance is authoritative for positions/fills; reconciliation loop closes drift. Keys are trade-only (withdraw OFF), IP-whitelisted.
**Traceability:** UC-03; entities `POSITIONS`, `EXCHANGE_ORDERS`, `ORDER_FILLS`, `EXCHANGE_CONNECTIONS`.
**INVEST:** ✅ *Independent* — execution is isolated in the worker behind a command interface. ✅ *Negotiable* — order types and slippage policy are negotiable. ✅ *Valuable* — turns the product from simulator to real gateway. ✅ *Estimable* — clear, though with integration unknowns. ⚠️ *Small* — large; entry placement and stop placement could split. ✅ *Testable* — verifiable against the Binance testnet.

---

### US-04 — Immovable, tighten-only stop loss

**User Story:**
As a **recovery trader (Lucas)**,
I want **to be unable to widen or remove my stop loss once a position is live**,
so that **I cannot sabotage myself by giving a losing trade "room to breathe."**

**Acceptance Criteria (BDD):**
- **Given** I have an open position, **when** I request a stop change that reduces risk (tighten or move to break-even), **then** it is applied and recorded in `STOP_ADJUSTMENTS` with source `longx`.
- **Given** I have an open position, **when** I request a stop change that increases risk (widen or remove), **then** the request is blocked, explained, and recorded as a `stop_widen_attempt` behavioral event.
- **Given** my session is locked, **when** I request a stop tightening, **then** it is still allowed — risk reduction is never blocked.

**Complexity:** M
**Notes:** The widen *attempt* is among the highest-value behavioral signals and feeds the trade's DQS. This is the UC-04 surface on the Trade Detail screen.
**Traceability:** UC-04; entities `POSITIONS`, `STOP_ADJUSTMENTS`, `BEHAVIORAL_EVENTS`.
**INVEST:** ✅ *Independent* — operates on an existing position. ✅ *Negotiable* — break-even handling is negotiable. ✅ *Valuable* — directly addresses the #1 account-destroying habit. ✅ *Estimable* — small rule + audit. ✅ *Small* — fits a sprint. ✅ *Testable* — tighten-applies / widen-blocks is binary and assertable.

---

### US-05 — Circuit breakers and post-loss lockout

**User Story:**
As a **trader prone to revenge-trading**,
I want **the platform to lock my session when I hit a daily loss, trade count, or consecutive-loss limit**,
so that **I am physically stopped from spiraling after a bad run.**

**Acceptance Criteria (BDD):**
- **Given** a closing trade pushes my daily loss past my tier's max, **when** the position closes, **then** my session is locked with a reason and an expiry, and new intents are auto-rejected until it lifts.
- **Given** my session is locked, **when** I log out and back in (or hit the API directly), **then** the lock still holds — it is authoritative in the database, not just the client.
- **Given** I have just taken a loss, **when** the post-loss cooldown is active, **then** I cannot submit a new intent until the cooldown timer expires.

**Complexity:** M
**Notes:** DB-authoritative with Redis as hot cache; sync rebuild on cache miss so enforcement never passes on absent state. The Home blocked-countdown already exists in the codebase and maps here.
**Traceability:** UC-05; entities `SESSION_STATES`, `BEHAVIORAL_EVENTS`, `COACH_MESSAGES`.
**INVEST:** ✅ *Independent* — session-state module stands alone. ✅ *Negotiable* — thresholds per tier are configurable. ✅ *Valuable* — the structural cure for overtrading. ✅ *Estimable* — well-understood counters. ✅ *Small* — fits a sprint. ✅ *Testable* — threshold breaches and persistence are assertable.

---

### US-06 — Decision-Quality Score on every closed trade

**User Story:**
As a **trader trying to improve**,
I want **every closed trade graded on the quality of my decision rather than whether it won**,
so that **I learn to value good process over lucky outcomes.**

**Acceptance Criteria (BDD):**
- **Given** a position closes, **when** the scoring service runs, **then** a `TRADE_GRADES` row is created with a 0–100 DQS and a transparent per-dimension component breakdown.
- **Given** a trade lost money but followed every rule, **when** it is graded, **then** its DQS is high; **and given** a trade won but broke rules, **then** its DQS is low.
- **Given** I view the trade-close screen, **when** it renders, **then** the DQS is the hero figure and PnL is visually secondary.

**Complexity:** L
**Notes:** Deterministic and versioned (`grading_version`) for historical comparability; the LLM is not in this path. Aggregates into the consistency score.
**Traceability:** UC-06; entities `TRADE_GRADES`, reads across the core.
**INVEST:** ✅ *Independent* — triggered by `position.closed`, otherwise self-contained. ✅ *Negotiable* — the formula and weights are explicitly negotiable/versioned. ✅ *Valuable* — the product's psychological core. ✅ *Estimable* — clear inputs (the audit bundle). ⚠️ *Small* — large; per-dimension scorers could split. ✅ *Testable* — fixed audit fixtures yield fixed grades.

---
### US-07 — Coach repairs a flawed trade in my own style

**User Story:**
As a **trader whose setup was rejected or scored low**,
I want **the coach to propose a fixed version of my own trade — same asset, direction, and style**,
so that **I can still take my idea, but in a form that respects my risk rules.**

**Acceptance Criteria (BDD):**
- **Given** my intent fails validation or passes with low predicted quality, **when** the coach generates a repair, **then** the repaired trade keeps my asset, direction, and style and changes only the risk geometry (entry zone, stop, target, size).
- **Given** a repair is generated, **when** it is shown to me, **then** it has already passed validation itself, and accepting it creates a new child intent (`origin = coach_repair`, `parent_intent_id` set) that flows through the chokepoint.
- **Given** I decline the repair and force my original through (where allowed), **when** I do so, **then** the decline is recorded as a behavioral event affecting that trade's DQS.

**Complexity:** L
**Notes:** Repair is computed deterministically by the analysis library (ATR/RSI/EMA/S-R/Fibonacci, ±10% entry bound); the LLM only narrates. "Repair, don't originate" — never flips side or asset.
**Traceability:** UC-12 (extends UC-01/UC-02); entities `TRADE_INTENTS` (origin, parent_intent_id), `VALIDATION_RESULTS`, `BEHAVIORAL_EVENTS`.
**INVEST:** ✅ *Independent* — builds on US-01 but is a distinct flow. ✅ *Negotiable* — optimizer bounds are negotiable. ✅ *Valuable* — keeps the user's intent alive while enforcing discipline. ✅ *Estimable* — the existing `evaluate-trade` optimizer is the seed. ⚠️ *Small* — large; analysis port and repair UI could split. ✅ *Testable* — repaired output must pass the same rules, assertable.

---

### US-08 — Behavioral coaching feedback after trades

**User Story:**
As a **trader who wants to change my habits**,
I want **the coach to explain my grades and flag recurring mistakes in plain language**,
so that **I internalize the rules instead of just having them imposed on me.**

**Acceptance Criteria (BDD):**
- **Given** a trade has been graded, **when** the coach runs, **then** it produces a message grounded only in the computed grade components (e.g. "DQS 58 — you entered 4 minutes after a loss, second time this week").
- **Given** the LLM provider is unavailable, **when** coaching is requested, **then** a template-rendered message from the grade components is shown instead, and the trading flow is never blocked.
- **Given** the coach references my behavior, **when** the message is generated, **then** it never contains a directional market opinion (no buy/sell calls).

**Complexity:** M
**Notes:** Async, off `grade.computed` and notable behavioral patterns; never in the order path. Bilingual ES/EN.
**Traceability:** UC-07; entities `COACH_MESSAGES`, reads `TRADE_GRADES`, `BEHAVIORAL_EVENTS`, `JOURNAL_ENTRIES`.
**INVEST:** ✅ *Independent* — consumes events, deployable alone. ✅ *Negotiable* — tone/templates negotiable. ✅ *Valuable* — builds metacognition, the differentiator. ✅ *Estimable* — bounded LLM orchestration. ✅ *Small* — fits a sprint. ✅ *Testable* — grounding and no-directional-content are assertable via prompt tests.

---

### US-09 — Default-restrictive onboarding with Binance connection

**User Story:**
As a **new user**,
I want **to connect my Binance account and start at the safest risk tier**,
so that **I am protected during the period when I am most likely to blow up.**

**Acceptance Criteria (BDD):**
- **Given** I am onboarding, **when** I connect Binance, **then** the system verifies my API key has withdrawal permission OFF and sets isolated margin + one-way mode, refusing to proceed otherwise.
- **Given** my account is created, **when** my initial risk profile is set, **then** it defaults to the most restrictive tier regardless of my self-described experience.
- **Given** I have connected, **when** I complete onboarding, **then** I am guided through one full intent → validation → confirm cycle before free use.

**Complexity:** L
**Notes:** Replaces nickname-login with real auth (precondition for keys) and removes the simulated-capital picker. Key permission re-verification recurs post-onboarding.
**Traceability:** UC-09; entities `USERS`, `EXCHANGE_CONNECTIONS`, `RISK_PROFILES`.
**INVEST:** ✅ *Independent* — onboarding flow is self-contained. ✅ *Negotiable* — guided-trade format negotiable. ✅ *Valuable* — protects the most fragile users + enables real execution. ✅ *Estimable* — clear steps. ⚠️ *Small* — large; auth, key-connect, and guided-trade could split. ✅ *Testable* — permission checks and default tier are assertable.

---

### US-10 — Ulysses-contract guardrail changes

**User Story:**
As a **trader who knows I'll be tempted to loosen my rules on tilt**,
I want **tightening my limits to apply instantly but loosening to be delayed 24–72 hours**,
so that **I cannot disarm my own protections in the heat of the moment.**

**Acceptance Criteria (BDD):**
- **Given** I request a change that tightens any limit, **when** I submit it, **then** it applies immediately (`applies_at = now()`).
- **Given** I request a change that loosens any limit, **when** I submit it, **then** it is scheduled for my tier's delay and shown as pending with its effective time, and is cancellable (cancelling counts as a tighten — instant).
- **Given** my session is locked, **when** I request a loosening, **then** it is auto-rejected and recorded as a behavioral event.

**Complexity:** M
**Notes:** The engine resolves the effective profile as-of now(), so no special-casing scattered around. Within-band slider moves are instant; band/tier changes carry the delay.
**Traceability:** UC-08; entities `GUARDRAIL_CHANGES`, `RISK_PROFILES`.
**INVEST:** ✅ *Independent* — a self-contained workflow. ✅ *Negotiable* — delay durations per tier negotiable. ✅ *Valuable* — the commitment-device mechanic. ✅ *Estimable* — clear state machine. ✅ *Small* — fits a sprint. ✅ *Testable* — timing asymmetry is deterministic and assertable.

---

### US-11 — Disciplined copy-trading from the feed

**User Story:**
As a **trader who follows signal providers**,
I want **to copy a trader's call but have it sized and gated by my own risk rules**,
so that **I can follow signals without inheriting someone else's reckless risk.**

**Acceptance Criteria (BDD):**
- **Given** I tap Execute on a trader's call, **when** the intent is constructed, **then** it has `origin = trader_call` and `source_call_id` set, pre-filled from the call's entry zone/stop/target.
- **Given** the constructed intent, **when** it is validated, **then** it is checked against *my* risk profile and the position size is computed for *my* account, not the trader's.
- **Given** the call would violate my rules (e.g. it exceeds my leverage band), **when** I try to execute, **then** it is blocked or repaired exactly as a self-authored trade would be.

**Complexity:** M
**Notes:** Reuses the existing feed UX and `ExecuteCallModal`; the change is routing execution through the chokepoint instead of a direct insert.
**Traceability:** UC-01 via feed; entities `TRADER_CALLS`, `TRADE_INTENTS`, `USER_FOLLOWS`.
**INVEST:** ✅ *Independent* — builds on US-01 but distinct surface. ✅ *Negotiable* — pre-fill behavior negotiable. ✅ *Valuable* — channels signal-following safely. ✅ *Estimable* — mostly wiring to existing engine. ✅ *Small* — fits a sprint. ✅ *Testable* — copier-sizing and gating are assertable.

---

### US-12 — "If you'd followed your rules" counterfactual report

**User Story:**
As a **trader doubting whether discipline is worth it**,
I want **to see my actual results next to what they'd be if I'd followed every rule**,
so that **the cost of my indiscipline becomes concrete and personal.**

**Acceptance Criteria (BDD):**
- **Given** I have enough closed trades, **when** I open the review dashboard, **then** I see my actual equity curve alongside a rules-adhered counterfactual curve.
- **Given** the counterfactual is computed, **when** it is built, **then** it uses the persisted audit trail (rejected-then-not-taken trades excluded, stop-widen attempts replayed as if the original stop held).
- **Given** I have insufficient history, **when** I open the dashboard, **then** I see a progress-to-meaningful-stats state instead of empty or misleading charts.

**Complexity:** L
**Notes:** Computable *only* because the system persists what the trader tried to do, not just outcomes. The single most persuasive retention artifact.
**Traceability:** UC-10; entities `TRADE_GRADES`, `BEHAVIORAL_EVENTS`, `STOP_ADJUSTMENTS`, full audit read.
**INVEST:** ✅ *Independent* — read-only analytics over existing data. ✅ *Negotiable* — counterfactual rules negotiable. ✅ *Valuable* — top retention lever. ✅ *Estimable* — clear data sources. ⚠️ *Small* — large; the replay engine and the visualization could split. ✅ *Testable* — fixtures yield deterministic curves.

---
## 3. Product Backlog (WSJF-prioritized)

**Method: WSJF (Weighted Shortest Job First).** Chosen over a flat MoSCoW because this MVP has an unusual property — some of its highest-value stories are *failure-path* stories (rejection, lockout) that a naive value ranking would underweight. WSJF surfaces them correctly by scoring Cost of Delay against Job Size.

**WSJF = Cost of Delay ÷ Job Size**, where **CoD = Business/User Value + Time Criticality + Risk-Reduction/Enablement** (each 1–10), and Job Size is the story's points (from §5). Higher = sooner.

> Prompt-engineering note (as requested — the reasoning that generated this backlog): the ranking prompt was framed as *"You are a BA applying WSJF. For each story, score Business Value, Time Criticality, and Risk-Reduction/Enablement from 1–10 from the perspective of the LongX discipline-first thesis, where a feature that prevents account destruction or unblocks other work scores higher on risk-reduction/enablement than a feature that merely adds surface. Then divide the summed Cost of Delay by the story's Fibonacci size and sort descending."* This is what pushes the chokepoint and execution to the top (they *enable* everything else) and pulls pure-analytics stories down despite high intrinsic value.

| Rank | ID | Story | Value | Time Crit. | Risk/Enable | CoD | Size (pts) | **WSJF** |
|---|---|---|---|---|---|---|---|---|
| 1 | US-01 | Chokepoint validation | 10 | 9 | 10 | 29 | 13 | **2.23** |
| 2 | US-05 | Circuit breakers / lockout | 9 | 8 | 8 | 25 | 8 | **3.13** |
| 3 | US-04 | Tighten-only stop | 9 | 7 | 7 | 23 | 5 | **4.60** |
| 4 | US-02 | Behavior-recording rejection | 8 | 7 | 8 | 23 | 5 | **4.60** |
| 5 | US-09 | Onboarding + Binance connect | 9 | 9 | 9 | 27 | 13 | **2.08** |
| 6 | US-03 | Real execution + resting stop | 10 | 9 | 9 | 28 | 13 | **2.15** |
| 7 | US-06 | Decision-Quality Score | 9 | 6 | 7 | 22 | 13 | **1.69** |
| 8 | US-10 | Ulysses guardrail changes | 7 | 5 | 6 | 18 | 5 | **3.60** |
| 9 | US-08 | Behavioral coaching feedback | 8 | 5 | 5 | 18 | 8 | **2.25** |
| 10 | US-11 | Disciplined copy-trading | 6 | 5 | 4 | 15 | 5 | **3.00** |
| 11 | US-07 | Coach trade repair | 7 | 4 | 5 | 16 | 13 | **1.23** |
| 12 | US-12 | Counterfactual report | 7 | 3 | 4 | 14 | 8 | **1.75** |

### 3.1 Pure WSJF order vs. sequenced order

Pure WSJF (by the rightmost column) would run small-and-cheap stories first: US-04, US-02, US-10, US-05… But WSJF must be **constrained by hard dependencies** — you cannot grade trades (US-06) or record stop-widen attempts (US-04) before trades execute (US-03), and nothing executes before the chokepoint (US-01) and a connected account (US-09) exist. The delivery sequence below honors both WSJF and the dependency graph, organized into the migration milestones from the PRD (§9 of `LONGX.md`):

| Sprint band | Stories | Rationale |
|---|---|---|
| **Foundation (M0–M1)** | US-09 (auth + connect), US-01 (chokepoint) | Nothing real happens without identity, a connected account, and the validation spine. Highest enablement. |
| **Enforcement (M2–M3)** | US-03 (execution), US-05 (lockout), US-04 (tighten-only), US-02 (rejection) | The discipline guarantees, in dependency order. These four *are* the product's promise. |
| **Behavioral core (M3–M4)** | US-06 (DQS), US-08 (coaching), US-10 (Ulysses) | The differentiation layer, once trades exist to grade and coach. |
| **Differentiators (M5)** | US-11 (copy), US-07 (repair), US-12 (counterfactual) | High-value but dependency-heavy; land last when the substrate is solid. |

---

## 4. Work Tickets

Each story is decomposed into the technical tasks that would be written on the board in sprint planning. Format: `[Layer] Task — points`. Layers: **FE** frontend (React PWA), **BE** backend (FastAPI monolith), **WK** worker, **DATA** schema/migration, **INFRA** infra/security, **QA** test.

> **Every ticket below is implemented under the Testing & TDD Policy (§8), the Backend & Refactoring Policy (§9), and the Integration/E2E/AI-QA Policy (§10).** The QA tickets listed per story are the *dedicated* test infrastructure; they do not replace the test-first discipline that applies to every FE/BE/WK/DATA ticket individually. A ticket's Definition of Done is §8.9, which includes the §9 and §10 blocking checklists.

### US-01 — Chokepoint validation (13 pts)
- **DATA-01.1** Migration: `TRADE_INTENTS` (+ origin, parent_intent_id, entry_min/max, style), `VALIDATION_RESULTS` (+ stage) — **3**
- **BE-01.2** Discipline-engine rule library: session-lock, trade-cap, stop-side, ATR-distance, R:R floor, leverage-band, no-adds — pure functions — **8**
- **BE-01.3** Position-size computation from risk% + stop distance — **3**
- **BE-01.4** `POST /intents` and `POST /intents/{id}/confirm` (double validation, confirm authoritative) — **5**
- **BE-01.5** import-linter CI rule: engine imports nothing with I/O — **2**
- **FE-01.6** Trade-ticket form wired to validate→confirm; display computed size + rule summary — **5**
- **QA-01.7** Property + table tests for the rule matrix; confirm-time state-change test — **5**

### US-02 — Behavior-recording rejection (5 pts)
- **DATA-02.1** `BEHAVIORAL_EVENTS` table (event_type, context jsonb, nullable position_id) — **2**
- **BE-02.2** Persist rejection event with failing rules + session context — **2**
- **BE-02.3** Rejection-pattern detector (3 rejections/hour → queue coach trigger) — **3**
- **FE-02.4** Rejection screen: specific rule + plain-language reason (bilingual) — **3**
- **QA-02.5** Assert event persistence and message specificity — **2**

### US-03 — Real execution + resting stop (13 pts)
- **DATA-03.1** `POSITIONS`, `EXCHANGE_ORDERS` (+ client_order_id UK), `ORDER_FILLS` — **3**
- **WK-03.2** CCXT Binance backend: place entry with idempotent clientOrderId — **5**
- **WK-03.3** User-data stream listener: fills → persist, open position — **5**
- **WK-03.4** On entry fill, place reduce-only stop-market on venue — **3**
- **WK-03.5** Reconciliation loop (Binance authoritative; drift correction) — **8**
- **INFRA-03.6** NAT gateway / stable egress IPs for key whitelisting — **3**
- **QA-03.7** Binance testnet integration tests; double-fill idempotency test — **5**

### US-04 — Tighten-only stop (5 pts)
- **DATA-04.1** `STOP_ADJUSTMENTS` (+ source) — **1**
- **BE-04.2** Direction comparison: tighten applies, widen/remove blocks; allowed during lock — **3**
- **WK-04.3** Apply tightened stop on venue (cancel/replace) — **3**
- **FE-04.4** Trade-Detail stop control: tighten input, widen-blocked explanation, audit list — **3**
- **QA-04.5** Tighten-applies / widen-blocks / locked-still-tightens tests — **2**

### US-05 — Circuit breakers / lockout (8 pts)
- **DATA-05.1** `SESSION_STATES` (counters, locked_until, lock_reason) — **2**
- **BE-05.2** Threshold evaluation on `position.closed`; set lock atomically (Redis + DB) — **5**
- **BE-05.3** Post-loss cooldown timer; auto-reject intents during lock — **3**
- **BE-05.4** Sync rebuild of session state from DB on Redis miss — **3**
- **FE-05.5** Home blocked-state + countdown (adapt existing component) — **2**
- **QA-05.6** Lock survives logout/API; threshold-breach tests — **3**

### US-06 — Decision-Quality Score (13 pts)
- **DATA-06.1** `TRADE_GRADES` (dqs, components jsonb, grading_version) — **2**
- **BE-06.2** Audit-bundle assembler (intent, validations, fills, stop history, session ctx, journal) — **5**
- **BE-06.3** Per-dimension scorers: adherence, sizing, R:R-at-entry, stop behavior, session ctx — **8**
- **BE-06.4** Consistency-score rolling aggregate (materialized/cached) — **3**
- **FE-06.5** Trade-close screen: DQS hero, PnL secondary, component breakdown — **5**
- **QA-06.6** Fixture-driven deterministic grade tests (incl. won-but-bad / lost-but-good) — **5**

### US-07 — Coach trade repair (13 pts)
- **BE-07.1** Port `evaluate-trade` indicators (ATR/RSI/EMA/S-R/Fibonacci) to Python analysis lib — **8**
- **BE-07.2** Repair algorithm: same asset/side/style, bend geometry within ±10% until rules pass — **5**
- **BE-07.3** Child-intent creation (origin=coach_repair, parent_intent_id); re-validate before display — **3**
- **BE-07.4** Decline-repair → behavioral event affecting DQS — **2**
- **FE-07.5** Adapt `/trade` feedback state: original vs repaired, accept→chokepoint — **5**
- **QA-07.6** Repaired output must pass rules; never flips side/asset — **3**

### US-08 — Behavioral coaching feedback (8 pts)
- **DATA-08.1** `COACH_MESSAGES` (trigger_type, source_event_id) — **1**
- **BE-08.2** Coach orchestrator: consume grade.computed + behavioral patterns — **3**
- **BE-08.3** LLM prompt grounded in computed facts; no-directional-content guard — **5**
- **BE-08.4** Template fallback when LLM unavailable; bilingual ES/EN — **3**
- **FE-08.5** Coach panel/surface (persistent) — **5**
- **QA-08.6** Grounding + no-buy/sell assertions; fallback path test — **3**

### US-09 — Onboarding + Binance connect (13 pts)
- **INFRA-09.1** Supabase Auth + real RLS policies (replace nickname login) — **5**
- **DATA-09.2** `EXCHANGE_CONNECTIONS` (encrypted_key_ref, permissions_snapshot, margin/position mode) — **2**
- **WK-09.3** Key vault: KMS envelope encryption; in-memory-only decryption — **5**
- **WK-09.4** Verify withdraw-OFF; set isolated margin + one-way; refuse otherwise — **3**
- **BE-09.5** Default-restrictive tier assignment on signup — **2**
- **FE-09.6** Onboarding flow: auth → connect-Binance → guided first trade (drop capital picker) — **8**
- **QA-09.7** Permission-verification + default-tier + guided-trade tests — **3**

### US-10 — Ulysses guardrail changes (5 pts)
- **DATA-10.1** `GUARDRAIL_CHANGES` (direction, applies_at, status) — **1**
- **BE-10.2** Direction classifier; tighten=now / loosen=delayed; cancel=tighten — **3**
- **BE-10.3** Effective-profile resolver as-of now(); auto-reject loosening during lock — **3**
- **FE-10.4** Tier/guardrail screen: in-band slider (instant), loosen request with delay shown — **5**
- **QA-10.5** Timing-asymmetry + locked-rejection tests — **2**

### US-11 — Disciplined copy-trading (5 pts)
- **BE-11.1** Construct intent from call (origin=trader_call, source_call_id, pre-fill) — **3**
- **BE-11.2** Validate against copier profile; compute copier size — **2**
- **FE-11.3** Adapt `ExecuteCallModal` to route through chokepoint (block/repair as needed) — **3**
- **QA-11.4** Copier-sizing + gating + block/repair tests — **2**

### US-12 — Counterfactual report (8 pts)
- **BE-12.1** Counterfactual replay engine (exclude rejected-not-taken; replay original stops) — **8**
- **BE-12.2** Equity-curve series builder (actual vs adhered) — **3**
- **FE-12.3** Review dashboard: dual curves + insufficient-history state — **5**
- **QA-12.4** Deterministic fixtures → known curves; sparse-history state — **3**

---

## 5. Effort Estimation

**Method:** Fibonacci story points (1/2/3/5/8/13) assigned in Planning-Poker style — each ticket estimated for effort + uncertainty + risk, not raw hours. Story-level points (used in the WSJF table) are the rounded Fibonacci roll-up of their tickets, not a literal sum, reflecting that a story is somewhat less than the arithmetic total once context is shared.

| Story | Ticket points (sum) | Story points (Fibonacci) | Complexity |
|---|---|---|---|
| US-01 | 31 | 13 | L |
| US-02 | 12 | 5 | M |
| US-03 | 32 | 13 | L |
| US-04 | 12 | 5 | M |
| US-05 | 18 | 8 | M |
| US-06 | 28 | 13 | L |
| US-07 | 26 | 13 | L |
| US-08 | 20 | 8 | M |
| US-09 | 28 | 13 | L |
| US-10 | 14 | 5 | M |
| US-11 | 10 | 5 | M |
| US-12 | 19 | 8 | L |
| **Total** | **250** | **109** | — |

**Velocity & timeline (planning assumption):** for a small team at an assumed velocity of ~20 story points per 2-week sprint, 109 points is roughly **5–6 sprints (~3 months)** to MVP — consistent with the migration plan's M0→M5. The three 13-point stories (US-01, US-03, US-09) are the schedule risks; each carries a marked split-point in its INVEST evaluation and should be split if it doesn't fit a single sprint with room for review.

**Estimation caveats (stated honestly):** the worker/Binance integration (US-03) and the analysis-library port (US-07) carry the most uncertainty — real-exchange edge cases (partial fills, rate limits, reconciliation drift) and indicator-parity verification respectively tend to expand. Treat their 13s as "13 or split," and re-estimate after a spike.

---

## 6. Traceability summary

| Story | Use case(s) | Primary entities | Milestone |
|---|---|---|---|
| US-01 | UC-01 | TRADE_INTENTS, VALIDATION_RESULTS, RISK_PROFILES | M1 |
| US-02 | UC-02 | BEHAVIORAL_EVENTS, VALIDATION_RESULTS | M3 |
| US-03 | UC-03 | POSITIONS, EXCHANGE_ORDERS, ORDER_FILLS | M2–M4 |
| US-04 | UC-04 | STOP_ADJUSTMENTS, BEHAVIORAL_EVENTS | M3 |
| US-05 | UC-05 | SESSION_STATES, COACH_MESSAGES | M3 |
| US-06 | UC-06 | TRADE_GRADES | M3 |
| US-07 | UC-12 | TRADE_INTENTS (repair lineage) | M5 |
| US-08 | UC-07 | COACH_MESSAGES | M4 |
| US-09 | UC-09 | USERS, EXCHANGE_CONNECTIONS, RISK_PROFILES | M0–M4 |
| US-10 | UC-08 | GUARDRAIL_CHANGES, RISK_PROFILES | M4 |
| US-11 | UC-01 (feed) | TRADER_CALLS, TRADE_INTENTS | M5 |
| US-12 | UC-10 | TRADE_GRADES, BEHAVIORAL_EVENTS | M5 |

All twelve stories trace to a PRD use case and to entities in the `LONGX.md` data model, and group under the migration milestones (M0–M5) defined in `LONGX.md` §9.

---

## 7. Adaptation Phase — Migrating the Existing Codebase

### 7.1 The decision and what it changes

The existing LongX is a working **React 18 + TypeScript + Supabase PWA** with a live Postgres schema (`traders`, `calls`, `users`, `user_calls`, `user_follows`, `crypto_assets`, `live_prices`) and five Deno edge functions (`evaluate-trade`, `monitor-calls`, `get-price-history`, `translate-explanation`, `validate-coingecko`). The decision is **adapt, not rebuild**, because the codebase and the remaining work are nearly disjoint: the repo is overwhelmingly *validated frontend and product surface* (PWA, shadcn UI, bilingual `useT()`, feed, trade-detail chart, admin shell, navigation, live-price Realtime), while the implementation plan is overwhelmingly *backend and enforcement* (discipline engine, connectivity worker, real execution, behavioral layer). A rewrite would discard the asset to avoid rebuilding the liability — which a rewrite would force anyway.

What the existing code is honest about being (from its own `CLAUDE.md`), and what each implies for the migration:

| Existing reality | Why it must change | Adaptation |
|---|---|---|
| Risk guardrails are **client-side only** (`AppContext.executeTrade()` / `refreshDailyStats()`); the DB does not enforce limits | A user holding real Binance keys can bypass client rules with one PostgREST call | Move enforcement to a server-side chokepoint; demote `AppContext` to an optimistic UI mirror |
| Identity is a **nickname lookup**, no auth, allow-all RLS | Disqualifying once real keys exist | Real Supabase Auth + per-user RLS (precondition for everything real-money) |
| Statuses **only advance while an admin tab is open** (`Admin.tsx` polls `monitor-calls` every 30s; no cron) | Not viable for a live trading product | Connectivity worker replaces the polling status engine |
| `evaluate-trade` produces an **advisory** score + suggested trade | Right instinct, wrong binding — execution isn't gated by it | Port its gates/indicators into the Python discipline + analysis libraries; execution flows through the chokepoint |
| Simulated capital; `user_calls` are paper trades | Option B executes on the user's real Binance account | Add real execution behind a gateway interface; keep the paper path as the practice tier |
| Stack is **TypeScript/Deno** | The plan's backend is **Python/FastAPI + worker** | Strangler: add the Python backend alongside, retire Deno functions as logic ports over |

**What is reused, not rebuilt** (the discount the adaptation buys): the entire React PWA shell, shadcn/Radix components, the `useT()` ES/EN system, the feed (`TraderFeed`, `TraderProfile`, `CallCard`, `ExecuteCallModal`), the trade-detail chart (`UserCallDetail`), the Home blocked-countdown, the admin shell, `useLivePrices` Realtime wiring, the `supabase/migrations/` discipline, and — highest value — the `evaluate-trade` indicator math (ATR/RSI/EMA/Fibonacci, the three gates, the ±10% optimizer) as the seed of the repair engine.

### 7.2 Migration principles (non-negotiable during the strangler)

1. **The app never stops working.** Every milestone ships; the frontend stays live; demo-grade pieces are strangled one at a time, never big-bang.
2. **No real keys before the server chokepoint.** The most dangerous shortcut — bolting Binance execution onto the client-side guardrails — is explicitly forbidden. Server enforcement lands before real execution.
3. **Keep the repo's own guardrails.** Continue routing all schema changes through `supabase/migrations/` (regenerating `types.ts`), and keep every new string bilingual via `useT()`. This existing discipline is what makes a strangler tractable.
4. **Brownfield-first schema.** The existing tables are evolved with additive migrations where possible; new entities are added alongside. Existing `calls` / `user_calls` / `users` are mapped onto the PRD model (`TRADER_CALLS` / split `TRADE_INTENTS`+`POSITIONS` / `RISK_PROFILES`) rather than dropped.

### 7.3 Adaptation User Stories (AD-xx)

These are framed from the perspective of *the team migrating the system* — the role is the engineer/operator, the benefit is a safe, incremental cutover. They are deliberately separate from the product stories (US-xx): an AD story delivers a migration capability; the US story it unblocks delivers the user-facing feature.

---

#### AD-01 — Replace nickname identity with real authentication

**User Story:**
As **the LongX team**,
I want **to replace the nickname-lookup login with Supabase Auth and per-user RLS**,
so that **the system is safe to hold real Binance keys and user data is properly isolated.**

**Acceptance Criteria (BDD):**
- **Given** the existing allow-all RLS policies, **when** the auth migration is applied, **then** every table enforces per-user row access and anonymous access is removed except where explicitly public (e.g. trader feed read).
- **Given** a returning user, **when** they sign in via Supabase Auth, **then** a real session persists across reloads (replacing the current "reload returns to Onboarding" behavior).
- **Given** the provider tree (`I18nProvider → AppProvider`), **when** auth is integrated, **then** `currentUser` derives from the auth session and the inline `isOnboarded` route guards continue to function.

**Complexity:** M
**Notes:** Touches the provider tree and route guards but no screen content. Prerequisite for all real-money work. Existing `users` rows must be reconciled with auth identities (migration script).
**Traceability:** unblocks US-09; existing `users` table → `USERS` + auth.
**INVEST:** ✅ *Independent* — auth is self-contained. ✅ *Negotiable* — provider integration approach is flexible. ✅ *Valuable* — the security precondition for the whole MVP. ✅ *Estimable* — well-trodden Supabase Auth path. ✅ *Small* — fits a sprint. ✅ *Testable* — session persistence and RLS isolation are assertable.

---

#### AD-02 — Stand up the Python backend alongside Supabase

**User Story:**
As **the LongX team**,
I want **to introduce the FastAPI monolith as a new deployable next to the existing Supabase stack**,
so that **backend logic has a home to migrate into without disrupting the running app.**

**Acceptance Criteria (BDD):**
- **Given** the existing Supabase Postgres, **when** the FastAPI service is deployed, **then** it connects to the same database and reads/writes through migrations-managed schema (no parallel schema).
- **Given** the new service, **when** CI runs, **then** the import-linter rule fails the build if the discipline-engine package imports anything performing I/O.
- **Given** the service is live, **when** the frontend calls a health/contract endpoint, **then** it responds, proving the FE→Python path before any logic depends on it.

**Complexity:** M
**Notes:** Pure infra/scaffolding story — no user-facing change. Establishes the package boundaries (`discipline/`, `analysis/`, `scoring/`, `coach/`, `accounts/`) the later stories fill.
**Traceability:** unblocks US-01, US-06, US-08; foundation for the modular monolith.
**INVEST:** ✅ *Independent* — scaffolding stands alone. ✅ *Negotiable* — hosting choice flexible. ✅ *Valuable* — enables all backend migration. ✅ *Estimable* — bounded setup. ✅ *Small* — fits a sprint. ✅ *Testable* — health endpoint + CI boundary rule are assertable.

---

#### AD-03 — Port `evaluate-trade` into the Python discipline & analysis libraries

**User Story:**
As **the LongX team**,
I want **to port the existing Deno `evaluate-trade` gates and indicators into pure Python libraries**,
so that **the validated trade-scoring logic becomes the chokepoint and repair engine without being rewritten from theory.**

**Acceptance Criteria (BDD):**
- **Given** the existing `evaluate-trade` indicators (ATR, RSI, EMA 50/200, MACD, Bollinger, S/R, Fibonacci), **when** they are ported to Python, **then** a parity test suite confirms the Python output matches the Deno output within tolerance on a fixed OHLC fixture set.
- **Given** the three existing gates (SL on correct side, SL ≥ 0.8×ATR, R:R ≥ 1.5), **when** ported, **then** they evaluate as pure functions with no I/O and identical pass/fail verdicts to the original.
- **Given** the `/trade` screen currently calls `functions.invoke('evaluate-trade')`, **when** the Python path is proven, **then** the frontend switches to the new API endpoint with no UX change, and the Deno function is retired.

**Complexity:** L
**Notes:** This is the highest-leverage reuse in the migration — it seeds both US-01 (chokepoint) and US-07 (repair). The indicator parity suite is the key risk-reducer. The `translate-explanation` ES/EN function pattern informs the coach's bilingual output.
**Traceability:** unblocks US-01, US-07; reuses existing `evaluate-trade`.
**INVEST:** ✅ *Independent* — library port testable in isolation. ✅ *Negotiable* — internal structure flexible. ✅ *Valuable* — converts advisory logic into enforcement. ✅ *Estimable* — the source logic exists and is the spec. ⚠️ *Small* — large; indicators and gates could split. ✅ *Testable* — parity suite is the acceptance gate.

---

#### AD-04 — Replace the polling status engine with the connectivity worker

**User Story:**
As **the LongX team**,
I want **the connectivity worker to take over status transitions from admin-tab polling**,
so that **trade statuses advance continuously instead of only while an admin tab is open.**

**Acceptance Criteria (BDD):**
- **Given** the current `monitor-calls` polling (every 30s from `Admin.tsx`), **when** the worker is deployed, **then** status transitions (Live→Filled→Win/Loss/Expired) run independently of any open browser tab.
- **Given** the worker drives transitions on the existing **paper** `user_calls`, **when** it runs, **then** it reproduces the current `monitor-calls` result math (`result%`) — proving correctness on simulated trades before touching real orders.
- **Given** the worker is authoritative, **when** `monitor-calls` is retired, **then** `live_prices` continues to update and `useLivePrices` Realtime on the frontend is unaffected.

**Complexity:** M
**Notes:** A deliberately low-risk first job for the worker — same paper-trade transitions, no real orders yet. Kills the "only advances while an admin tab is open" bug immediately. Market-data ingestion replaces the CoinGecko bulk-fetch for execution-relevant prices (CoinGecko can remain for the 24h detail chart via `get-price-history`).
**Traceability:** unblocks US-03, US-05; replaces `monitor-calls`.
**INVEST:** ✅ *Independent* — worker is a separate process. ✅ *Negotiable* — price-source split negotiable. ✅ *Valuable* — fixes a live correctness bug + enables execution. ✅ *Estimable* — mirrors known `monitor-calls` behavior. ✅ *Small* — fits a sprint. ✅ *Testable* — transition parity with `monitor-calls` on fixtures.

---

#### AD-05 — Invert enforcement: move guardrails server-side on paper trades

**User Story:**
As **the LongX team**,
I want **to move risk enforcement from `AppContext` to the server chokepoint while trades are still simulated**,
so that **the discipline guarantees become real and unbypassable before any real money is involved.**

**Acceptance Criteria (BDD):**
- **Given** the current client-side `executeTrade()` / `refreshDailyStats()` enforcement, **when** the server chokepoint goes live, **then** daily-limit and risk enforcement is authoritative server-side and a direct PostgREST insert cannot bypass it (RLS + no direct `user_calls` write path).
- **Given** enforcement has moved, **when** the frontend records a trade, **then** `AppContext` reflects server truth optimistically but is no longer the source of enforcement.
- **Given** the migration runs on **paper** trades, **when** server-side circuit breakers, tighten-only stops, rejection recording, and DQS grading are active, **then** they operate end-to-end with zero Binance key risk.

**Complexity:** L
**Notes:** The pivotal milestone — the product becomes itself here, still on paper. The existing Home blocked-countdown and `UserCallDetail` screens get wired to real backend state. This is where the most care is spent.
**Traceability:** unblocks/realizes US-02, US-04, US-05, US-06 on paper; demotes `AppContext` enforcement.
**INVEST:** ✅ *Independent* — server enforcement is self-contained behind the chokepoint. ✅ *Negotiable* — UI-mirror strategy flexible. ✅ *Valuable* — the core product guarantee made real. ✅ *Estimable* — clear scope given the engine exists. ⚠️ *Small* — large; could split by guarantee (breakers vs stops vs grading). ✅ *Testable* — bypass-attempt and parity tests.

---

#### AD-06 — Map the existing schema onto the PRD data model

**User Story:**
As **the LongX team**,
I want **to evolve the existing tables (`calls`, `user_calls`, `users`) into the PRD entities via additive migrations**,
so that **the new model is reached without dropping live data or breaking the running feed.**

**Acceptance Criteria (BDD):**
- **Given** the existing `user_calls` (paper trades), **when** the migration runs, **then** they are mapped onto `TRADE_INTENTS` + `POSITIONS` (with `origin`, `parent_intent_id`, `entry_min/max`, `style`) without data loss, and existing `calls`/`traders`/`user_follows` become `TRADER_CALLS`/`TRADERS`/`USER_FOLLOWS`.
- **Given** new append-only tables (`BEHAVIORAL_EVENTS`, `TRADE_GRADES`, `STOP_ADJUSTMENTS`, etc.), **when** they are created, **then** they are partitioned monthly from the first migration and `types.ts` is regenerated.
- **Given** each migration, **when** it is applied, **then** it goes through `supabase/migrations/` and the app continues to function (no breaking drops; deprecated columns retired only after cutover).

**Complexity:** L
**Notes:** Brownfield schema evolution, not greenfield creation. The existing entry-range columns (`entry_price_min/max`) already match the PRD — a point of low-friction alignment.
**Traceability:** underpins US-01, US-03, US-06, US-11; evolves all existing tables.
**INVEST:** ✅ *Independent* — migrations are sequenced but self-contained. ✅ *Negotiable* — column-level choices flexible. ✅ *Valuable* — the data foundation for every feature. ✅ *Estimable* — existing schema is the starting point. ⚠️ *Small* — large; could split by entity cluster. ✅ *Testable* — migration up/down + data-integrity assertions.

---

#### AD-07 — Add the Binance backend and cut over to real execution (closed beta)

**User Story:**
As **the LongX team**,
I want **to add the Binance execution backend behind the gateway interface and launch a closed beta**,
so that **real trades execute on users' own accounts only after every discipline guarantee is proven on paper.**

**Acceptance Criteria (BDD):**
- **Given** the discipline guarantees proven on paper (AD-05), **when** the Binance backend is added, **then** the same gateway interface routes to either the paper backend or Binance, selected per the position's venue — no change to the discipline engine.
- **Given** the key vault, **when** a user connects Binance, **then** keys are KMS-envelope-encrypted, decrypted only in worker memory, verified withdraw-OFF / isolated / one-way, and never logged.
- **Given** closed-beta scope, **when** real execution is enabled, **then** it is gated to a small cohort and the simulated path remains available as the practice tier.

**Complexity:** L
**Notes:** Only here does real money enter. The paper path hardened since AD-04 becomes the practice tier. Carries the most integration uncertainty (partial fills, rate limits, reconciliation) — treat as "L or split after a spike."
**Traceability:** realizes US-03, completes US-09; adds `EXCHANGE_CONNECTIONS`, `EXCHANGE_ORDERS`, `ORDER_FILLS`.
**INVEST:** ✅ *Independent* — a new backend behind an existing interface. ✅ *Negotiable* — rollout scope flexible. ✅ *Valuable* — the product's real-money promise. ✅ *Estimable* — interface is defined; integration is the unknown. ⚠️ *Small* — large; key vault vs execution vs reconciliation could split. ✅ *Testable* — Binance testnet + permission-verification tests.

---
### 7.4 Adaptation Backlog (WSJF + dependency-sequenced)

Same WSJF method as §3, but for adaptation the **Risk-Reduction / Enablement** dimension dominates — these stories are valuable almost entirely because they *unblock* the product stories and *de-risk* the cutover, not because they ship user-facing features. That is correct and expected for migration work.

> Prompt-engineering note (the framing used to generate this ordering): *"You are a BA sequencing a brownfield strangler migration. Score each adaptation story on Business Value (does it ship user value directly?), Time Criticality (does delay block other work or compound risk?), and Risk-Reduction/Enablement (does it unblock product stories or remove a safety hazard like client-side-only enforcement?). For migration work, weight Risk-Reduction/Enablement highest. Then divide summed Cost of Delay by Fibonacci size, sort descending, and finally re-order to honor hard dependencies — nothing real-money before the server chokepoint."*

| ID | Adaptation story | Value | Time Crit. | Risk/Enable | CoD | Size (pts) | **WSJF** |
|---|---|---|---|---|---|---|---|
| AD-01 | Real auth + RLS | 4 | 9 | 10 | 23 | 8 | **2.88** |
| AD-02 | Python backend alongside | 3 | 8 | 9 | 20 | 5 | **4.00** |
| AD-03 | Port `evaluate-trade` | 5 | 7 | 9 | 21 | 13 | **1.62** |
| AD-04 | Worker replaces polling | 6 | 7 | 8 | 21 | 8 | **2.63** |
| AD-05 | Invert enforcement (paper) | 7 | 8 | 10 | 25 | 13 | **1.92** |
| AD-06 | Schema → PRD model | 5 | 7 | 8 | 20 | 13 | **1.54** |
| AD-07 | Binance backend + beta | 9 | 6 | 7 | 22 | 13 | **1.69** |

**Pure WSJF** favors the small enablers (AD-02, AD-01, AD-04). But the **dependency graph** binds the order: AD-02 (somewhere to put logic) and AD-06 (schema to write against) precede AD-03/AD-05; AD-01 precedes anything real-money; AD-05 (enforcement proven on paper) precedes AD-07 (real money) — the non-negotiable safety gate. The delivery sequence below honors both and maps directly to the migration milestones M0–M5 from `LONGX.md` §9.

| Milestone | Adaptation stories | Product stories unblocked | Gate |
|---|---|---|---|
| **M0 — Safe to hold keys** | AD-01 | (US-09 auth slice) | Real auth + RLS before anything real |
| **M1 — Backend home + engine** | AD-02, AD-06 (start), AD-03 | US-01 | Python chokepoint live; `evaluate-trade` ported with parity |
| **M2 — Continuous status** | AD-04 | (infra for US-03, US-05) | Worker replaces polling; bug fixed |
| **M3 — Enforcement on paper** | AD-05, AD-06 (complete) | US-02, US-04, US-05, US-06 | **The product becomes itself, zero key risk** |
| **M4 — Real money, closed beta** | AD-07 | US-03, US-09 (complete) | Guarantees proven on paper → keys enabled |
| **M5 — Differentiators** | (no new AD) | US-07, US-08, US-10, US-11, US-12 | Built on the adapted substrate |

The hard safety invariant, restated as a gate: **AD-07 must not start until AD-05 is done.** Real keys never touch a system whose enforcement hasn't been proven server-side.

### 7.5 Adaptation Work Tickets

Layers as in §4: **FE** frontend, **BE** backend, **WK** worker, **DATA** schema/migration, **INFRA** infra/security, **QA** test. Tickets reference the actual repo artifacts from `CLAUDE.md`.

> **All adaptation tickets are governed by the Testing & TDD Policy (§8), the Backend & Refactoring Policy (§9), and the Integration/E2E/AI-QA Policy (§10).** Migration work has two extra rules: (1) parity suites (AD-03, AD-04) are the *human-approved executable specification* of legacy behavior — they are written and confirmed failing/passing against the legacy implementation **before** the port begins, and the port is done only when they pass against the new implementation; (2) the AD stories are, by nature, **refactors that touch system boundaries** (API contracts, shared schema, the FE↔backend seam) — every one of them falls under §9's R3 (human review before merge, no exceptions). Additionally, per §10 R2, adaptation integration tests run against pinned-version ephemeral environments matching production (same Postgres major as Supabase, same Redis) — never against an all-mocked stack.

#### AD-01 — Real auth + RLS (8 pts)
- **INFRA-AD1.1** Enable Supabase Auth; configure providers (email/OAuth) — **3**
- **DATA-AD1.2** Replace allow-all RLS with per-user policies across all tables; keep feed read public — **5**
- **DATA-AD1.3** Reconcile existing `users` rows with auth identities (backfill script) — **3**
- **FE-AD1.4** Integrate auth into provider tree (`AppProvider`), derive `currentUser` from session, persist across reload — **5**
- **FE-AD1.5** Update inline `isOnboarded` route guards to auth session — **2**
- **QA-AD1.6** RLS isolation tests (user A cannot read B); session-persistence test — **3**

#### AD-02 — Python backend alongside (5 pts)
- **INFRA-AD2.1** Scaffold FastAPI service + deploy target; connect to existing Supabase Postgres — **3**
- **BE-AD2.2** Establish module packages (`discipline/`, `analysis/`, `scoring/`, `coach/`, `accounts/`) — **2**
- **INFRA-AD2.3** import-linter CI rule (engine imports no I/O) — **2**
- **FE-AD2.4** FE→Python contract/health call to prove the path — **2**
- **QA-AD2.5** Health endpoint + CI boundary-rule tests — **1**

#### AD-03 — Port `evaluate-trade` (13 pts)
- **BE-AD3.1** Port indicators (ATR, RSI, EMA 50/200, MACD, Bollinger, S/R, Fibonacci) to Python — **8**
- **BE-AD3.2** Port the three gates (SL side, SL≥0.8×ATR, R:R≥1.5) as pure functions — **3**
- **QA-AD3.3** Parity suite: Python vs Deno output on fixed OHLC fixtures within tolerance — **5**
- **FE-AD3.4** Switch `/trade` from `functions.invoke('evaluate-trade')` to the Python endpoint — **3**
- **BE-AD3.5** Retire Deno `evaluate-trade` after parity sign-off — **1**

#### AD-04 — Worker replaces polling (8 pts)
- **WK-AD4.1** Stand up worker process; market-data ingestion (execution-relevant prices) — **5**
- **WK-AD4.2** Port `monitor-calls` transition logic (Live/Filled/Win/Loss/Expired + result%) to the worker, on paper `user_calls` — **5**
- **QA-AD4.3** Transition-parity tests vs `monitor-calls` on fixtures — **3**
- **WK-AD4.4** Retire `monitor-calls` polling from `Admin.tsx`; keep `get-price-history` for the 24h chart — **2**

#### AD-05 — Invert enforcement on paper (13 pts)
- **BE-AD5.1** Wire the chokepoint as the only write path to trades; block direct `user_calls` insert (RLS) — **5**
- **BE-AD5.2** Server-side `SESSION_STATES` enforcement (breakers, cooldown) — reuse US-05 tickets — **5**
- **FE-AD5.3** Demote `AppContext.executeTrade()`/`refreshDailyStats()` to optimistic mirror of server truth — **5**
- **FE-AD5.4** Wire Home blocked-countdown + `UserCallDetail` to real backend state — **3**
- **QA-AD5.5** Bypass-attempt test (direct PostgREST insert blocked); enforcement parity vs old client logic — **5**

#### AD-06 — Schema → PRD model (13 pts)
- **DATA-AD6.1** Migrate `user_calls` → `TRADE_INTENTS` + `POSITIONS` (origin, parent_intent_id, entry_min/max, style) — **8**
- **DATA-AD6.2** Map `calls`/`traders`/`user_follows` → `TRADER_CALLS`/`TRADERS`/`USER_FOLLOWS` — **3**
- **DATA-AD6.3** Create append-only tables (`BEHAVIORAL_EVENTS`, `TRADE_GRADES`, `STOP_ADJUSTMENTS`, `VALIDATION_RESULTS`) partitioned monthly — **5**
- **DATA-AD6.4** Regenerate `types.ts`; update typed Supabase client usages — **3**
- **QA-AD6.5** Migration up/down + data-integrity (no loss) tests — **5**

#### AD-07 — Binance backend + closed beta (13 pts)
- **DATA-AD7.1** `EXCHANGE_CONNECTIONS` (encrypted_key_ref, permissions_snapshot, modes) — **2**
- **WK-AD7.2** KMS key vault; in-memory-only decryption — **5**
- **WK-AD7.3** Binance backend behind gateway interface (venue-selected execution) — **8**
- **WK-AD7.4** Permission verification (withdraw-OFF, isolated, one-way) at connect + periodically — **3**
- **INFRA-AD7.5** NAT gateway / stable egress IPs for key whitelisting — **3**
- **FE-AD7.6** Connect-Binance onboarding step; closed-beta cohort gating — **5**
- **QA-AD7.7** Binance testnet integration; key never logged; paper/real venue routing tests — **5**

### 7.6 Adaptation Effort Estimation

Fibonacci story points, same convention as §5 (effort + uncertainty + risk; story points are the rounded roll-up of tickets, not a literal sum).

| Adaptation story | Ticket points (sum) | Story points (Fibonacci) | Complexity |
|---|---|---|---|
| AD-01 | 21 | 8 | M |
| AD-02 | 10 | 5 | M |
| AD-03 | 20 | 13 | L |
| AD-04 | 15 | 8 | M |
| AD-05 | 23 | 13 | L |
| AD-06 | 24 | 13 | L |
| AD-07 | 31 | 13 | L |
| **Total** | **144** | **73** | — |

**Timeline read:** ~73 adaptation points at ~20 pts/sprint is roughly **3.5–4 sprints** of migration scaffolding, interleaved with (not added on top of) the product stories — because several AD stories *are* the delivery vehicle for their US counterparts (e.g. AD-05 realizes US-02/04/05/06 on paper; AD-07 realizes US-03/US-09). The honest combined read: **the adaptation does not add ~73 points on top of the ~109 product points; it front-loads and partially overlaps them.** A realistic MVP-to-closed-beta envelope is **~6–7 sprints (~3–3.5 months)**, with M3 (AD-05) as the pivotal, highest-care milestone and AD-07 carrying the most integration uncertainty.

**Uncertainty flags (stated honestly):** AD-03's indicator parity (the Deno→Python port may surface floating-point or library-behavior differences that the tolerance suite must absorb), AD-06's data migration (paper `user_calls` → `TRADE_INTENTS`+`POSITIONS` is a non-trivial reshape on live data), and AD-07's exchange integration (the usual real-venue edge cases). Each is marked "13 or split after a spike."

### 7.7 Adaptation traceability

| Adaptation story | Replaces / evolves (from `CLAUDE.md`) | Unblocks (US) | Milestone |
|---|---|---|---|
| AD-01 | nickname login, allow-all RLS | US-09 (auth) | M0 |
| AD-02 | — (new Python service) | US-01, US-06, US-08 | M1 |
| AD-03 | `evaluate-trade` edge function | US-01, US-07 | M1 |
| AD-04 | `monitor-calls` polling | US-03, US-05 | M2 |
| AD-05 | `AppContext` client-side enforcement | US-02, US-04, US-05, US-06 | M3 |
| AD-06 | `calls`/`user_calls`/`users` schema | US-01, US-03, US-06, US-11 | M1–M3 |
| AD-07 | simulated capital / paper trades | US-03, US-09 | M4 |

Every adaptation story traces to a concrete artifact in the existing codebase that it evolves or retires, and to the product stories it unblocks — so the migration backlog is auditable both backward (to the current repo) and forward (to the MVP).

---

## 8. Testing & TDD Policy — Quality Discipline for AI-Assisted Implementation

> **Source:** `testing-ia-buenas-practicas.md` (the team's TDD/testing best-practices guide for AI-assisted development). This section adapts that guide — which defines the *what* and *why* — to LongX's concrete stack and tickets (the *how*). It governs **every ticket in §4 and §7.5 without exception.**

### 8.1 The golden rule, applied to LongX

**The human defines the WHAT (tests / acceptance criteria). The AI implements the HOW (code). Never the reverse.**

In this plan, the golden rule is already structurally embedded: **the BDD acceptance criteria in every US/AD story are the human-owned specification.** The workflow per ticket is:

1. The BDD criteria of the parent story are translated into concrete failing tests *first* — proposed by the AI agent if convenient, but **reviewed and approved by the human before any implementation exists**.
2. Only then is implementation requested.

Direct consequences (policy, not suggestion):
- An AI agent **never modifies, deletes, or disables an existing test** without explicit human approval. (This is already a guardrail in the repo's `CLAUDE.md`: *"NEVER modify existing tests unless explicitly asked — fix the implementation instead."* It is hereby elevated from repo convention to project policy.)
- When a test fails, the default correction is **fix the implementation, not relax the test**.
- Domain edge cases (see 8.4) are validated with the human — never assumed by the agent.

**Why this matters more for LongX than for an average product:** the discipline engine *is* the product promise. A hallucinated-but-plausible rule implementation that "looks right" is precisely the failure mode TDD-with-AI exists to prevent — the tests are the deterministic contract that validates non-deterministic code generation.

### 8.2 Red → Green → Refactor, per ticket

Every implementation ticket follows the test-first agent workflow:

```
1. Human writes/reviews the test derived from the story's BDD criteria.
2. Explicit instruction to the agent: "TDD. Do not implement yet."
3. Confirm the test FAILS (Red) before any implementation code exists.
4. Agent implements the MINIMUM code to pass (Green). "Fake It" (hardcoded
   return) is a legitimate intermediate step — but never reaches a merge.
5. Tests run automatically (watch mode locally, full suite in CI).
6. Failure → fix the implementation, never the test. Pass → refactor is
   requested as an EXPLICIT, SEPARATE step, keeping all tests green.
7. Human reviews; move to the next acceptance criterion. Small, frequent commits.
```

**Fake It + Triangulation, used deliberately:** for the discipline-engine rules this pattern is the recommended way to direct the agent. Example — position sizing (BE-01.3): first test fixes one scenario (equity 10k, risk 1%, stop distance 2% → size X); the agent may hardcode X. The second test with different inputs (Triangulation) forces the real formula. This prevents the agent from over-implementing or guessing an unverified generalization — and the resulting parametrized table becomes the rule's living specification.

### 8.3 Test design conventions (project-wide)

- **Naming describes behavior, not the function called.** Pattern: `<unit>_<scenario>_<expectedResult>` in Python (`test_validate_intent_fourth_trade_of_day_rejects_with_trade_cap_rule`), `should ... when ...` in Vitest. A CI failure must be diagnosable from the name alone.
- **AAA / Given-When-Then, one behavior per test.** One Act per test; a second Act means a second test. The stories' BDD criteria map 1:1 onto this structure.
- **Parametrization is the default for the rule matrix.** The discipline engine's rules (stop side, R:R floor, leverage band, trade caps, cooldowns, Ulysses direction classification) are inherently tabular — `pytest.mark.parametrize` tables where **adding a case is adding a data row, not a test**. QA-01.7 ("property + table tests for the rule matrix") is explicitly this.
- **Descriptive assertions.** Failure messages must explain the problem without opening the code — semantic matchers over generic booleans, context messages on parametrized cases (include the rule name and inputs in the assert message).
- **Edge cases — division of labor:** the agent generates the technical/obvious ones (nulls, empty, zero-distance stop, negative prices, boundary values at exactly the R:R floor). The **human contributes the domain invariants the code cannot reveal**: stop-side semantics inverted for shorts, break-even nuances, "tighten during lockout is allowed", session-day boundaries in UTC vs. user timezone, Binance LOT_SIZE/MIN_NOTIONAL rounding effects on computed size. Standing practice: ask the agent *"what other edge cases do you see, prioritizing business-domain ones?"* and contrast against human domain knowledge before closing a ticket.

### 8.4 Mocking strategy: mock at the boundaries — and LongX's boundaries are these

Tests must not depend on real external infrastructure. The **architectural boundaries** of LongX, and the policy at each:

| Boundary | Test strategy |
|---|---|
| **Binance API** (REST + streams) | Never called in unit/integration suites. Recorded fixtures + a fake exchange double implementing the gateway interface; **Binance testnet only in the dedicated integration tier** (QA-03.7, QA-AD7.7). |
| **LLM provider** | Always mocked. Coach tests assert *grounding* (output references only supplied facts) and the *no-directional-content* guard against a fake; template-fallback path tested with the mock failing. |
| **KMS** | Faked with an in-memory envelope implementation; assert "decrypt only in worker memory, never logged" via the fake. |
| **Postgres** | **Not mocked** — integration tests run against ephemeral disposable containers (testcontainers), per the guide's "real but isolated storage" rule. Migrations run in the container; this also tests AD-06's up/down paths. |
| **Redis** | Ephemeral container in integration; in-memory fake in unit tests of the session-state gateway. The "sync rebuild on miss" rule (BE-05.4) is tested by killing the fake. |
| **Clock** | Injected everywhere time matters (cooldowns, Ulysses `applies_at`, session-day boundaries). No test ever sleeps or reads the wall clock. |
| **Frontend network** | Intercept at the network layer (MSW), not by mocking fetch/supabase-js functions — the same mocks serve Vitest, local dev, and component documentation. |

**Dependency injection over framework mocking:** the discipline engine takes plain data in and returns verdicts — by design it needs **zero mocks** (that is what the import-linter I/O ban buys). Repositories are injected; in-memory implementations serve unit tests.

**Over-mocking tripwire (policy):** if a mock is more complex than the code under test, the test moves up a level to integration. Agents instructed to "mock whatever is needed" produce disproportionate mocks — this instruction is banned; boundaries are named explicitly per the table above.

### 8.5 Test levels: the Testing Trophy, mapped to LongX

Investment follows confidence-per-cost, not unit-count dogma:

```
        E2E           ← 3 flows only (see below)
     Integration      ← the bulk of the investment
        Unit          ← pure decision logic only
   Static analysis    ← free and continuous
```

- **Static first:** `mypy --strict` + `ruff` on Python; TypeScript strict + ESLint on the PWA (already configured); import-linter as an architectural test (BE-01.5, INFRA-AD2.3). A whole category of defects dies here at zero maintenance cost.
- **Unit — reserved for logic that decides:** the discipline-engine rules, position sizing, DQS dimension scorers, the repair algorithm, Ulysses direction classification, counterfactual replay math. These are pure functions with real branching — the sweet spot. Code that merely orchestrates (routes, thin services) gets no dedicated unit tests.
- **Integration — where LongX's risk actually lives, and the bulk of the budget:** API + real Postgres (chokepoint end-to-end: intent → double validation → outbox row, RLS bypass attempts per QA-AD5.5); worker vs. fake exchange (order idempotency, stop placement on fill, reconciliation drift correction); outbox → Streams → consumer delivery; migration up/down with data integrity (QA-AD6.5); parity suites (QA-AD3.3, QA-AD4.3).
- **E2E — critical business flows only, nothing else:** (1) onboarding + Binance connect with permission verification, (2) intent → validate → execute → grade → coach (the product spine), (3) circuit-breaker lockout surviving logout/direct API. Every other variant is covered one level down.

### 8.6 Coverage as signal — and mutation testing where it counts

- **No mandatory coverage percentage.** A coverage target produces empty tests (code executed, nothing asserted) — false confidence. Coverage is a **radar** to find untested zones, prioritizing *relative* coverage of critical modules over the global number.
- **Mutation testing on the critical core:** `mutmut`/`cosmic-ray` runs on the discipline engine and DQS scorers — the two modules where a test suite that "passes without validating" is an existential product risk. A surviving mutant in a rule is treated as a missing test case.
- **Excluded from coverage math:** generated `types.ts`, DTOs/Pydantic models without logic, barrel files, migration boilerplate — so the metric is not distorted by trivial code.

### 8.7 AI-specific anti-patterns — actively blocked

| Anti-pattern | LongX enforcement |
|---|---|
| **Test Theater** (same AI writes code *and* its confirming tests) | Tests derive from the stories' human-owned BDD criteria and are approved before implementation; Red is confirmed before Green. Where tooling allows, separate agent sessions/roles for test-writing vs. implementation vs. refactor. |
| **Test manipulation to force green** | Blocked by policy (8.1), by the repo `CLAUDE.md` guardrail, and by review: any diff touching `test_*`/`*.test.*` files requires explicit human sign-off. |
| **Vibe coding without a net** | Acceptable only for throwaway spikes (explicitly labeled, deleted after). Anything merged to main was born from a failing test. |
| **Over-mocking** | Boundary table in 8.4 is exhaustive; the "mock more complex than the code → move up a level" tripwire applies. |
| **Coverage gaming** | No coverage gate to game (8.6); mutation testing catches assertion-free tests on the core. |
| **Ungoverned duplication/churn** | "Minimum code to pass" + explicit separate refactor step + small commits — the discipline that counters AI agents' tendency to clone patterns instead of generalizing. |

### 8.8 When NOT to write tests (senior judgment, also policy)

- **Throwaway spikes** — e.g. the pre-estimation spikes flagged for US-03/US-07/AD-07: their output is knowledge, not code; if the code is discarded in days, so are its tests. Label spikes explicitly.
- **Trivial logic-free code** — Pydantic DTOs, generated Supabase types, wrappers that only delegate. Static typing already covers them.
- **Design under active user validation** — new behavioral-layer UI (coach panel, consistency dashboard) while its design is still being iterated with beta users: test the observable flow at E2E/integration level, not internal details that will change next week.
- **Implementation-coupled tests** — tests asserting *how* code works instead of observable behavior break on every refactor and provide friction, not confidence. The operative question is never *"does it have tests?"* but *"do its tests give real confidence to change it?"*

### 8.9 Definition of Done — every ticket, both §4 and §7.5

A ticket is **done** only when all of the following hold:

- [ ] Tests derived from the story's BDD criteria existed and **failed before implementation** (Red confirmed).
- [ ] Implementation is the minimum that passes; any "Fake It" step was generalized via Triangulation before merge.
- [ ] Refactor performed as a separate step with the full suite green.
- [ ] **Full suite** runs green — not just the new tests.
- [ ] No existing test was modified/deleted/disabled without explicit human approval recorded in the PR.
- [ ] Mocks only at the 8.4 boundaries; integration tests use ephemeral containers, not shared environments.
- [ ] Domain edge cases reviewed with the human (8.3); technical edge cases generated and covered.
- [ ] Assertions are meaningful (a failure message diagnoses the problem); parametrized where tabular.
- [ ] For discipline-engine / DQS changes: mutation run shows no surviving mutants in touched code.
- [ ] Static analysis (mypy/ruff/TS strict/ESLint/import-linter) passes.
- [ ] **§9 blocking checklist passes** (R1–R19: no boundary refactor without human review, invariants in domain objects, core imports no infrastructure, no generic names, no speculative patterns, closure rule evaluated).
- [ ] **§10 blocking checklist passes** (integration/E2E/BDD/AI-QA rules: pinned-version test environments, semantic selectors, independent E2E, Gherkin anti-pattern review, no PII to external AI, human review of every AI-generated test before first merge, prompts versioned).
- [ ] New user-facing strings are bilingual via `useT()` (repo guardrail, restated here because DoD is where it gets checked).

### 8.10 Test-level mapping per story

| Story | Dominant test level | Key suites |
|---|---|---|
| US-01 / AD-03 | **Unit (parametrized) + property** | Rule matrix tables; sizing Triangulation; indicator **parity suite** vs Deno on fixed OHLC fixtures; property tests (e.g. computed size never risks > chosen %) |
| US-02 | Integration | Rejection persists event + context; pattern detector fires at threshold |
| US-03 / AD-07 | **Integration (fake exchange) + testnet tier** | Idempotent clientOrderId (double-fill impossible); stop placed on fill; reconciliation corrects injected drift; key never logged (fake KMS) |
| US-04 | Unit + integration | Tighten/widen table incl. shorts; widen attempt → event; tighten-during-lock allowed |
| US-05 / AD-05 | **Integration** | Breaker trips atomically (Redis+DB); lock survives logout/direct API; **bypass attempt via PostgREST blocked**; sync rebuild on cache miss |
| US-06 | Unit (scorers) + integration (assembler) | Fixture bundles → deterministic grades; won-but-reckless scores low / lost-but-disciplined scores high; grading_version pinning; **mutation testing mandatory** |
| US-07 | Unit + integration | Repair never flips side/asset/style; repaired output re-validates before display; decline → event |
| US-08 | Integration (LLM mocked) | Grounding assertion; no-directional-content guard; fallback on LLM failure |
| US-09 / AD-01 | Integration + **E2E #1** | RLS isolation (A cannot read B); withdraw-ON refused; default tier regardless of self-description; session survives reload |
| US-10 | Unit (classifier) + integration | Direction table; injected-clock `applies_at` asymmetry; loosen-during-lock rejected |
| US-11 | Integration | Copier sizing (5% trader → 0.75% copier fixture); gating/repair parity with self-authored trades |
| US-12 | Unit (replay math) + integration | Fixture history → deterministic dual curves; sparse-history state |
| AD-04 | **Parity integration** | Transition parity vs `monitor-calls` on fixtures before retirement |
| AD-06 | Migration integration | Up/down + zero-loss assertions on ephemeral container with production-shaped seed |

### 8.11 Governance: making the agent respect TDD (repo setup)

Per the guide's §11, AI agents do not follow TDD by default — the environment must impose it:

1. **Persistent instructions file at the repo root** — the existing `CLAUDE.md` already carries the never-modify-tests guardrail; it is extended with the TDD policy block:

```markdown
## Development policy (TDD)
- Always follow Red → Green → Refactor.
- Write the simplest failing test first; confirm it fails before implementing.
- Implement only the minimum code to pass ("Fake It" is a valid intermediate step).
- Never delete, disable, or modify existing tests without explicit approval.
- One test at a time; small frequent commits.
- Business-domain edge cases are validated with the human, never assumed.
- Mock only at boundaries (Binance, LLM, KMS, clock); Postgres/Redis via ephemeral containers.
- Run the FULL suite after every change, not just the new test.
```

2. **Automatic test execution** — watch mode locally (pytest-watch / `vitest --watch`), full suite + static analysis + import-linter in CI on every push; the discipline-engine mutation run on a nightly/merge-to-main cadence.
3. **Enforcement tooling** — CI fails on any modified test file without the `test-change-approved` label; coverage report published as information, never as a gate.
4. **Role separation where tooling supports it** — separate agent contexts for test-authoring, implementation, and refactor, so the process that could "cheat" is never the one validating.

**Relation to the plan's structure (SDD → BDD → TDD):** the PRD (`LONGX.md`) is the specification (SDD) that tells the agent the business *what*; the stories' Given/When/Then define feature-level behavior (BDD); the per-ticket tests define unit-level behavior (TDD). The three levels are already aligned in this document — §8 closes the loop by making the tests the deterministic acceptance gate for AI-generated implementation at every level.

---

## 9. Backend Development & Refactoring Policy — Architecture Rules for AI-Assisted Code

> **Source:** `backend-refactorizacion-buenas-practicas.md` (the team's operative rules R1–R19 for refactoring, DDD, Hexagonal architecture, SOLID and design patterns in AI-assisted development). This section binds those rules to LongX's concrete modules, boundaries, and tickets. **Complementary to §8:** §8 makes tests the deterministic contract; §9 makes the code structure honor that contract and stay changeable. Both apply to every ticket in §4 and §7.5.

### 9.1 Refactoring rules (R1–R5), bound to LongX

**R1 — No refactor without behavioral test coverage.** If coverage is missing, write minimal **characterization tests first**. In LongX this rule has a name: the **parity suites**. AD-03 (porting `evaluate-trade`) and AD-04 (replacing `monitor-calls`) *are* characterization-test-first refactors — the fixture suites capture legacy behavior before a single line is ported. The same applies within the new codebase: no restructuring of the discipline engine, scorers, or worker without its suite green before and after.

**R2 — Every refactor prompt to an agent MUST state:** (a) the exact pattern, (b) the invariants that do not change, (c) the verifiable success criterion, (d) scope restrictions. LongX's standing invariants for (b), to be quoted in prompts verbatim:
- The discipline engine's public contract: `validate(intent, stage) → ValidationResult(passed, computed_size, rule_outcomes)`.
- The `VALIDATION_RESULTS` / outbox event schemas (consumed downstream by scoring, coach, worker).
- The gateway interface (venue-agnostic execution contract).
- The FE↔API JSON contracts and anything reflected in `types.ts`.

Template (adapted from the source doc, ready to use):
```
Refactoriza <módulo> aplicando <patrón exacto>.
Invariantes: la firma pública de <función>, el contrato ValidationResult,
y el esquema de eventos del outbox no cambian.
Criterio de éxito: toda la suite (incl. parity/property tests) sigue en verde sin modificar tests.
Restricciones: no introduzcas dependencias nuevas; alcance limitado a <paths>.
```

**R3 — Boundary-touching refactors NEVER merge without human review.** LongX's boundaries, named exhaustively so "boundary" is never a judgment call: the chokepoint API contract; the Postgres schema (shared with the FE via generated `types.ts`); the outbox/Streams event contracts; the gateway interface; the Binance-facing worker code; RLS policies; anything under `supabase/migrations/`. **Note that every AD story touches at least one of these** — the adaptation phase runs entirely under R3.

**R4 — Blast radius dictates supervision.** Low (one function/file, e.g. a single DQS dimension scorer): agent may execute without line-by-line supervision, **always** with the full suite after. High (multi-module: engine + outbox + consumers): mandatory tests + human review. The import-linter boundaries make blast radius mechanically visible — a diff crossing package boundaries is high radius by definition.

**R5 — Auto-reject AI diffs containing:** generic names (`process_data`, `handle`, `helper`, `utils.py` grab-bags), deleted business comments without justification, dead code (unused imports/functions), or unrequested external-behavior changes. In LongX, "business comments" includes the rule-rationale comments in the discipline engine (why 0.8×ATR, why tighten-only during lockout) — these encode domain knowledge and are protected.

**Review checklist for every AI refactor diff** (add to the PR template):
- [ ] Tests green, same assertions, none modified
- [ ] Public signature / external contract unchanged unless requested
- [ ] No generic names
- [ ] No business comments removed
- [ ] No dead code

### 9.2 DDD rules (R6–R8), bound to LongX

**R6 — Business invariants live in domain objects, never scattered in orchestration.** The map for LongX:

| Invariant | Lives in (domain object) | NOT in |
|---|---|---|
| Stop on correct side of entry; entry_min ≤ entry_max; R:R computable | `TradeIntent` (entity, validated on construction) | Route handlers, the FE form |
| chosen_risk_pct / chosen_leverage within tier band | `RiskProfile` (entity) | The guardrail endpoint |
| tighten-only; new stop strictly reduces risk given side | `StopAdjustment` / position domain logic | The worker's cancel/replace code |
| Money/price non-negative, symbol-consistent arithmetic | `Price`, `Quantity`, `RiskPercent` Value Objects | Ad-hoc float checks in services |
| Ulysses direction (tighten vs loosen) classification | `GuardrailChange` (VO/entity) | The API route |

The orchestration layers (FastAPI routes, worker tasks, outbox consumers) **coordinate** domain objects; they never re-implement their rules. This is the R6 line: if a `if intent.stop >= intent.entry` appears in a route, it's a violation — that check belongs to `TradeIntent.__post_init__`.

**R7 — Domain terminology everywhere.** LongX's ubiquitous language is already established by the PRD and MUST be used in code: `TradeIntent`, `ValidationResult`, `DisciplineEngine`, `CircuitBreaker`, `CooldownWindow`, `UlyssesDelay`, `DecisionQualityScore`, `ConsistencyScore`, `TraderCall`, `CopyExecution`, `ExternalInterference`, `ProtectiveStop`. Banned: `TradeValidator2`, `data`, `payload_processor`, `check()`.

**R8 — Value Objects are immutable and self-validating.** Frozen dataclasses / Pydantic frozen models; invalid state fails **in the constructor**, never silently downstream. Example bound to LongX:

```python
@dataclass(frozen=True)
class StopPrice:
    value: Decimal
    side: Side  # LONG | SHORT

    def validated_against(self, entry: Decimal) -> "StopPrice":
        if self.side is Side.LONG and self.value >= entry:
            raise InvalidStopError("stop must be below entry for longs")
        if self.side is Side.SHORT and self.value <= entry:
            raise InvalidStopError("stop must be above entry for shorts")
        return self
```

**Expected result:** an invalid stop cannot exist anywhere in the system — it dies at construction, not three layers later in the worker. (Also note `Decimal`, never `float`, for money/price — a domain invariant of its own in trading systems.)

**Agent command (adapted):**
```
Analiza discipline/ y scoring/. Lista qué entidades concentran lógica de negocio
y cuáles son anémicas (solo datos). Para cada anémica, propón qué validación
que hoy vive en routes/ o worker/ debería migrar hacia ella.
```

### 9.3 Hexagonal rules (R9–R11) — already structural in LongX, now explicit

The Option B architecture *is* Ports & Adapters; this section names the ports so no ticket improvises around them.

**R9 — The core never imports concrete infrastructure.** Already CI-enforced by import-linter (BE-01.5 / INFRA-AD2.3) for the discipline engine. The full port catalog:

| Port (owned by the core) | Production adapter | Test double |
|---|---|---|
| `ExchangeGateway` | `BinanceUsdmAdapter` (CCXT) | `FakeExchange` (in-memory fills/stops) |
| `MarketDataFeed` | Binance stream adapter | Fixture/replay feed |
| `KeyVault` | AWS KMS adapter | In-memory envelope fake |
| `TradeRepository`, `SessionStateRepository`, etc. | Postgres implementations | In-memory implementations |
| `EventBus` | Outbox → Redis Streams | In-memory recording bus |
| `CoachNarrator` | LLM adapter (+ template fallback) | Canned/echo narrator |
| `Clock` | System clock | Injected frozen/steppable clock |

**R10 — Business-logic tests run with zero real infrastructure.** This is §8.4 restated from the architecture side: engine, scorers, repair, Ulysses classifier test against fakes/in-memory implementations — no network, no DB, no credentials. **If a unit test needs real infrastructure to pass, the port is mis-drawn — fix the interface, not the test setup.**

**R11 — Adapters are fully replaceable without touching the core.** LongX has a built-in proof obligation: **the paper backend and the Binance backend implement the same `ExchangeGateway`** (AD-07 acceptance criterion: "no change to the discipline engine"). P2's Bybit adapter is the second proof. A PR that makes the core aware of *which* venue it's talking to violates R11.

**When NOT to apply hexagonal (per the source doc, honored here):** one-off migration scripts (e.g. the AD-01 users-backfill, AD-06 data reshape scripts) and throwaway spikes get no port ceremony — they are R1-covered by migration tests, not architecture.

**Agent command (adapted):**
```
Identifica en worker/ y api/ los lugares donde el código depende directamente
de un cliente/SDK externo (ccxt, boto3, redis, supabase). Para cada uno,
propón el port a extraer, dónde vive el adapter, y qué fake usa el test.
```

### 9.4 SOLID / DRY / CUPID rules (R12–R15), bound to LongX

**R12 — SRP:** more than one business reason to change → split. Concrete LongX application: validation rules are **one class/function per rule** (`TradeCapRule`, `RrFloorRule`, `NoAddsRule`…) composed by the engine — a new rule is a new unit, not an edit to a god-function. Same for DQS dimension scorers.

**R13 — DIP:** high-level modules depend on abstractions (see the R9 port catalog). The composition root (app startup / worker main) is the **only** place concrete adapters are wired.

**R14 — DRY only for the SAME business rule.** The LongX cases where "duplication" is two different rules that must NOT be unified, decided now so no agent "cleans them up":
- **Submit-stage vs confirm-stage validation:** same engine, but they are two invocations with different authority semantics — do not collapse into one call site.
- **Trader-call plausibility checks vs copier-intent validation:** the feed may sanity-check a published call, but the copier's validation against *their* profile is a distinct rule. Sharing code here would couple the feed's rules to the chokepoint's.
- **Paper fill model vs real fill recording:** superficially similar shapes, entirely different truths (simulation policy vs venue facts). Keep separate.
- Conversely, genuinely THE SAME rule appearing twice **is** a DRY violation: e.g. stop-side validation must exist only in the domain object (R6), never re-checked ad-hoc in the FE *as logic* (FE mirrors for UX are display, not enforcement).

**R15 — Folder structure reflects domain, not technical layer.** Already decided in AD-02 and reaffirmed as policy: `discipline/`, `analysis/`, `scoring/`, `coach/`, `accounts/`, `execution/` — **never** `services/`, `utils/`, `helpers/`. A PR adding `utils.py` gets rejected by name alone (R5 + R15).

### 9.5 Design pattern rules (R16–R18), bound to LongX

**R16 — No speculative patterns.** The patterns LongX uses are justified by present, demonstrable problems — and the table below is the *closed* list for MVP. Anything beyond it needs a demonstrated problem first:

| Pattern | LongX use | Justification (present problem) |
|---|---|---|
| Strategy | Venue backends behind `ExchangeGateway` | Two real variants exist at M4 (paper, Binance); Bybit is committed P2 |
| Repository | Domain aggregates (intents, positions, session state) | Real persistence + in-memory test doubles needed today |
| Observer / events | Outbox → Streams consumers (scoring, coach, worker) | Multiple genuine consumers of `position.closed` exist today |
| Decorator | Retry/rate-limit/logging around exchange calls | Cross-cutting venue-call behavior, used in worker today |
| Factory | Adapter selection per `POSITIONS.venue` at runtime | Venue chosen from data, not config constant |

Explicitly NOT used (no present problem): Strategy for grading formulas (one formula, versioned — a second variant would justify it later), Observer inside the engine (validation is synchronous by design), CQRS/event-sourcing beyond the outbox (the append-only tables give auditability without the ceremony).

**R17 — Singleton banned.** Adapters, repositories, engine instances: wired by the composition root, injected everywhere. Accepted, documented exceptions only: process-level logger and settings object — each carries a code comment citing this rule.

**R18 — Prefer native primitives over reimplemented patterns.** Python-specific rulings for this codebase: `Protocol` for ports (no ABC ceremony unless shared behavior exists); frozen `dataclass`/Pydantic for VOs; first-class functions for simple strategies (a dict of rule-callables beats a class hierarchy); generators for stream processing in the worker; `functools` caching over hand-rolled memoizers.

**Agent command (adapted):**
```
Revisa los últimos commits de <módulo>. Señala:
1) código que reinventa Factory/Strategy/Observer sin usar la primitiva nativa
   (Protocol, dict de callables, generadores);
2) patrones presentes que no resuelven un problema demostrable hoy (cita R16).
```

### 9.6 Closure rule (R19) and the blocking checklist

**R19 — Before closing any change, evaluate:** does the resulting structure reduce or increase the context needed for the next modification? If it increases it, *that* is the next mandatory refactor before new functionality. In LongX terms: if adding rule N+1 to the engine, dimension N+1 to the DQS, or venue N+1 to the gateway requires touching more files than the last one did, the structure has degraded — stop and refactor first. This is measurable: each of those three extension axes should stay at "one new unit + one registration line."

**Blocking checklist (gates every PR/commit, alongside the §8.9 DoD):**
- [ ] R1–R5 (refactor safety) — including R3 human review if any named boundary was touched
- [ ] R6–R8 (DDD) — invariants in domain objects, ubiquitous language, self-validating VOs
- [ ] R9–R11 (Hexagonal) — no infra imports in core, tests infrastructure-free, adapters swappable
- [ ] R12–R15 (SOLID/DRY) — SRP per rule/scorer, DIP via composition root, no false-DRY merges, domain folders
- [ ] R16–R18 (patterns) — no speculative patterns, no singletons, native primitives preferred
- [ ] R19 evaluated — next-change context did not grow

### 9.7 Governance: repo enforcement

Extends §8.11's `CLAUDE.md` block so any agent (Claude Code, Cursor) inherits both policies:

```markdown
## Backend & refactoring policy (R1–R19)
- Never refactor without behavioral coverage; write characterization tests first.
- Refactor prompts always state: pattern, invariants, success criterion, scope.
- Boundary refactors (API contracts, DB schema, outbox events, gateway interface,
  migrations, RLS) always require human review before merge.
- Business invariants live in domain objects (entities/VOs), never in routes,
  workers, or consumers. VOs are frozen and self-validate in the constructor.
- Core never imports infrastructure (ccxt, boto3, redis, supabase clients);
  access goes through ports. Unit tests run with zero real infrastructure.
- Domain folder structure (discipline/, scoring/, ...); never utils/ or helpers/.
- No speculative patterns; no singletons (composition root + DI); prefer native
  primitives (Protocol, frozen dataclass, dict-of-callables, generators).
- Reject diffs with generic names, deleted business comments, or dead code.
- Before closing: if the next change now needs MORE context, refactor first.
```

Mechanical enforcement where possible: import-linter (R9), ruff naming rules + a lint ban on `utils.py`/`helpers.py` (R5/R15), PR template carrying both checklists (§8.9 + §9.6), and the `test-change-approved` label rule from §8.11 doubling as R1's guard.

---

## 10. Integration, E2E, BDD & AI-QA Policy — Automated Testing Rules for AI-Assisted QA

> **Source:** `automated-tests-qa-ia-buenas-practicas.md` (the team's operative rules R1–R34 for integration testing, E2E, BDD/Gherkin, and responsible AI-assisted QA). This section binds those rules to LongX. **Namespace note:** rule numbers below follow the source document and are local to §10 — they are a separate namespace from §9's R1–R19. **Relationship to §8:** §8.5 budgets the test levels (trophy); §10 specifies *how* the integration and E2E tiers are built, and governs every AI-generated test at any level.

### 10.1 Integration testing rules (R1–R4), bound to LongX

**R1 — Incremental integration, never big bang.** LongX's milestone sequence *is* incremental bottom-up integration by design: engine in isolation (M1) → engine + API + DB (M1) → + worker on paper transitions (M2) → + enforcement end-to-end (M3) → + real venue (M4). Policy consequence: **no milestone's integration suite waits for a later milestone's components** — each tier integrates against what exists, so a failure always names its interface. A "test everything once Binance is connected" plan is banned as big-bang.

**R2 — Test environments mirror production.** Ephemeral containers (per §8.4) run **pinned versions matching production**: the same Postgres major version as the Supabase project, the same Redis version as the managed instance, migrations applied the same way (`supabase/migrations/`). And the explicit corollary: an integration suite where *everything* is mocked is not integration — LongX's integration tier always has real Postgres and real Redis in the container; only the §8.4 boundaries (Binance, LLM, KMS) are doubles.

**R3 — Test data covers normal, boundary, and exception cases.** For LongX this is concretized by the rule matrix: every integration fixture set includes the happy path, the exact-boundary cases (R:R exactly at the tier floor, the Nth trade exactly at the cap, stop exactly at break-even, loss exactly at the daily limit), and the exception paths (venue rejection, partial fill, desync, locked session). Happy-path-only fixture sets fail review.

**R4 — Success criteria defined before execution.** Structurally guaranteed in this plan: every integration test derives from a story's BDD criterion written months before the code (§8.1). The rule's operational teeth: a test whose assertion was written *after* observing the system's output ("it returns 3, so assert 3") is characterization at best — acceptable only in the explicitly-labeled parity suites (AD-03/AD-04), never in new-feature tests.

### 10.2 E2E rules (R5–R9), bound to LongX

The three E2E flows from §8.5 (onboarding+connect, the trade spine, lockout persistence), implemented in Playwright against the PWA:

**R5 — Semantic selectors only.** `getByRole` / `getByLabel` — never CSS classes, never Tailwind utility selectors, never autogenerated IDs. LongX nuance: the UI is bilingual with **ES as default**, so accessible names are Spanish by default. Policy: E2E suites run with an explicitly set locale (es-AR primary; one smoke pass in EN), and selectors use the accessible name for that locale — resolved via the same `useT()` string pairs, so a copy change updates test and UI from one source. A style refactor must never break an E2E; a *copy* change updates both sides together.

**R6 — Test independence.** Every E2E scenario creates its own user, connection (fake exchange), and session state via factories; no test consumes state left by another; suite passes in any order and in isolation. LongX-specific trap this rule exists for: `SESSION_STATES` is per-user-per-day — sharing a test user across scenarios makes the circuit-breaker tests order-dependent. Banned.

**R7 — Trace/screenshot/log on first retry in CI.** Playwright's `trace: 'on-first-retry'` is mandatory config, so CI failures are debuggable without local reproduction — non-negotiable for a solo maintainer.

**R8 — Sharding and browser caching in CI.** With only 3 flows this is cheap insurance now; the rule matters when the E2E tier grows in P2 (verified traders, staking flows).

**R9 — Realistic data via fixtures/factories, no magic values.** A `TraderFactory`, `IntentFactory`, `CallFactory` produce realistic BTC/ETH price geometry (entries, stops, and targets that satisfy or violate rules *by construction*, labeled as such). The same factories serve integration and E2E. Repeated literals like `50000` sprinkled across tests fail review.

### 10.3 AI applied to integration/E2E (R10–R14), bound to LongX

**R10 — Accessibility-tree automation over vision.** Agent-driven test generation and debugging works from the DOM/a11y tree, not screenshots+vision models — more deterministic, faster, cheaper. Vision-based assertions are reserved for the one place they earn it (if ever): chart rendering (`UserCallDetail`'s Entry/SL/TP lines), and even there prefer asserting the data props over pixels.

**R11 — Stabilization before acceptance.** Any agent-generated E2E must pass **5 consecutive runs** (local) plus a clean CI run before merge. One green run is not evidence — flakiness in the trade-spine E2E would erode exactly the confidence the suite exists to provide.

**R12 — Generation prompts mandate semantic selectors.** Standing prompt fragment (versioned per R31): *"Usa selectores semánticos (rol/etiqueta accesible) — nunca clases CSS, utilidades Tailwind ni IDs autogenerados."*

**R13 — Page Object Model in two steps.** Step 1: the agent explores the PWA and proposes the POM structure (screens per §10 of `LONGX.md`: OnboardingPage, HomePage, TradeTicketPage, TradeDetailPage, HubPage…). Step 2 — only after human approval of that structure — tests are written against it. Never both steps in one unreviewed pass.

**R14 — No production data to external AI. Ever.** LongX-sensitive data enumerated so this is never a judgment call: user emails, API-key material *and metadata* (`encrypted_key_ref`, permission snapshots), real trade history, real balances/equity, behavioral events of real users. Test generation and debugging use seeded synthetic data from the R9 factories. This rule extends §8's boundaries into the *tooling* dimension.

### 10.4 BDD / Gherkin rules (R15–R18), bound to LongX

The stories' Given/When/Then criteria (§2, §7.3) graduate into `.feature` files as the integration/E2E specs. Rules for that graduation:

**R15 — One business event per scenario (one *When*).** Some story criteria in §2 compound conditions for brevity (e.g. US-06's "lost-but-disciplined AND won-but-reckless") — on graduation to Gherkin these **split into separate scenarios**. The story text is the narrative; the feature file is the executable form and follows the stricter rule.

**R16 — Domain language, never UI/implementation language.** LongX's ubiquitous language (§9.2 R7) is the vocabulary: *"When the trader submits an intent"*, *"When the session locks"*, *"Then the trade is graded"* — never *"clicks the red button"*, never JSON payloads, never table names. A stakeholder (or a beta trader) must be able to read and validate any scenario.

**R17 — Scenario Outline + Examples for tabular cases.** The rule matrix and tier boundaries are the canonical use: one `Scenario Outline: intent validation against tier limits` with an Examples table per tier — the Gherkin twin of §8.3's pytest parametrization. Copy-pasted near-identical scenarios fail review.

**R18 — Three Amigos, adapted honestly to a one-person team.** The rule's intent is that no single role writes Gherkin in isolation. LongX's honest adaptation: the founder covers PO+dev; the **QA perspective** is covered by the §10 anti-pattern review as a separate, deliberate pass (different day or different agent session than authorship); the **business perspective** is covered by validating ambiguous scenarios against real beta traders' expectations during closed beta. What the rule forbids in this setup: treating AI as the second and third amigo — the AI drafts, it never validates (R19).

### 10.5 AI-assisted BDD (R19–R21), bound to LongX

**R19 — AI proposes, humans approve.** Scenarios generated from a US/AD story are drafts. They become specification only after human review — consistent with §8.1's golden rule; the `.feature` file is spec-level content and spec authorship stays human.

**R20 — Every AI-generated scenario is reviewed against the 7-item anti-pattern checklist** (imperative UI steps; technical references — DOM IDs, payloads, column names; multiple When/Then; copy-paste cases that should be an Outline; inconsistent terminology for the same action; phantom preconditions business never agreed; loss of domain language). Reference prompt, versioned in the repo:

```
Genera escenarios Gherkin (Feature + Scenarios) para: "<US-xx>".
Cubre: caso feliz, caso límite exacto (borde de regla), entrada inválida,
y combinación de condiciones. Reglas: un único When por escenario, lenguaje
del dominio LongX (trader, intent, session lock, DQS — nunca UI ni payloads),
Scenario Outline si los casos comparten estructura. Dominio: trading crypto
disciplinado; idioma: español; locale: es-AR. Esto es un borrador para
revisión humana, no una especificación final.
```

**R21 — Step-definition deduplication.** When generating step definitions from a `.feature`, the prompt explicitly instructs reuse of existing steps — the ubiquitous language keeps steps naturally shared (*"Given a trader on tier {tier}"* appears across many features and must exist once).

### 10.6 ML vs LLM tool selection in testing (R22–R24)

**R22/R23/R24 — deterministic tools for deterministic problems; LLMs only where semantics matter.** The LongX mapping:

| Task | Tool class |
|---|---|
| Flakiness prediction, suite prioritization/optimization (relevant from P2 when suites grow) | Deterministic/ML — never LLM |
| Syntactic selector repair | Deterministic |
| Generating test drafts from `LONGX.md`/stories; explaining a CI failure in natural language; semantic selector repair (label changed meaning); edge-case discovery from the PRD | LLM (drafts only, per R19/R29) |

Worth noting: **R24's golden rule is already LongX's own product philosophy** — the DQS is deterministic and the LLM only narrates (§8.4, LONGX.md UC-07). The same discipline applies to the QA toolchain: never pay LLM cost and variability for what a deterministic tool does reproducibly.

### 10.7 Self-healing — critical rule (R25–R26)

**R25 — No silent self-healing.** Any auto-repair (selector or semantic) produces a logged diff requiring human review before merge. **R26 — critical elements never auto-heal:** for LongX the protected list is explicit — the trade ticket's confirm control, the **Blocked/lockout banner**, the stop-adjustment control, the DQS hero on trade close, the withdraw-OFF verification messaging in onboarding. If any of these "disappears or changes significantly," that is a **product regression in the discipline surface** — the exact thing the E2E tier exists to catch — not a selector to patch. A healing bot that quietly adapts to a missing lockout banner would mask the worst possible regression in this product.

### 10.8 Test data generation (R27)

Two non-interchangeable problems, kept separate: **(a) synthetic fixture/mocks generation** — LongX's default and, pre-beta, its only need: factories (R9) plus AI-generated variations of price geometry, always locale-correct per R32. **(b) Production-data anonymization** — becomes relevant at closed beta (M4) if real trade histories are ever wanted for test scenarios; requires actual anonymization guarantees, not ad-hoc redaction, and remains subject to R14/R28 (never to external AI). Until that machinery exists, the policy is simpler: production data is not used in tests at all.

### 10.9 Responsible AI in testing (R28–R34), bound to LongX

- **R28 — No PII/sensitive payloads to external AI providers.** The R14 list applies to logs and captures too: CI traces and screenshots attached to AI-debugging prompts must come from synthetic-data runs, or be redacted first.
- **R29 — Human review of every AI-generated test before first merge, no exceptions** — even if green. Merges into the same PR-review gate as §8.7's test-file rule.
- **R30 — Deterministic generation parameters** (temperature at minimum) for any versioned test generation, reducing diff noise between regenerations.
- **R31 — Prompts are versioned next to the tests they generated** — a `tests/prompts/` directory, one file per generation prompt, referenced from the test file header. Auditability of the spec-to-test chain.
- **R32 — Domain, language, and locale explicit in every generation prompt.** LongX defaults, stated once and reused: *dominio: trading crypto disciplinado (futuros USDT-M); idiomas: ES primario / EN secundario; locale: es-AR (fechas DD/MM/YYYY, separadores locales)*. Without this, generated fixtures default to English/USD/US-dates — wrong for a Spanish-first LatAm product and a real source of subtle test bugs (date parsing, number formats).
- **R33 — Deterministic specialized tools for the categories LLMs are worse at**, with the LongX assignments: load/performance → k6/Locust against the worker (the reconnect-storm and per-IP rate-budget scenarios from the scaling analysis are load tests, not LLM work); security → SAST/dependency scanning in CI, and the key-handling paths get deterministic tests (fake KMS assertions), never LLM "security review" as the control; contract testing → schemathesis (or Pact) on the FE↔API OpenAPI contract and on outbox event schemas; property-based → `hypothesis`, already mandated in QA-01.7 for the engine.
- **R34 — The one-sentence test.** Any AI-generated test the reviewer cannot explain in one sentence (what it validates and why) is test theater — rejected. This is §8.7's Test Theater rule given its operational review criterion.

### 10.10 Blocking checklist (gates every PR/commit, alongside §8.9 and §9.6)

- [ ] R1–R4 (integration) — incremental, pinned-version environments, boundary+exception data, criteria-before-execution
- [ ] R5–R9 (E2E) — semantic selectors, independent scenarios, trace-on-retry, factories (no magic values)
- [ ] R10–R14 (AI in integration/E2E) — a11y-tree-based, 5x stabilization, POM two-step, **no production data to external AI**
- [ ] R15–R18 (Gherkin) — one When, domain language, Outlines for tables, no-solo-authorship honored per §10.4
- [ ] R19–R21 (AI-assisted BDD) — draft-not-spec, 7-anti-pattern review done, steps deduplicated
- [ ] R22–R24 (tool selection) — no LLM where a deterministic tool suffices
- [ ] R25–R26 (self-healing) — every healing diff reviewed; protected discipline-surface elements never auto-healed
- [ ] R27 (test data) — correct technique for the problem; no prod data in tests pre-anonymization-machinery
- [ ] R28–R34 (responsible AI) — no PII exposed, human review done, temperature pinned, prompts versioned, locale specified, specialized tools where mandated, one-sentence test passes

### 10.11 Governance: repo enforcement

Extends the `CLAUDE.md` blocks from §8.11 and §9.7:

```markdown
## Automated testing & AI-QA policy (§10)
- Integration: ephemeral containers with pinned prod-matching versions; real
  Postgres/Redis, doubles only at Binance/LLM/KMS boundaries.
- E2E: Playwright, getByRole/getByLabel only (never CSS/Tailwind/auto-IDs);
  each scenario self-contained via factories; trace on first retry.
- Any AI-generated test: 5 stable consecutive runs + human review before first
  merge; generation prompts versioned in tests/prompts/; temperature pinned.
- Gherkin: one When per scenario, LongX domain language, Scenario Outline for
  tabular cases; AI output is a draft until human-reviewed against the
  anti-pattern checklist.
- NEVER send production data, user emails, key material/metadata, real trade
  history, or unredacted traces to an external AI provider.
- Self-healing diffs always human-reviewed; the lockout banner, trade confirm,
  stop control, DQS hero and withdraw-OFF messaging never auto-heal.
- Generation prompts always specify: dominio trading crypto, ES/EN, locale es-AR.
- Load (k6), security (SAST), contract (schemathesis) and property (hypothesis)
  testing use deterministic specialized tools, never a generic LLM.
```
