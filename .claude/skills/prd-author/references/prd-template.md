# PRD Template — Sport ITSM

> This is the canonical structure for `docs/product/PRD.md`. Fill every section. Keep prose terse and decision-ready. Use sports-domain primitives (matchdays, fixtures, byes, tie-breakers, cards, suspensions), not generic SaaS abstractions. All numeric targets are **hypotheses to validate**, not commitments — label them. Placeholders are written as `<…>`; remove any section only with a note saying why.

---

## 0. Document control

| Field | Value |
| --- | --- |
| Product | Sport ITSM |
| Document | Product Requirements Document (PRD) |
| Version | `<vX.Y>` |
| Status | Draft / In review / Approved |
| Owner | Product Owner |
| Last updated | `<YYYY-MM-DD>` |
| Related docs | [Strategic MVP Proposal](<../strategic/00.Sport%20One%20Click%20—%20Strategic%20MVP%20Proposal%20(EN).md>), `docs/standards/data-model.md`, `CLAUDE.md` |

**Change log**

| Version  | Date           | Author        | Change        |
| -------- | -------------- | ------------- | ------------- |
| `<v0.1>` | `<YYYY-MM-DD>` | Product Owner | Initial draft |

---

## 1. Product vision & positioning

- **One-liner:** `<one sentence: what it is, for whom, why it wins>`
- **Vision statement:** `<the world this product creates for organizers>`
- **Positioning statement:** _For `<target user>`, Sport ITSM is the `<category>` that `<core value>`, unlike `<alternatives>`, because `<differentiator>`._
- **Core differentiator:** automation-first competition OS; AI proposes and flags, never decides alone.

## 2. Problem & context

- **Job to be done:** _Run an entire competition season — registration to champion — without touching a spreadsheet or answering a scheduling question by hand._
- **Top pain points** (distilled from the strategic proposal §1):

| #   | Pain point                                  | Who suffers           | Addressed by (feature) |
| --- | ------------------------------------------- | --------------------- | ---------------------- |
| P1  | Manual fixture creation is the #1 time sink | Organizer             | `<F-…>`                |
| P2  | Venue/court/referee double-bookings         | Organizer, venue, ref | `<F-…>`                |
| …   | …                                           | …                     | …                      |

- **Market & alternatives:** LeagueRepublic, Playtomic, Torneopal, Sheets+WhatsApp — summarize where each falls short (see proposal §2.2).

## 3. Business objectives

- **Business model:** subscription SaaS, metered by competitions + teams; FREE / STARTER / PRO / ENTERPRISE.
- **Objectives / OKRs:**

| ID | Objective | Key result (hypothesis) | Tied to |
| --- | --- | --- | --- |
| BO-1 | `<e.g. Prove core value: eliminate manual fixtures>` | `<e.g. >80% of competitions use auto-fixture generator>` | Pillar A |
| BO-2 | `<e.g. Convert free organizers to paid>` | `<e.g. 8–12% free→paid within 90 days>` | Monetization |
| … | … | … | … |

- **Monetization tiers** (hypothesis — validate with early customers):

| Tier       | Competitions | Teams/comp | Key capabilities | Price model             |
| ---------- | ------------ | ---------- | ---------------- | ----------------------- |
| FREE       | 1            | ~10        | `<…>`            | €0, limit-based, no ads |
| STARTER    | ~5           | ~20        | `<…>`            | Low monthly             |
| PRO        | ~20          | ~40        | `<…>`            | Mid monthly             |
| ENTERPRISE | Unlimited    | Unlimited  | `<…>`            | Annual contract         |

> **Current tiers reflect the enforced license limits** in `CLAUDE.md` (FREE 10/1/1, STARTER 30/3/5, PRO 100/10/20, ENTERPRISE -1) — the source of truth for what the product does today. If the strategic proposal's hypothesis differs (e.g. FREE = 1 competition), do **not** document the hypothesis as current: describe the enforced limits here, and capture the proposed change as a future release in §10.3 with a target version (e.g. v2.0).

## 4. Personas

One per user type (from the roles & permissions matrix, proposal §6.1). For each:

### PER-`<N>` — `<name / role>`

