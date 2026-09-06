---
name: prd-author
description: >
  Author and maintain the Product Requirements Document (PRD) for Sport ITSM as a living document, plus the foundational product-analysis artifacts around it (personas, roadmap). Use whenever the user asks to create, draft, revise or expand the PRD, define the product vision / business objectives / MVP scope / success metrics / prioritization, or turn the strategic proposal into a decision-ready PRD. Owned by the sport-product-owner agent.
---

# prd-author

Turn the strategic proposal into a **decision-ready, living PRD** for Sport ITSM: one document that states the product vision, business objectives, personas, scope (MVP vs post-MVP), functional & non-functional requirements, success metrics, and prioritization — every claim traceable to its source and to a business objective.

## Competencies

- Product vision & positioning synthesis
- Stakeholder discovery — surfacing and closing the gaps the strategic proposal leaves open
- Business-objective / OKR definition
- Persona extraction and role modeling
- Requirements discovery (functional & non-functional), traceable and testable
- Requirement traceability (pain point → objective → feature → requirement)
- MVP scoping and prioritization (MoSCoW + RICE)
- Success-metric / north-star definition

## Boundary with the `epic-mapper` skill

`prd-author` **authors** the PRD; the sibling `epic-mapper` skill **reads** it to build the epic map for the backlog pipeline. The boundary is strict in one direction:

- `prd-author` emits personas, features and requirements with **stable IDs** (`PER-1…`, `F-1…`, `FR-01…`, `NFR-01…`) and their **as-built build state** (🟢 Built · 🟡 Partial · 🔴 Not built · ⚫ Broken · 🔍 Unverified).
- `epic-mapper` **only ever reads** those IDs and states. It never renumbers them and never mints new `F-` IDs — where a requirement group has no feature ID, it assigns a short mnemonic key that lives in the epic map, not in the PRD.
- Keeping the build state accurate is therefore **this skill's job**: the whole backlog downstream is filtered and shaped by it.

## Constraints

- **Primary source is `docs/strategic/00.Sport ITSM — Strategic MVP Proposal (EN).md`.** Distill and structure it; never contradict it. Where you add something not in the proposal, mark it as an assumption to validate. **Fallback:** if that document is missing or too thin to derive vision/scope, do not invent silently — run a from-scratch vision interview with the user (see `ClarifyGaps()`) and record every answer as a decision or assumption.
- **The PRD's current-state MUST match what's implemented.** Where the strategic proposal diverges from the code (domain model in `docs/standards/data-model.md`, enforced license limits in `CLAUDE.md`), **the implementation is the source of truth** for describing what the product does _today_. Never document the marketing hypothesis as if it were live.
- **Not-yet-built functionality still belongs in the PRD — as a future release.** Ideas from the proposal (or the user) that aren't implemented are captured and **tagged with a target version** (e.g. v2.0), in Scope §5.2 / Roadmap §10.3 — never mixed into current-state descriptions. Flag anything that would need a new entity, migration, or `LicenseFeature`.
- Every requirement, persona, objective and pain point gets a **stable ID** and, for requirements, a **priority**. Once assigned, an ID is never reused or renumbered — see "Living document".
- Every "Must" requirement traces to a business objective or a top pain point. No orphan requirements (see "Traceability").
- Numeric targets are **hypotheses to validate**, never commitments — label them so.
- Write in **English** (documentation-standards §1). Offer a Spanish version on request.
- **Output:** a single `docs/product/prd.md` by default. Split into `docs/product/personas.md` / `docs/product/roadmap.md` only if the user asks; if you split, the PRD links to them instead of duplicating.
- **Do not write the PRD until the user explicitly approves scope.** This skill defines the process and template; it does not auto-generate.

## Process

Run as a gated workflow. Log progress; stop at each gate for user approval before continuing.

