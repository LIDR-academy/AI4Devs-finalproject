# Review standards — the 6 reviewer rubrics

The reviewers run **in parallel**, each an independent lens. Each writes `APPROVED` or `CHANGES_REQUESTED` to its own `docs/features/<name>/review-<type>.md` with concrete `file:line` findings and a severity (blocker / major / minor). Reviewers **never edit code**. `reviews_lead` consolidates into `review.md`.

**Cadence — two review passes:**
- **Per slice (during the build):** only **`reviewer_code` + `reviewer_design`** run, scoped to that slice's changes (a fast quality/design gate before the slice closes). No mutation, no minors-accept — every finding is fixed before the next slice.
- **After all slices (full review):** **all six** reviewers run, coupled with mutation, under the 2-round cap + documented-minors rule.

General hard rules for every reviewer:
- Never approve with failing `pnpm lint`, `pnpm check-types`, `pnpm test`, or relevant `test:e2e`.
- Be specific: cite `file:line`. No generic feedback.
- Judge against the approved `gherkin-scenarios.md`, `spec.md`, and the project rules in `.agents/rules/`.

---

## 0. spec_reviewer → `review-spec.md` (pre-gate, before human approval)
Runs once after `spec_partner` drafts the bundle and **before** the human gate, so the human reviews a spec/contract that's already coherent. Reviews **documents, not code**; loops findings back to `spec_partner` (not `implementator`); any finding blocks (including minor).
- **spec.md** — every AC is a testable Given/When/Then; 4 UI states (if UI); analytics named; feature flags if rollout; non-goals present; decisions carry rationale; scope matches the story (nothing missing, no gold-plating); no ambiguity/contradiction.
- **risks.md** — real risks, each with a concrete mitigation; dependencies have a status.
- **tasks.md + task-N.md** — atomic tasks that collectively cover every AC/scenario; correct slice grouping; each `paths` a valid `libs/*` location obeying the layering + atomic-design rules; `scenarios` reference real `@s` tags.
- **gherkin-scenarios.md** — one `@s` per behavior; happy + error/empty/edge; **every AC ↔ ≥ 1 scenario**; declarative steps; unique tags.
- **Traceability** — story → ACs → `@s` → tasks mutually consistent; nothing orphaned.

---

## 1. reviewer_code → `review-code.md`
Quality, consistency, best practices, TDD discipline, scenario coverage.
- Every `@s` in the `gherkin-scenarios.md` maps to ≥ 1 concrete test (check `tdd.md`).
- Evidence of Red→Green→Refactor; **no production code that no test demands** (scope not inflated).
- Short functions, one reason to change, revealing names, no duplication, no magic numbers.
- Correct error contract; no `console.log` / debug leftovers; no TODOs without an issue.
- Functional React only; `Props` type present; kebab-case filenames.

## 2. reviewer_design → `review-design.md`
Design-system adherence (`.agents/rules/atomic-design.mdc`).
- Uses existing **tokens** and existing components; no ad-hoc colors/spacing/typography.
- Correct atomic-design placement (atom/molecule/organism/template/page).
- All 4 UI states represented; `<name>.stories.tsx` exists and covers them.
- Matches the screenshot (if provided) or the spec; consistent with sibling components.

## 3. reviewer_architecture → `review-architecture.md`
Layering & dependencies (`.agents/rules/hooks-service-dao.mdc`, `global.mdc`).
- `Component → Hook → Service → DAO` respected; no cross-layer imports (component never calls a DAO; service has no React).
- DTOs not leaked out of the data/DAO layer; hooks wrap services, not DAOs.
- Business logic lives in `libs/*`, not in `apps/*`; barrels (`index.ts`) updated.
- No new dependencies without justification; feature lib pairs with its app.

## 4. reviewer_security → `review-security.md`
OWASP (Top 10 + mobile-relevant MASVS).
- No secrets/keys/tokens in code, logs, or committed files; secrets read from env.
- Inputs validated at the service layer; no injection via unchecked params.
- No PII in logs or analytics payloads.
- Supabase: RLS assumed on, auth/session handled correctly, least-privilege queries; external calls over TLS.
- No unsafe deep links / webviews; dependencies free of known-critical advisories.

## 5. reviewer_accessibility → `review-accessibility.md`
WCAG 2.2 AA.
- Accessibility roles/labels on interactive and informative elements.
- Color contrast ≥ 4.5:1 (normal text); touch targets ≥ 44pt / 48dp.
- Sensible focus/reading order; dynamic type / scaled fonts supported; no color-only signaling.
- State changes (loading/error) announced to assistive tech.

## 6. reviewer_performance → `review-performance.md`
Runtime and delivery cost.
- Unnecessary re-renders avoided (stable keys, `memo`/`useMemo`/`useCallback` where they pay off, no new object/array literals in hot props).
- Long lists virtualized (`FlatList`/`FlashList`), not `.map` over large arrays.
- No N+1 or redundant Supabase/network round-trips; requests batched/cached (tanstack-query where applicable).
- Bundle/asset weight reasonable; no heavy synchronous work on the main thread; images sized appropriately.

---

## reviews_lead consolidation
1. Read all six reports; de-duplicate overlapping findings; resolve conflicts.
2. Prioritize blocker → major → minor into one ordered change-request list in `review.md`.
3. **Any finding blocks — blocker, major, OR minor.** Only `APPROVED` when there are **zero** findings of any severity; otherwise issue **one** consolidated change request to `implementator`, which fixes **every** item. There is no "approve with minor findings left open."
4. After fixes, re-run **all six** reviewers in parallel and re-consolidate, **pruning `review.md` to only the findings still open** (drop each resolved one). The orchestrator re-runs **mutation** alongside every round — review + mutation are one quality loop.
5. **Cap: 2 rounds.** After the 2nd round: any remaining **blocker/major** (or unmet mutation threshold) is **hard** — escalate and block. If **only minors** remain, they may ship as **documented, human-accepted** risks (recorded in `review.md`, `spec.md` Open decisions, `dod.md`). Either way `review.md` holds **only the unresolved findings**.
