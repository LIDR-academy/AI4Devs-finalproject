# Consolidated review — localization-i18n

- **Feature:** localization-i18n
- **Review round:** 3 (final — 3-round cap reached)
- **Branch:** `feature-entrega2-HernanLaura`
- **Contract judged against:** `gherkin-scenarios.md` (@s1–@s15), `spec.md`, `tdd.md`, `.agents/rules/*`

## ✅ RESOLUTION (Human gate, 2026-07-10): risk ACCEPTED → APPROVED

The human chose **path 1**: accept the risk and sign off on FO2 (recorded in `spec.md` → Open decisions and the FO2 follow-on entry, 2026-07-10), mirroring FO1's 2026-07-09 acceptance. Per `reviewer_accessibility`'s own stated condition (quoted below), this sign-off alone flips their verdict to **APPROVED** with no code change. **All six reviewers are therefore APPROVED; the feature is confirmed `pr_ready`.** No fourth round runs. Closing the gap (both `LanguageSelector` and the sibling `RadioGroup`) is deferred to a separate design-system follow-up.

_Original escalation preserved below for the record._

## Verdict (as escalated): ESCALATE → human decision required

This is the **third and final review round** under the 3-round cap
(`.agents/rules/review-standards.md`). Five of six reviewers returned **APPROVED**. One reviewer —
`reviewer_accessibility` — returned **CHANGES_REQUESTED** for the second consecutive round, on the same
finding. Per the cap rule, `reviews_lead` stops here and escalates to the human rather than looping a
fourth time.

**This is not a request for more engineering.** All six reviewers this round — including
`reviewer_accessibility` itself — agree the implementator's investigation was rigorous, the technical
conclusion is correct, and no unshipped-but-available fix exists. The disagreement is narrower and more
important than that: **whether a human needs to explicitly accept a known, documented, Level-A
accessibility gap before this feature can be called APPROVED — the same kind of sign-off that was already
given for `TODO(FO1)`.** `reviewer_accessibility` says yes; that sign-off has not yet happened for this
gap (tracked as **FO2**). Below is exactly what's needed to close this out either way.

### What the human needs to decide
**Read `spec.md`'s Follow-on FO2** (search for "FO2") and **`tdd.md`'s "Phase 6"** section (search for
"Phase 6") for the full investigation, then choose one:

1. **Accept the risk and sign off on FO2**, the same way FO1 was signed off (`spec.md` Open decisions:
   *"Human gate (2026-07-09): APPROVED as-is"*) — record an equivalent line for FO2. If you do this,
   `reviewer_accessibility`'s own report states this alone flips their verdict to APPROVED, no further
   code change needed. This is the path most consistent with FO1's precedent, since the underlying gap
   (a) predates this feature, (b) has no verified-safe fix available with this repo's current tooling
   (no on-device VoiceOver/TalkBack harness), and (c) doesn't block any user from completing the task —
   every individual language option remains fully labelled, roled, and operable by assistive tech; only
   the "these 4 are one group named X" framing is likely missing on iOS/Android.
2. **Commission a genuinely-verified fix** — an on-device (real iOS/Android, not Jest/RNTL) VoiceOver/
   TalkBack check confirming some candidate change exposes the group role without swallowing the `radio`
   children — landed via TDD with that verification recorded. Nobody on this pipeline believes this is
   achievable with the repo's current tooling, but it isn't foreclosed if you have access to a device/
   simulator and want it explored further (likely a small, separate follow-up ticket, since it may also
   require a design-system-level fix to the pre-existing `RadioGroup` sibling, which shares the identical
   pattern).