```sudolang
PRDAuthorProcess {
  State {
    Mode: "create"       // "create" | "revise" — set by DetectMode()
    Existing: null        // parsed current PRD when revising
    Sources: []           // strategic proposal, CLAUDE.md, data-model, license model
    OpenGaps: []          // questions raised in ClarifyGaps, with answers/assumptions
    Vision: ""
    BusinessObjectives: []          // BO-XX
    PainPoints: []                  // P1… (from strategic proposal §1)
    Personas: []                    // PER-1… one per user type
    Scope: { mvp: [], postMvp: [], outOfScope: [] }
    FunctionalRequirements: []      // FR-XX: { id, text, feature, persona, priority, tracesTo, status }
    NonFunctionalRequirements: []   // NFR-XX
    TraceabilityMatrix: []
    SuccessMetrics: []
    Prioritization: []              // MoSCoW + RICE
    OutputLanguage: "English"
    ApprovalStatus: "pending"
  }

  DetectMode() {
    if (fileExists("docs/product/prd.md")) {
      Mode = "revise"
      Existing = readAndParse("docs/product/prd.md")   // version, change log, all IDs
      log("Existing PRD found (" + Existing.version + ") — entering revision mode; IDs will be preserved.")
    } else {
      Mode = "create"
    }
  }

  GatherSources() {
    log("Reading strategic proposal, CLAUDE.md, data-model, license model...")
    Sources = readMandatorySources()
    if (Sources.strategicProposal == null) log("⚠️ Strategic proposal absent — will interview from scratch.")
  }

  ClarifyGaps() {
    // Ask ONLY what the sources do not already answer. Batch the questions.
    OpenGaps = askTargetedQuestions(gapChecklist(Sources))
    // Every answer becomes a Decision; every unknown becomes an Assumption to validate.
    confirmScopeAndLanguage()
    gate("Confirm the resolved gaps, scope and output language?")
  }

  DeriveVisionAndObjectives() {
    Vision = synthesizeVision(Sources, OpenGaps)          // one-liner + positioning statement
    PainPoints = extractPainPoints(Sources)               // P-XX
    BusinessObjectives = deriveObjectives(Sources)        // BO-XX + business model + tiers
    reconcileTiersWithCode(BusinessObjectives)            // current tiers = enforced license limits (source of truth); richer proposal tiering → roadmap as a future version
    gate("Approve vision, pain points & business objectives?")
  }

  ExtractPersonas() {
    Personas = extractPersonas(Sources)                   // from the roles & permissions matrix; one per user type; assign PER-# IDs
    gate("Approve personas?")
  }

  DefineScopeAndRequirements() {
    Scope = splitMvpVsPostMvp(Sources)                    // 6 core MVP features; each deferred item states WHY
    FunctionalRequirements = deriveFunctionalReqs(Scope)  // FR-XX, traceable, testable, status=Active
    NonFunctionalRequirements = deriveNonFunctionalReqs() // NFR-XX (perf, security, i18n, a11y, availability)
    TraceabilityMatrix = buildTraceability(PainPoints, BusinessObjectives, Scope, FunctionalRequirements)
    validateTraceability(TraceabilityMatrix)              // orphans / unfunded objectives / unaddressed pains → OpenGaps
    gate("Approve scope, requirements & traceability?")
  }

  DefineMetricsAndPriorities() {
    SuccessMetrics = deriveMetrics(Sources)               // north-star + funnel KPIs (hypotheses)
    Prioritization = prioritize(FunctionalRequirements)   // MoSCoW; RICE (AI-estimated, low-confidence) to break ties
    gate("Approve metrics & prioritization?")
  }

  Assemble() {
    if (Mode == "revise") {
      bumpVersionAndChangeLog(Existing)   // preserve IDs; deprecate (don't delete); append change-log row w/ today's date
    }
    prd = renderTemplate("references/prd-template.md", State)
    checkDefinitionOfReady(prd)
    // On explicit approval only:
    prd |> writeFile("docs/product/prd.md")
    log("PRD " + (Mode == "revise" ? "updated" : "written") + " at docs/product/prd.md")
  }

  execute() {
    DetectMode()
    GatherSources()
    ClarifyGaps()
    DeriveVisionAndObjectives()
    ExtractPersonas()
    DefineScopeAndRequirements()
    DefineMetricsAndPriorities()
    Assemble()
  }
}

execute()
```

## ClarifyGaps — discovery questions

Before drafting, resolve the decisions the strategic proposal leaves open. **Ask only the ones the sources don't already answer**, batched into one round. Record each answer as a **Decision** (reflected directly in the section it affects — scope, tiers, personas…) and each unknown as an **Assumption to validate** (§11) or an **Open question** (§13).

Typical gaps for Sport ITSM:

- **MVP sports** — the proposal names football, futsal, padel, basketball. Which are truly in v1, and which is the _lead_ sport?
- **Pricing & limits** — are the tier prices/limits confirmed, or still hypotheses? (Feeds the tier↔code reconciliation.)
- **Primary persona / segment** — which organizer type do we optimize for first?
- **Launch target** — is there a date, a pilot cohort, or a hard deadline?
- **Payments in MVP** — platform billing goes through Polar (Merchant of Record), the direction already recorded as FR-70. Open: which payment methods (card / SEPA / Bizum) Polar actually covers, and whether the separate participant split-payment rail (FR-66) is MVP or deferred. Do not reintroduce Stripe as the platform provider — it is dead scaffolding; it survives in the PRD only as a _candidate_ for the split-payment rail.
- **Channels in MVP** — in-app + email confirmed; are WhatsApp / SMS deferred to PRO/post-MVP?
- **Hard constraints** — compliance deadlines, existing customers/commitments, integrations.

## Living document

The PRD is maintained over time, not written once.

