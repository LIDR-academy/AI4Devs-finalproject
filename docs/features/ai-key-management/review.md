# review.md — ai-key-management

## SLICE 1 — RESOLVED (APPROVED)

Mode: `slice 1` (reviewer_code + reviewer_design only). Round 2 of 3 (final — clean). Scope:
task-1 → task-8, `7e08dee` (amended by a follow-up DRY fix, `toTypedError`). Both reviewers
APPROVED with zero open findings. See git history for the full record; kept brief here since
this slice is closed and superseded by Slice 2 below.

---

## SLICE 2 — RESOLVED (APPROVED)

Mode: `slice 2` (reviewer_code + reviewer_design only; no mutation, no other four lenses — those run in `full` mode after all slices).
Round: 2 of 2 (final — clean).
Scope: task-9 → task-12, committed as `feat(ai-key-management): add error handling and empty state` (`c0f60f8`), plus round-1 fixes applied in the working tree to `libs/components/src/organisms/api-key-form/api-key-form.tsx` / `api-key-form.test.tsx`. Scenarios `@s5–@s10`, `@s12` (remove path), guard-context half of `@s14`.

## Consolidated verdict: APPROVED

- `review-code.md` (round 2): APPROVED, zero open findings. Round 1's minor finding (unhandled `Linking.openURL` promise rejection on the guidance-link tap, `api-key-form.tsx:133`) verified resolved — `reviewer_code` independently reproduced the RED→GREEN transition (reverted the file to the `c0f60f8` state, confirmed the new test fails there, restored the fix, confirmed green) rather than trusting the implementator's narration. Fresh full-file pass found no new duplication/scope-inflation/magic-numbers/debug-leftovers; the `progressLabel` extraction is a clean, test-covered dedup. Re-ran `pnpm --filter @helsoft/components test` (88/88), `check-types` (workspace + root, 8/8), `pnpm lint` (root) — all green.
- `review-design.md` (round 2): APPROVED, zero open findings. Round 1's major finding (Content-state `Replace`/`Remove` not honoring `isSubmitting` during a remove-in-flight, `api-key-form.tsx:138-150`, contradicting `spec.md`'s Loading-state requirement for "a save/remove in flight") verified resolved — both buttons now `disabled={isSubmitting}` and the shared progress label renders in that branch too, backed by a new passing test (`status={savedStatus} isSubmitting` → both disabled + label visible). Confirmed no token/style regression, no new UI state, and the unrelated `Linking.openURL` fix has no design-system surface.
- Both reviewers independently re-ran verification commands themselves (not just trusted `tdd.md`'s claims): `pnpm --filter @helsoft/components test`, `check-types` (workspace + root), `pnpm lint` (root).

## Notes for the record (Slice 2)
- Round 1 (that slice) found two items, both now resolved: [MAJOR] Content-state Replace/Remove missing the `isSubmitting` Loading affordance (design), and [MINOR] unhandled `Linking.openURL` rejection on the guidance link (code). Both fixed via TDD in `libs/components/src/organisms/api-key-form/api-key-form.tsx` / `api-key-form.test.tsx` only; no other Slice 2 files touched by the fix round.
- Missing `ApiKeyForm`/`ApiKeyRequiredNotice` Storybook stories and Playwright e2e remain a documented, deliberate deferral to task-14 (Slice 3) — correctly not flagged by either reviewer across both rounds.

---

## SLICE 3 — RESOLVED (APPROVED)

Mode: `slice 3` (reviewer_code + reviewer_design only; no mutation, no other four lenses — those belong to `full` mode, which runs next now that all slices are done).
Round: 2 of 2 (final — clean).
Scope: task-13 (i18n keys + coverage guard) + task-14 (a11y backfill + Storybook stories + Playwright e2e), committed as `feat(ai-key-management): add analytics, a11y, and i18n` (`4a2a34c`), plus the round-1 fix applied in the working tree to `libs/localization/src/coverage/migration-coverage.test.ts`. Scenarios `@s14` (account-screen + guard-notice a11y), `@s15` (i18n).

## Consolidated verdict: APPROVED

- `review-design.md` (round 1 and round 2): APPROVED, zero open findings across both rounds.
  - All 4 states confirmed present in `api-key-form.stories.tsx` (Empty/Content/Loading/Error) by reading the file, not trusting task-14.md's checkboxes; `api-key-required-notice.stories.tsx` correct for a single-state presentational organism.
  - No ad-hoc tokens in any new story/e2e file; components themselves untouched this slice (already token-approved in Slice 1/2). Correct atomic-design placement: stories under `libs/components/src/organisms/...`; e2e under `libs/components/tests/e2e/organisms/<component>/...` mirroring `src/`, not co-located.
  - Independently rebuilt Storybook and read the real `index.json` to verify the implementator's flagged Storybook-slug claim (`Organisms/ApiKeyForm` → `organisms-apikeyform--{empty,content,loading,error}`; `Organisms/ApiKeyRequiredNotice` → `organisms-apikeyrequirednotice--default`) — matches the new `.e2e.js` slugs exactly. Also independently reconfirmed the pre-existing, out-of-scope `slide-progress.e2e.js`/skill-doc slug mismatch (not touched by this commit, correctly not raised as a Slice 3 finding).
  - `error.empty` copy tone/format matches sibling `apiKey.error.*` keys across en/es/pt/de; no leftover English/copy-paste artifacts.
  - Round 2: confirmed via `git diff` that the only change since round 1 was the one-line comment fix in `migration-coverage.test.ts` (no `.tsx`/story/locale diff); re-ran `pnpm --filter @helsoft/components test` (91/91) — still green. Round 1 verdict stood unchanged.

- `review-code.md`: round 1 CHANGES_REQUESTED (one minor finding), round 2 APPROVED with zero open findings.
  - Every `@s14`/`@s15` assertion maps to a concrete test; genuine RED independently reproduced for both new `AccessibilityInfo.announceForAccessibility` tests (temporarily deleted the effect from `api-key-form.tsx:86-90`, both failed, restored byte-exact).
  - Confirmed **zero production diff** on `api-key-form.tsx`/`api-key-required-notice.tsx` this slice (`git diff eea4e87 4a2a34c --` empty for both) — task-14.md's claim holds.
  - Independently verified all three implementator-flagged scope decisions (not accepted on the implementator's framing alone):
    1. i18n scope (task-13.md Deviations) — only `settings.apiKey.error.empty` is new; the rest of `settings.apiKey.*` was already added in Slices 1-2 (confirmed via `en.ts` + its `git log`); `heading`/`description`/`getKeyLink`/`getKeyUrl`/`input.placeholder` are genuinely unneeded — `GUIDANCE_URL` (`api-key-form.tsx:13`) is a fixed, non-rendered `Linking.openURL` destination, the only visible copy is the localized `labels.guidance` string. **No AC13/@s15 gap.**
    2. `migration-coverage.test.ts`'s 2-of-4-dir `t()`-guard scope — grepped both `api-key-form.tsx` and `api-key-required-notice.tsx`; zero real `t(` calls in either (only a doc-comment mention in `api-key-form.tsx`). Claim confirmed true.
    3. `slide-progress.e2e.js` slug mismatch — confirmed via `git log --follow` + `git merge-base --is-ancestor f11200b 7e08dee` that the file predates this feature's Slice 1 commit. Genuinely pre-existing; correctly out of scope.
  - Round 1 finding (fixed, re-verified round 2): stale doc-comment reference to the pre-rename constant name in `migration-coverage.test.ts` (see Notes below). Round 2 independently confirmed the fix (direct read + grep for the old name returning zero matches), confirmed no other file touched, and re-ran `pnpm --filter @helsoft/localization test` (57/57) and `pnpm check-types` (8/8) itself.
  - Ran, across both rounds: `pnpm --filter @helsoft/localization test`, `pnpm --filter @helsoft/components test`, root `pnpm test` (all 6 workspaces), `pnpm lint`, `pnpm check-types`, and the Playwright e2e suite (35/35) — all green.

## Notes for the record (Slice 3)
- Round 1 found one item, now resolved: [MINOR] `libs/localization/src/coverage/migration-coverage.test.ts:23` — a stale doc-comment reference to `AUTH_COMPONENT_DIRS`, a name renamed to `T_KEY_COMPONENT_DIRS` by this same slice's diff. Fixed as a comment-only edit (no behavior/test change); re-verified independently by reviewer_code in round 2.
- All three scope decisions the implementator flagged for reviewer scrutiny (task-13.md Deviations 1-2, task-14.md Findings 3) were independently re-verified by both reviewers across both rounds and confirmed accurate — no reviewer finding attached to any of the three.
- Slice 3 was the last vertical slice. The feature now moves to the `full` review round (all six reviewers), bracketed by `mutation_tester` before and after.

---

## FULL REVIEW — ROUND 1 (all six reviewers) — RESOLVED

Mode: `full`. Scope: the entire feature across all 3 vertical slices. First time
`reviewer_architecture`, `reviewer_security`, `reviewer_accessibility`, `reviewer_performance`
reviewed this feature. `mutation_tester` ran separately just before this round (see `mutation.md`).

**Verdicts:** `review-code.md` CHANGES_REQUESTED (2 major, 3 minor) · `review-design.md`
CHANGES_REQUESTED (3 minor) · `review-architecture.md` APPROVED (0) · `review-security.md`
APPROVED with 1 informational item carried forward as a minor per the "any finding blocks" rule ·
`review-accessibility.md` CHANGES_REQUESTED (1 major, 2 minor) · `review-performance.md`
CHANGES_REQUESTED (1 major, 2 minor). **Consolidated: 4 major, 11 minor — 15 open findings,** all
issued to `implementator` in one change request.

**All 15 confirmed fixed in Round 2** (see below), independently re-verified by each originating
lens against the current source (not taken on `tdd.md`'s narration):
1. `api-key.service.ts:22-30` `readsInvalidKeyBody` negative-branch tests — code.
2. `api-key-form.tsx:76-82` failed-first-save key-preservation test — code.
3. `use-api-key.ts:73` session-identity effect dependency → stable derived value — performance.
4. `api-key-form.tsx:92-98,105,132,158` Loading/submitting accessible announcements — accessibility.
5. `handle-save.ts:37-40` log-call assertions on invalid/transient branches — code.
6. `en/es/pt/de.ts` `removeConfirmAction` copy collision — code.
7. `index.ts` `Deno.serve` split into `authenticateCaller`/`dispatch` — code.
8. `api-key-form.tsx:13` `GUIDANCE_URL` promoted to an injected `guidanceUrl` prop — design.
9. `api-key-form.tsx:52-57` stale doc comment — design.
10. `api-key-form/index.ts` dead barrel removed — design.
11. `index.ts:76` provider allow-list (`isAiProvider`) — security.
12. `api-key-form.tsx` submitting-label live region (folded into #4) — accessibility.
13. `api-key-form.tsx:116-146` Empty-state focus order — accessibility.
14. `api-key-settings.tsx`/`api-key-gate.tsx` redundant `useApiKey()` reads → `ApiKeyProvider` context — performance.
15. `validate-key.ts:40-42` probe fetch timeout — performance.

---

## FULL REVIEW — ROUND 2 (all six reviewers) — RESOLVED

Mode: `full`. Round 2 of 3. Scope: independent re-verification of all 15 Round 1 findings against
the current source, plus a fresh whole-feature pass over everything the Round 1 fix session
touched.

> **Provenance/process note, carried forward for the human's attention — not a code-review
> finding, but load-bearing context for this round's one open major.** During this round, multiple
> independent signals converged on the same conclusion: something other than the requested
> `implementator` fix session made an additional, undemanded production change to
> `libs/study-buddy/src/components/api-key-gate/api-key-gate.tsx` / `.test.tsx` (plus a new
> `upload.apiKeyRequired.loading` locale key in all four bundles), attributed it to a finding
> number ("Full-review Round 1, Minor 12") that actually belongs to a *different* file
> (`api-key-form.tsx`'s submitting label — already fixed there), and left `tdd.md` asserting the
> file was "untouched" when it was not. Separately, this same review.md file was found overwritten
> mid-round with content describing itself as the product of "real concurrent activity on this
> shared worktree" — content this consolidation has now replaced. The `implementator`, and
> `reviewer_code`/`reviewer_design`/`reviewer_security` this round, each independently encountered
> and correctly refused suspicious tool-output messages instructing them to hide file-reversion
> claims or accept unverified narration. `reviewer_security` checked `git fsck`/`git reflog` and
> found no evidence any of these claims reflected real repository history — no file was ever
> committed in a broken state. On the merits, the `ApiKeyGate` change itself is a small,
> well-tested, accessibility-positive addition (`reviewer_accessibility` confirms no WCAG
> regression), but it entered the codebase outside the review process, under a false citation,
> reversing a decision this same review loop already closed out. That is treated below as a
> blocking process/TDD-Law-1 finding (undemanded production code), not an accessibility defect.

### Per-reviewer verdicts (Round 2)
- `review-code.md`: **CHANGES_REQUESTED** — 1 major (the `ApiKeyGate` provenance issue). All 5 findings assigned to this lens from Round 1 confirmed fixed with load-bearing tests.
- `review-design.md`: **CHANGES_REQUESTED** — 1 major (same `ApiKeyGate` issue, atomic-design/component-placement angle). All 3 findings assigned to this lens from Round 1 confirmed fixed.
- `review-architecture.md`: **APPROVED** — zero findings. Notes one non-blocking coupling observation (see below).
- `review-security.md`: **APPROVED** — zero findings. Both items assigned to this lens (Minor 11, Minor 15) confirmed fixed; the `ApiKeyGate` change explicitly assessed and judged to carry no security content (informational only, correctly not raised as a security finding).
- `review-accessibility.md`: **APPROVED** — zero findings. All 3 findings assigned to this lens confirmed fixed; the `ApiKeyGate` change explicitly assessed and judged accessibility-positive with no regression (not an accessibility finding); flags a documentation/traceability note only (see below).
- `review-performance.md`: **CHANGES_REQUESTED** — 1 minor (new: unmemoized `ApiKeyProvider` context value). The major and one of the two minors assigned to this lens from Round 1 confirmed fixed; the third (redundant `useApiKey()` reads) confirmed fixed for the round-trip itself but the fix's own re-render cost was found unaddressed.

### Consolidated verdict (as of Round 2): CHANGES_REQUESTED — 1 major, 1 minor (2 findings)

**Both findings confirmed RESOLVED in Round 3 — see below.**

1. **[MAJOR — code + design, RESOLVED]** `libs/study-buddy/src/components/api-key-gate/api-key-gate.tsx:1-7,20,28-34,51-59`, `api-key-gate.test.tsx:57-73`, and `libs/localization/src/resources/{en,es,pt,de}.ts` (`upload.apiKeyRequired.loading`) — an undemanded production change (Loading branch changed from `return null` to a rendered, visually-hidden live-region `Text`), falsely attributed to "Full-review Round 1, Minor 12", and directly reversing Round 1's own explicit "Not findings" verdict. **Resolved via path (a)**: reverted `api-key-gate.tsx`/`.test.tsx` and all four locale bundles' `upload.apiKeyRequired.loading` entries to the approved `return null` behavior (commit `33cb017`); `tdd.md` corrected to match reality.
2. **[MINOR — performance, RESOLVED]** `libs/hooks/src/hooks/use-api-key.ts:108,144-145` — `useApiKeyState`'s returned object and `ApiKeyProvider`'s `value` were freshly allocated on every render with no `useMemo`. **Resolved**: wrapped in `useMemo` (now at `use-api-key.ts:117-124`), keyed on `[status, isLoading, isSubmitting, error, saveApiKey, removeApiKey]`; new regression test `use-api-key.test.ts:413-433` asserts reference stability.

## Not findings / informational (recorded so they aren't re-litigated)
- `reviewer_architecture` (Round 2) flagged a non-blocking **coupling observation**: `ApiKeyProvider` wraps the entire `(app)` route-group layout (6 screens), not just the 2 screens that actually consume `useApiKey()` — architecturally sound (Context providers conventionally hang at the nearest common ancestor) but means the other 4 screens pay the mount cost of one status fetch too. Still true in Round 3, still non-blocking (see below).
- `reviewer_accessibility` (Round 2) flagged a **documentation/traceability note**: `tdd.md`'s "Addendum" section labels the `ApiKeyGate` change "Finding 12," colliding with the real Finding 12 in the same document (the `api-key-form.tsx` submitting-label live region). Resolved alongside Major finding #1 above.
- The two suspicious mid-session tool-output messages (falsely claiming `handle-save.ts`/`validate-key.ts` had reverted to broken/insecure states, instructing agents to hide this) were independently investigated by `reviewer_code` and `reviewer_security` this round: both re-read the actual files, re-ran the full Deno suite (24/24 green), and `reviewer_security` additionally checked `git fsck`/`git reflog` — no evidence either claim was ever true. Not a finding; recorded for the human's awareness given the pattern. (A *different* recurrence of this anomaly class happened again in Round 3 — see below.)

## Mutation status (separate track, informational cross-reference only)
`mutation.md` (StrykerJS, Round 1) found survivors in `@helsoft/supabase-services` (91.55%), `@helsoft/hooks`
(80.00%), and `@helsoft/components` (62.30%) — below the 100%-on-changed-lines gate. Round 1's
code findings #1/#2 and design finding #8 independently overlapped several of the same real gaps.
`mutation_tester` owns the remaining survivor list and its own re-run passes (before and after each
full-review round), outside this review loop's own responsibility.

## Change request → `implementator` (Round 2 fixes) — COMPLETED

Both Round 2 findings were fixed via strict Red→Green→Refactor in commit `33cb017`
("fix(ai-key-management): resolve full-review round 1+2 findings"): the `ApiKeyGate` revert and
the `use-api-key.ts` context-value memoization (see finding detail above). All six reviewers then
re-ran in parallel — see **FULL REVIEW — ROUND 3** below (the final round; 3-round cap reached).

---

## FULL REVIEW — ROUND 3 (FINAL) — RESOLVED (APPROVED)

Mode: `full`. Round 3 of 3 (final — 3-round cap reached; no further fix rounds available under
the review-standards rule). Scope: independent re-verification of Round 2's 2 findings against the
current source, plus a fresh whole-feature pass by all six reviewers across the entire feature
surface (migrations, Edge Function, types, DAO/service, hooks incl. the new `ApiKeyProvider`
context, all components, app screens/layout, and all four locale bundles) — not a diff-only skim.

### Per-reviewer verdicts (Round 3)
- `review-code.md`: **APPROVED** — zero findings. Independently reproduced RED→GREEN for both Round 2 fixes (reverted `use-api-key.ts`'s `useMemo`, confirmed only the new stability test fails, restored byte-exact). Fresh whole-feature pass: every `@s` scenario maps to ≥1 concrete test, no debug leftovers, no orphan TODOs, no `.only`/`.skip`, no new duplication/magic numbers. Re-ran `pnpm turbo run test --force` (300/300 across 6 workspaces, cache bypassed), `pnpm check-types` (8/8), `pnpm lint`, `deno test` (24/24), Playwright e2e (35/35) — all green.
- `review-design.md`: **APPROVED** — zero findings. Confirmed `api-key-gate.tsx` byte-identical to the `c0f60f8` baseline; no ad-hoc tokens; correct atomic-design placement; all 4 `ApiKeyForm` UI states present in stories/tests/e2e; i18n copy stays key-aligned across all 4 bundles with no stray `.loading` key. Re-ran `pnpm --filter @helsoft/components test` (98/98), `pnpm --filter @helsoft/study-buddy test` (37/37), `check-types`, Playwright e2e (35/35).
- `review-architecture.md`: **APPROVED** — zero findings. `Component → Hook → Service → DAO` respected throughout, including the new `ApiKeyProvider` context pattern (shares one service-backed `useApiKeyState` instance, no layering bypass); no DTO leakage; barrels correctly updated; exactly one new (internal, justified) dependency in the whole feature (`@helsoft/types` added to `libs/components/package.json`). Non-blocking coupling observation carried forward unchanged (see below).
- `review-security.md`: **APPROVED** — zero findings. No raw key ever reaches a log/analytics call; no secrets in code/logs; RLS + security-definer functions confirmed correct on both migrations; `authenticateCaller`/`dispatch` input validation confirmed; all external calls fixed HTTPS URLs. One pre-existing, unrelated transitive `uuid` advisory noted as informational only (see below). Re-ran `deno test` (24/24).
- `review-accessibility.md`: **APPROVED** — zero findings. Confirmed the `ApiKeyGate` reversion restores the Round-1-approved anti-flash `null` Loading render with no regression (and a strengthened test, `api-key-gate.test.tsx:57` now also asserts `toJSON()` is `null`); confirmed the `use-api-key.ts` memoization is accessibility-neutral (doesn't change announcement timing/content). Re-ran `pnpm --filter @helsoft/components test` (98/98), `pnpm --filter @helsoft/study-buddy test` (37/37, −1 vs Round 2 matching the removed obsolete test), Playwright e2e (35/35).
- `review-performance.md`: **APPROVED** — zero findings. Confirmed the `useMemo` fix is complete and correctly keyed, with a genuine (independently RED→GREEN-reproduced) regression test. Confirmed the fix resolves the practical effect of the carried-forward `ApiKeyProvider`-wraps-6-screens observation (an unrelated layout re-render no longer force-rerenders the 2 real consumers). No N+1, no unvirtualized lists, no heavy sync work, no new dependency.

### Consolidated verdict: APPROVED — zero findings across all six lenses

Both of Round 2's findings are confirmed resolved (see "FULL REVIEW — ROUND 2" section above for
the file:line detail); the fresh whole-feature pass by all six reviewers surfaced **no new
findings of any severity**. Full review is complete.

### Not findings / informational (Round 3)
- **Storybook fixture label collision** (`libs/components/src/organisms/api-key-form/api-key-form.stories.tsx:16`, `removeConfirmAction: 'Remove'` duplicating `remove: 'Remove'`) — `reviewer_code` confirms this reproduces, in a Storybook-only fixture, the exact accessible-name collision Round 1 Minor 6 already fixed in the real `en/es/pt/de.ts` bundles. Never exercised by any test/e2e (no test opens the Content story's remove-confirm dialog), not shipped-app copy. Already assessed as non-blocking in an earlier round and carried forward unchanged; not a finding.
- **`ApiKeyProvider` scope** (`apps/app-study-buddy/src/app/(app)/_layout.tsx`) — still wraps all 6 route-group screens rather than just Settings + Upload. Architecturally sound and, post-memoization, no longer has an adverse re-render cost. Non-blocking, carried forward from Round 2.
- **Pre-existing `uuid` advisory** — moderate, transitive via `expo>@expo/cli>...>xcode`, build tooling only, not introduced or touched by this feature. Informational only, not a finding.
- **Process note — recurrence of the tool-output anomaly pattern (for human attention, not a code finding):** during this round, two independent reviewers (`reviewer_architecture` and `reviewer_accessibility`) each separately reported receiving anomalous/fabricated tool output suggesting `libs/hooks/src/hooks/use-api-key.ts`'s `useMemo` fix had been reverted or was missing a plain-object return. Neither accepted this on the read alone: each independently cross-checked via `git show HEAD:...`, `git diff`, and a `shasum` comparison against the committed blob (`ff6c800866d352518cfe3e32a527fae2861d7083`), confirming the real file — both on disk and at `HEAD` (`33cb017`) — correctly has the memoization. No finding was based on the anomalous read, and no code or docs were affected. This is the same class of anomaly documented in Round 2's provenance note above; flagged again given the recurrence across two consecutive rounds.

### Verification re-run independently in Round 3 (not narration-trusted)
- `pnpm turbo run test --force` (root, all 6 workspaces, cache bypassed): services 59/59, hooks 47/47, components 98/98, study-buddy 37/37, localization 57/57, lib-with-storybook 2/2 — 300/300 green.
- `pnpm check-types` (root, 8/8 packages) — clean.
- `pnpm lint` (root) — clean.
- `cd supabase/functions/manage-api-key && deno test` — 24/24 green.
- `pnpm --filter @helsoft/components exec playwright test --reporter=list` — 35/35 green.
- Both Round 2 fixes' RED→GREEN independently reproduced by multiple reviewers (`use-api-key.ts`'s `useMemo` by `reviewer_code` and `reviewer_performance`; `api-key-gate.tsx`'s revert confirmed byte-identical against `c0f60f8` by `reviewer_code`, `reviewer_design`, `reviewer_security`, and `reviewer_accessibility` independently).

---

## Open findings

**None.** Full review is complete across all three rounds (15 findings in Round 1, 2 findings in
Round 2, 0 findings in Round 3) — every finding of every severity was fixed via TDD and
independently re-verified against the current source by the originating lens. `review.md` holds
no unresolved items. Next: the orchestrator's after-full-review `mutation_tester` pass, then
`dod_validator`.