3. **Reject FO2 and demand a different mitigation** — e.g., a UX-level workaround (announcing the group
   verbally in the section heading's text itself, rather than relying on the `radiogroup` role) — this
   would go back through `implementator` via TDD as a new, scoped request.

Whichever you choose, tell `orchestrator_lead`/`reviews_lead` your decision and cite it in `spec.md`'s
Open decisions (mirroring the FO1 format) so it's part of the permanent record, and the pipeline can
either mark this **APPROVED → advance** (path 1, once signed off) or run one more scoped round (paths 2/3).

---

## The finding (carried unresolved from round 2, independently re-verified twice)

**`libs/components/src/molecules/language-selector/language-selector.tsx:38`** — the container `View`
sets `accessibilityRole="radiogroup"` and a group `accessibilityLabel` but never sets `accessible={true}`.
Per React Native's own accessibility model, a plain, non-touchable `View` is not an accessibility element
unless `accessible` is explicitly set — so this role/label is very likely never exposed to native
VoiceOver/TalkBack. WCAG 1.3.1 (Info and Relationships) / 4.1.2 (Name, Role, Value), both **Level A**.

- **Not introduced by this feature's polish commit or this review cycle** — the component file is
  byte-for-byte unchanged since task-8/-12 (pre-round-1).
- **Systemic, not unique to this feature** — the identical (even less-labelled) pattern already exists in
  the pre-existing sibling `libs/components/src/molecules/radio-group/radio-group.tsx:29`
  (introduced in `913e38b`, well before this feature). `reviewer_design`'s round-3 report additionally
  flags (informational, non-blocking) that `RadioGroup` itself carries no pointer to this now-documented
  limitation — if it's ever reviewed independently, a reviewer with no context on `localization-i18n`
  would have no on-ramp to this investigation. Worth a lightweight follow-up note near
  `radio-group.tsx:29`, but not required for this feature's gate.
- **The obvious fix is a trap, now proven, not just argued.** Adding `accessible={true}` to the container
  would very likely make VoiceOver treat it as one opaque leaf and swallow the four `radio` children,
  making them unreachable — strictly worse than today's "group framing missing, options fully operable."
  Three independent parties (`reviewer_accessibility` twice, `implementator`, `reviewer_code`) each
  separately read `@testing-library/react-native`'s actual source and/or ran their own throwaway probe
  and reached the identical conclusion: **this repo's Jest + RNTL test tooling cannot distinguish a safe
  fix from a fix that silently regresses real iOS accessibility**, because RNTL's descendant-filtering
  (`isSubtreeInaccessible`) never inspects an ancestor's `accessible` prop the way iOS's
  `RCTViewComponentView.mm` does. A "passing" RNTL test for this fix would not prove the fix is safe.
- **Mitigating factors (why major, not blocker; the task remains completable):** every individual
  language option remains fully labelled (`accessibilityLabel`), roled (`accessibilityRole="radio"`), and
  stated (`accessibilityState={{selected, disabled}}`) via `Pressable`, which RN makes accessible by
  default. The section heading immediately above (`accessibilityRole="header"`, added in the round-1
  polish commit) gives some contextual framing.

### What was done in response (round 2 → round 3), honestly and thoroughly
No production code was changed — correctly, per the Three Laws of TDD (`.agents/rules/tdd.md`): no test
can safely/verifiably demand the `accessible={true}` change, so writing it would violate Law 1 and ship
an unverified, plausibly-regressive change behind a false-green test. Instead:
1. `libs/components/src/molecules/language-selector/language-selector.test.tsx` — the comment on
   `exposes a radiogroup role for the container` was corrected to state plainly it guards only the
   literal prop value, not WCAG group-semantics perception. Verified accurate by four independent readers
   (implementator, reviewer_code, reviewer_accessibility, reviewer_design).
2. `docs/features/localization-i18n/tdd.md` — a correction paragraph on the round-1 Finding 1 write-up
   (which had overclaimed) plus a full "Phase 6" investigation log (source citations, the empirical
   probe, the decision rationale) — independently re-derived and confirmed accurate by
   `reviewer_code` and `reviewer_accessibility` against the actual installed `react-native`/
   `@testing-library/react-native` source, not taken on faith.
3. `docs/features/localization-i18n/spec.md` — new **Follow-on FO2**, written with the same rigor as the
   existing, human-approved FO1, plus a footnote directly under AC14 so the caveat is visible at the
   acceptance-criterion level, not buried only in the follow-on list.
4. The round-2 documentation-only minor (`tdd.md`'s `@s3`/`@s4` mistag on a hook robustness test) was also
   correctly resolved in the same pass, re-tagged as "supplementary hardening."

`libs/components/src/molecules/radio-group/radio-group.tsx` was correctly left untouched (separately-
owned, pre-existing component, out of this feature's scope).

---

## Green bar (round 3, re-verified by reviews_lead directly, not taken on trust)
| Check | Result |
|---|---|
| `pnpm check-types` | green (exit 0, 8/8 packages) |
| `pnpm lint` | green (exit 0) — only `app-study-buddy` defines a `lint` script in this monorepo; pre-existing, not a regression |
| `pnpm test` | green — 95 tests across 6 workspaces (localization 52, components 17, study-buddy 7, services 13, hooks 4, lib-with-storybook 2) — unchanged from round 2, as expected for a comment/doc-only response |

Every reviewer this round additionally re-ran their own scoped subset independently and confirmed no
regression; no reviewer reported a red gate.

## Reviewer tally — Round 3 (final)
| Reviewer | Verdict | blocker | major | minor | Report |
|---|---|---|---|---|---|
| code | APPROVED | 0 | 0 | 0 | `review-code.md` |
| design | APPROVED | 0 | 0 | 0 (+1 informational: RadioGroup doc-siloing) | `review-design.md` |
| architecture | APPROVED | 0 | 0 | 0 | `review-architecture.md` |
| security | APPROVED | 0 | 0 | 0 | `review-security.md` |
| accessibility | **CHANGES_REQUESTED** (escalation, not more engineering) | 0 | 1 (carried) | 0 (1 carried, settled — X3) | `review-accessibility.md` |
| performance | APPROVED | 0 | 0 | 0 | `review-performance.md` |

`reviewer_accessibility`'s own words on the judgment call (verbatim from `review-accessibility.md`):
> *"I will not approve the container's current a11y contract as WCAG 2.2 AA-conformant, because it is
> very likely not — but I also do not believe further code changes should be attempted in this feature
> ... This is exactly the situation the 3-round cap's escalation clause anticipates: stop, and let a human
> make the risk-acceptance call the same way one was made for FO1 — not because the engineering response
> was inadequate, but because a real, uncorrected WCAG Level A gap in shipping code is a product/risk
> decision, not a reviewer's or an agent pipeline's unilateral call."*

## Resolution notes (conflicts / dedup, round 3)
- No factual conflict between reviewers: all six agree on what changed (nothing in production code),
  why (no verified-safe fix exists), and that the documentation is accurate and non-overclaiming. The
  only disagreement is a judgment call reserved for `reviewer_accessibility`'s rubric (WCAG conformance
  is binary; documentation of a known gap doesn't make the shipped component conformant) versus the
  other five reviewers' framing (correctly-declined, well-documented, out-of-scope-to-fix-here). This is
  not a reviewer error to resolve by fiat — it is precisely the kind of call the human-gate mechanism
  exists for (as it already did for FO1's interim behavior).
- `reviewer_design`'s informational note (RadioGroup lacks a pointer to this now-documented limitation)
  is non-blocking for this feature and not required for this gate; passed through to the human FYI above.
- `reviewer_code`/`reviewer_accessibility` both independently re-derived (from source, with their own
  throwaway probes) the same technical conclusion the implementator reached — this is unusually
  well-corroborated, not a single party's untested claim.

## 3-round cap reached
Round 1: APPROVED (all six). Round 2: 5/6 APPROVED, accessibility CHANGES_REQUESTED (major, new).
Round 3 (this round, final by cap): 5/6 APPROVED, accessibility CHANGES_REQUESTED (same major, now framed
explicitly as an escalation). Per `.agents/rules/review-standards.md` §"reviews_lead consolidation" step
5 and the `reviews_lead` hard rule ("never let the loop exceed 3 rounds silently"), this stops here.

**`reviews_lead` returns `ESCALATE -> docs/features/localization-i18n/review.md`** with the outstanding
item and the exact decision needed, above.

---

## Round 2 (superseded; retained for traceability)

- **Review round:** 2
- **Trigger:** independent re-review requested by the human after a post-`pr_ready` polish commit
  `7084e5f` ("refactor(localization-i18n): resolve review minor findings (a11y, casts, dead code,
  memoization)"), applied *after* round 1 (APPROVED), mutation (PASS, 100% on changed lines), and DoD
  (PASS) all already completed.

### Verdict (round 2): CHANGES_REQUESTED → one consolidated request issued to `implementator`
Five of six reviewers returned **APPROVED** with no new findings beyond one documentation nit.
`reviewer_accessibility` returned **CHANGES_REQUESTED** with one **major**, well-substantiated finding
that is real but subtle: it is a **pre-existing** condition (not introduced by `7084e5f`, not a
regression), it also affects the pre-existing sibling `RadioGroup` component, and — critically — the
naive fix is very likely to make on-device accessibility *worse*, not better.

### Green bar (round 2)
| Check | Result |
|---|---|
| `pnpm check-types` | green (exit 0, 8/8 packages) |
| `pnpm lint` | green (exit 0) — only `app-study-buddy` defines a `lint` script |
| `pnpm test` | green — 95 tests across 6 workspaces (localization 52, components 17, study-buddy 7, services 13, hooks 4, lib-with-storybook 2) |
| `pnpm --filter @helsoft/components test:e2e` | green — 19/19 passed (chromium) |

### Reviewer tally (round 2)
| Reviewer | Verdict | blocker | major | minor | Report |
|---|---|---|---|---|---|
| code | APPROVED | 0 | 0 | 1 (new, doc-only) | `review-code.md` |
| design | APPROVED | 0 | 0 | 0 | `review-design.md` |
| architecture | APPROVED | 0 | 0 | 0 | `review-architecture.md` |
| security | APPROVED | 0 | 0 | 0 | `review-security.md` |
| accessibility | **CHANGES_REQUESTED** | 0 | 1 (new) | 0 (1 carried, settled) | `review-accessibility.md` |
| performance | APPROVED | 0 | 0 | 0 | `review-performance.md` |

### What `7084e5f` fixed, independently re-verified round 2
Every one of round 1's six minor findings that `7084e5f` targeted was confirmed genuinely resolved:
1. Selector a11y test strength (round-1 finding 1) — new tests added; investigation surfaced round 2's major finding.
2. Fresh allocations in warm paths (round-1 finding 2) — `use-localization.ts` correctly memoized; `language-settings.tsx`'s `options`/`onChange` and the provider's cold-start `changeLanguage` deliberately left as-is with sound, independently-verified rationale.
3. Unguarded `as Locale` casts (round-1 finding 3) — both sites guarded with `isSupportedLocale`, both branches test-covered.
4. Dead `clearStoredLocale` (round-1 finding 4) — removed, zero dangling references.
5. Barrel over-export of `LocalizationContext` (round-1 finding 5) — narrowed to named exports, zero external consumers of the removed export.
6. Heading missing header role (round-1 finding 6) — `accessibilityRole="header"` added and genuinely verified via a real RNTL role query.

### Findings (round 2, severity-ordered)
#### Blocker — none
#### Major
**`libs/components/src/molecules/language-selector/language-selector.tsx:38`** — the container's
`radiogroup` role/label is very likely inert for native (iOS/Android) assistive tech (WCAG 1.3.1/4.1.2).
Full analysis, mitigating factors, and the scoped change request text are preserved in the "Round 3"
section above (the finding carried forward unchanged in substance).

#### Minor (round 2)
- (new, documentation-only) `tdd.md`'s `@s3`/`@s4` mistag on a hook robustness test — resolved in round 3.
- (carried, settled per human gate since round 1, not re-flagged) X3 — resting/unselected selector border contrast ~1.66:1.

### Next phase (round 2)
`reviews_lead` invoked `implementator` with the single change request; response and round-3
re-verification are documented above.

---

## Round 1 (superseded; retained for traceability)

- **Review round:** 1
- **Scope reviewed:** diff `dee16ff..HEAD` (slice commits `465e5d3`, `f0d7b10`, `2af1e44`)

### Verdict: APPROVED → advance to mutation
All six reviewers returned **APPROVED**. No blocker and no major findings in any dimension. Only
non-blocking minors remain; none is a gate failure, so **no change request is issued** and the feature
advances to the mutation phase.

### Green bar (round 1)
| Check | Result |
|---|---|
| `pnpm check-types` | green (exit 0, all workspaces) |
| `pnpm lint` | green (exit 0) |
| `pnpm test` | green — 79 unit tests, 6 workspaces (localization 45, services 13, components 12, hooks 4, study-buddy 3, lib-with-storybook 2) |
| `pnpm --filter @helsoft/components test:e2e` | green — 19 passed (chromium), incl. the 5 language-selector cases |

### Reviewer tally (round 1)
| Reviewer | Verdict | blocker | major | minor | Report |
|---|---|---|---|---|---|
| code | APPROVED | 0 | 0 | 3 | `review-code.md` |
| design | APPROVED | 0 | 0 | 2 | `review-design.md` |
| architecture | APPROVED | 0 | 0 | 1 | `review-architecture.md` |
| security | APPROVED | 0 | 0 | 0 (+2 info) | `review-security.md` |
| accessibility | APPROVED | 0 | 0 | 3 | `review-accessibility.md` |
| performance | APPROVED | 0 | 0 | 3 | `review-performance.md` |

### Contract coverage (round 1)
Every `@s1`–`@s15` maps to at least one concrete test. Red→Green→Refactor evidenced per task; no
production code beyond the contract. The intentional, human-approved `TODO(FO1)` at the failed-save path
was correctly recognized as a tracked follow-on and **not** flagged.

### Findings (round 1, severity-ordered)
#### Blocker — none
#### Major — none

#### Minor (non-blocking; de-duplicated across reviewers)
1. **[mutation-relevant] Selector a11y assertions could be tightened.** `libs/components/src/molecules/language-selector/language-selector.test.tsx:56-74` — tests don't assert the container `radiogroup` role and don't tie the check indicator to the *active* option specifically. **Superseded by round 2/3's major finding: "the a11y contract holds in the component" claim was not actually substantiated.**
2. **[mutation-relevant] Fresh allocations / redundant work in warm paths.** `language-settings.tsx:16,24`, `use-localization.ts:32-37`, `localization-provider.tsx:32,41`. Harmless in current usage. (performance P1/P2/P3)
3. **Type-boundary casts.** `use-localization.ts:34`, `language-settings.tsx:24`. Resolved in the `7084e5f` polish commit. (code C2/C3, security info)
4. **`clearStoredLocale` is dead code.** `locale-preference.dao.ts:20`. Resolved in `7084e5f`. (code C1)
5. **Barrel over-exports internal context.** `libs/localization/src/index.ts:5`. Resolved in `7084e5f`. (architecture A1)
6. **Heading missing header role.** `language-settings.tsx:20`. Resolved in `7084e5f`. (accessibility X1)
7. **Design consistency notes.** Distinct single-select visual + `borderWidth: 2/1` literals — human-gate-approved and a valid MD3 list pattern, not a violation. (design D1/D2, accessibility X3, code C3-styling)

#### Informational (no action)
- react-i18next `escapeValue:false` is the framework default; not an injection vector. (security)
- Added deps carry no known-critical advisories. (security, architecture)

### Next phase (round 1)
`reviews_lead` returned **APPROVED**; orchestrator advanced to `mutation_tester`, which passed
(100% on changed lines), then `dod_validator`, which passed (`pr_ready`).