- **Role in platform:** `<Organization Owner / Competition Organizer / Co-Organizer / Referee / Team Delegate / Player / Spectator>`
- **Goals:** `<what success looks like for them>`
- **Pains today:** `<current friction>`
- **Current alternatives:** `<Excel, WhatsApp, …>`
- **Key permissions / scope:** `<what they can and cannot do>`
- **Job to be done:** _When `<situation>`, I want to `<motivation>`, so I can `<outcome>`._

## 5. Scope

### 5.1 In scope — MVP

The six core features (proposal §4). Reference each by ID:

| ID  | Feature                                       | Summary | Primary persona   |
| --- | --------------------------------------------- | ------- | ----------------- |
| F-1 | Competition Builder + Reusable Rule Templates | `<…>`   | Organizer         |
| F-2 | Constraint-Based Fixture / Schedule Generator | `<…>`   | Organizer         |
| F-3 | Result Capture & Validation Workflow          | `<…>`   | Delegate, Referee |
| F-4 | Automated Standings & Rules Engine            | `<…>`   | Organizer, Teams  |
| F-5 | Communication & Notification Center           | `<…>`   | All roles         |
| F-6 | Team Delegate & Player Self-Service Portal    | `<…>`   | Delegate, Player  |

### 5.2 Post-MVP (deferred, intentional)

`<native mobile app, WhatsApp/SMS channels, live court-side entry, travel-distance optimization, referee auto-assignment, advanced analytics, federation license import, …>`

### 5.3 Out of scope

`<explicitly excluded: streaming, betting/odds, scoreboard hardware, …>`

## 6. Feature specifications

For each MVP feature `F-n`:

### F-`<n>` — `<name>`

- **Problem:** `<the pain it kills>`
- **Primary workflow:** `<step → step → step, one click where possible>`
- **Key requirements:** `<bullet list — link to FR IDs in §7>`
- **Edge cases:** `<odd team count → bye; team withdraws mid-season; disputed result; venue unavailable → cascade reschedule; …>`
- **AI touchpoints (if any):** `<proposal + human control gate + audit>` (proposal §5)
- **License gating:** `<which tier; new LicenseFeature? limit counter?>`
- **MVP boundary:** `<what's in vs deferred to post-MVP>`
- **Acceptance criteria (high level):**
  - [ ] `<verifiable criterion>`

## 7. Functional requirements

Traceable and testable. Group by feature area. Priority = MoSCoW (M/S/C/W). Status = Active / Deprecated (IDs are never reused or renumbered; dropped requirements are marked Deprecated with the version they left in).

| ID | Requirement | Feature | Persona | Priority | Traces to | Status | License |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FR-01 | The organizer can create a competition by selecting sport → format → rules → teams → publish | F-1 | Organizer | M | P1 / BO-1 | Active | FREE |
| FR-02 | The system generates a full-season round-robin fixture respecting venue/court/referee/team availability with no double-booking | F-2 | Organizer | M | P1, P2 | Active | STARTER+ |
| … | … | … | … | … | … | … | … |

### 7.1 Traceability matrix

Chain: **Pain point → Business Objective → Feature → Functional Requirement**. Validation rules (any failure → §13 Open questions): every FR links to ≥1 Feature and ≥1 BO/Pain; every Must FR links to ≥1 BO/top pain; every BO has ≥1 FR (else unfunded); every top pain maps to ≥1 Feature (else unaddressed).

| Pain point | Business objective | Feature  | Functional requirement(s) | Status                              |
| ---------- | ------------------ | -------- | ------------------------- | ----------------------------------- |
| P1         | BO-1               | F-1, F-2 | FR-01, FR-02              | ✅ covered                          |
| P2         | BO-1               | F-2      | FR-02                     | ✅ covered                          |
| `<P#>`     | `<BO-#>`           | `<F-#>`  | `<FR-…>`                  | `<✅ / ⚠️ orphan / ⚠️ unaddressed>` |

## 8. Non-functional requirements