- **Detect** an existing `docs/product/prd.md` and enter **revision mode**.
- **Stable IDs:** never renumber or reuse `P` (pain points), `BO-`, `PER-` (personas), `FR-`, `NFR-` IDs. New items get the next free number.
- **Deprecate, don't delete:** a requirement that's dropped is marked `Status: Deprecated` with the version it was removed in — history and traceability stay intact.
- **Version bump:** patch for wording/fixes, minor for added requirements, major for scope/objective changes. Update the Document Control version and append a **change-log row** with today's date (from session context), author, and a one-line summary.
- **Diff-friendly:** keep section and table order stable so revisions produce clean diffs.

## Traceability

Maintain an explicit chain: **Pain point (P-) → Business Objective (BO-) → Feature (F-) → Functional Requirement (FR-)**. Non-functional requirements (NFR-) trace to a quality attribute or a constraint.

Render it as the **Traceability matrix** section of the PRD, and validate these rules — any failure becomes an entry in §13 Open questions:

- Every FR links to ≥1 Feature **and** ≥1 Business Objective or Pain point.
- Every **Must** FR links to ≥1 Business Objective or top pain point (no "Must" floats free).
- Every Business Objective has ≥1 FR (else the objective is **unfunded**).
- Every top pain point maps to ≥1 Feature (else it's **unaddressed**).

> Ask the user before resolving a detected orphan/unfunded/unaddressed item — it usually signals a real scope decision, not a formatting fix.

## Prioritization

- **MoSCoW** (Must / Should / Could / Won't-now) is the primary lens; every item gets a bucket.
- **RICE** breaks ties _within_ a bucket when a cut line is contested. Scales: **Reach** = orgs affected per quarter; **Impact** = {3 massive, 2 high, 1 medium, 0.5 low, 0.25 minimal}; **Confidence** = % (evidence-based); **Effort** = person-weeks. Score = R × I × C ÷ E.
- **RICE reliability caveat:** when scores are AI-estimated, set **Confidence low** and treat the ranking as _relative guidance, not a precise number_. Reach and Effort in particular must be validated with real data or human judgment before they drive a cut decision.

## PRD template

The full section-by-section PRD structure lives in [`references/prd-template.md`](references/prd-template.md). Follow it exactly for `docs/product/prd.md`. It covers: document control (version + change log) · vision & positioning · problem & context · business objectives · personas · scope (MVP / post-MVP / out-of-scope) · feature specifications · functional requirements · non-functional requirements · traceability matrix · success metrics · prioritization & roadmap · assumptions, dependencies, risks · open questions.

## Anti-patterns (avoid)

- **Untraceable requirements** — an FR that maps to no objective or pain point. Cut it or find its reason.
- **Numbers as commitments** — every target is a labeled hypothesis, never a promise.
- **Copying the strategic proposal verbatim** — distill and structure; the PRD is decision-ready, not a re-paste.
- **Solution design inside requirements** — a requirement states _what_ and _why_, not _how_ (no schema, endpoints, or component choices).
- **Persona sprawl** — one persona per user type; merge overlaps.
- **Silent invention** — when the source doesn't say, ask (ClarifyGaps) or mark an assumption; don't guess into the doc.
- **Hypothesis documented as reality** — current-state must match the implementation; unbuilt ideas (incl. richer tier limits) are future releases with a target version, never described as if they already ship.
- **Renumbering IDs on revision** — breaks traceability and history.

## Definition of Ready (exit gate)

The PRD is ready to hand off only when all of these hold:

- [ ] Vision one-liner + positioning statement present and consistent with the strategic proposal.
- [ ] Every business objective is measurable and tied to the business model / tiers; the documented **current** tiers match the enforced license limits, and any richer tiering from the proposal is captured as a **future release** (target version), not as current behavior.
- [ ] One persona per user type; each with goals, pains, JTBD.
- [ ] MVP scope = the strategic proposal's core features; every deferred item states why it's deferred.
- [ ] Every functional requirement has an FR-ID, a status, a priority, and a trace to an objective or pain point; the traceability matrix passes its rules (or exceptions are logged as open questions).
- [ ] Non-functional requirements cover security (GDPR/LOPDGDD), i18n (Spain-first), performance, availability, accessibility.
- [ ] North-star metric stated (organizer minutes per matchday) + funnel KPIs, all labeled as hypotheses.
- [ ] Prioritization uses MoSCoW; RICE applied (with confidence noted) where a cut line is contested; release phases defined.
- [ ] License impact called out (tier gating, new LicenseFeature, limit counters) wherever relevant.
- [ ] Assumptions, dependencies, risks and open questions sections filled; ClarifyGaps answers recorded.
- [ ] Document Control version + change-log row current (revision mode); written in English; links resolve; tables aligned; headings nested per documentation-standards §4.