| ID | Category | Requirement | Priority |
| --- | --- | --- | --- |
| NFR-01 | Security & privacy | GDPR + Spanish LOPDGDD compliance; minor-data minimization for youth categories; auditable exceptions | M |
| NFR-02 | Internationalization | Spain-first defaults (Spanish-native UI, Europe/Madrid, Spanish holidays, IVA/NIF-CIF); i18n-ready for later locales | M |
| NFR-03 | Performance | Fixture generation returns a valid schedule in `<target>`; standings recompute on result confirmation in `<target>` | S |
| NFR-04 | Availability | `<uptime target>`; public competition page is the single source of truth | S |
| NFR-05 | Accessibility | Responsive mobile-first PWA; `<WCAG target>` | S |
| NFR-06 | Auditability | Every override (result unlock, ineligible-player allow, AI auto-apply) logged with who/when/why | M |
| NFR-07 | Payments | Polar (Merchant of Record) for platform billing — VAT/invoicing delegated; SEPA/Bizum coverage to validate | S |
| … | … | … | … |

## 9. Success metrics

- **North-star:** organizer minutes per matchday. Baseline (Excel+WhatsApp hypothesis) ~90–120 min → target `<15 min` (hypothesis).
- **Funnel KPIs** (all hypotheses — proposal §7):

| Funnel         | Metric                                      | Target (hypothesis) |
| -------------- | ------------------------------------------- | ------------------- |
| Activation     | Time-to-first-competition                   | < 15 min            |
| Activation     | % orgs publishing a fixture within 24h      | > 60%               |
| Activation     | % competitions using auto-fixture generator | > 80%               |
| Engagement     | Result-submission latency (median)          | < 2h                |
| Collaboration  | Team-delegate activation rate               | > 85%               |
| Retention      | Season renewal rate                         | > 70%               |
| Monetization   | Free→paid within 90 days                    | 8–12%               |
| Product health | Fixture generation success rate             | > 95%               |
| Product health | AI proposal acceptance rate                 | > 60%               |

## 10. Prioritization & roadmap

### 10.1 MoSCoW summary

| Priority    | Items                   |
| ----------- | ----------------------- |
| Must        | `<F-1..F-6 core; FR-…>` |
| Should      | `<…>`                   |
| Could       | `<…>`                   |
| Won't (now) | `<post-MVP list>`       |

### 10.2 RICE (to break ties within a MoSCoW bucket)

Scales: **Reach** = orgs affected/quarter · **Impact** = {3 massive, 2 high, 1 medium, 0.5 low, 0.25 minimal} · **Confidence** = % · **Effort** = person-weeks. Score = R × I × C ÷ E.

> ⚠️ **Reliability:** when these are AI-estimated, mark Confidence **low** and read the ranking as _relative guidance, not a precise number_. Validate Reach and Effort with real data / human judgment before letting RICE drive a cut decision.

| Item    | Reach | Impact | Confidence           | Effort | RICE score | Basis                          |
| ------- | ----- | ------ | -------------------- | ------ | ---------- | ------------------------------ |
| `<F-…>` | `<…>` | `<…>`  | `<low / med / high>` | `<…>`  | `<…>`      | `<AI-estimate / data / human>` |

### 10.3 Release phases

Anything not implemented today lives here with a **target version** — that is where richer tier limits, deferred features and new ideas go, rather than the current-state sections.

| Phase | Target version | Goal | Contents | Exit criteria |
| --- | --- | --- | --- | --- |
| MVP | v1.0 | Prove core value (kill manual fixtures) | F-1..F-6 (MVP boundary) | `<north-star + activation targets met on pilot>` |
| Fast-follow | v1.x | `<…>` | `<WhatsApp, payments, live entry>` | `<…>` |
| Scale | v2.0+ | `<…>` | `<multi-org, white-label, richer tier limits, …>` | `<…>` |

## 11. Assumptions, dependencies, constraints

- **Assumptions:** `<pricing hypotheses, adoption assumptions, Spain-first bet>`
- **Dependencies:** `<Polar (MoR) for platform billing, WhatsApp Business API, existing license system, data model>`
- **Constraints:** `<DDD architecture, Nx monorepo, enforced license limits, tech stack (Angular 20 / NestJS 11 / PostgreSQL 16)>`

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| `<e.g. Fixture solver can't satisfy tight constraint sets>` | `<…>` | `<…>` | `<AI best-effort proposal + explanation + manual override>` |
| … | … | … | … |

## 13. Open questions

- [ ] `<decision the user/stakeholders must resolve>`
- [ ] Reconcile marketing tier hypothesis (§3) with enforced code limits.
- [ ] `<…>`
