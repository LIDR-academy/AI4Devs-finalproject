# review-accessibility — localization-i18n (Round 3, FINAL — 3-round cap)

**Reviewer:** reviewer_accessibility · **Standard:** WCAG 2.2 AA · **Contract:** @s13 / AC14
**Scope:** verification of the implementator's round-2 change-request response (`tdd.md` "Phase 6"),
`spec.md`'s new Follow-on FO2, and the corrected test comment in `language-selector.test.tsx`. This is
the **third and final review round** per the 3-round cap in `.agents/rules/review-standards.md`.

**Verdict: CHANGES_REQUESTED** (escalation for an explicit human risk-acceptance decision — see
"What would flip this to APPROVED" below; **not** a request for more engineering)

---

## 1. Confirmed: `language-selector.tsx` is unchanged

```
git diff HEAD --stat -- libs/components/src/molecules/language-selector/language-selector.tsx
```
produces no output — the component file is byte-identical to round 2. The container `View` at
`language-selector.tsx:38` still sets `accessibilityRole="radiogroup"` + `accessibilityLabel` without
`accessible={true}`. No regression, no attempted (and unverified) fix was silently shipped. **Confirmed.**

## 2. Independent verification of the implementator's central technical claim (RNTL descendant-filtering)

The implementator's crux claim: adding `accessible={true}` to the container would make `getByRole('radiogroup')`
pass, but RNTL's descendant-filtering (`isHiddenFromAccessibility` / `isSubtreeInaccessible` in
`dist/helpers/find-all.js`, called from `dist/queries/role.js`'s `queryAllByRole`) never checks an ancestor's
`accessible` prop — so RNTL would still report all 4 `radio` children as queryable even if real iOS VoiceOver
would swallow them. I did not take this on faith. I:

1. **Read the actual installed source** at
   `node_modules/.pnpm/@testing-library+react-native@14.0.1_.../dist/helpers/find-all.js` and
   `dist/queries/role.js`. `isSubtreeInaccessible(instance)` checks exactly five conditions while walking
   ancestors: `aria-hidden`, `accessibilityElementsHidden`, `importantForAccessibility === 'no-hide-descendants'`,
   `style.display === 'none'`, and an `accessibilityViewIsModal` sibling. **It never reads `props.accessible`
   on any ancestor.** `queryAllByRole` calls this via `findAll`, gating each candidate only on
   `isAccessibilityElement(item)` (the item's *own* `accessible`/host-type check) — never the ancestor chain's
   `accessible` value. This confirms the implementator's source-reading claim verbatim.
2. **Ran my own throwaway probe** (written, executed, deleted — never committed, same as my round-2
   methodology): a local component mirroring `LanguageSelector`'s shape (`View
   accessibilityRole="radiogroup" accessible={true}` wrapping 4 `Pressable accessibilityRole="radio"`).
   Result, executed against the real `@helsoft/components` Jest config:
   - `getByRole('radiogroup')` **passes** once `accessible={true}` is added — confirms Fact B.
   - `getAllByRole('radio')` **still returns all 4** — confirms Fact B's second half; RNTL does not model
     the native "opaque container swallows children" behavior.
   - A control case without `accessible={true}` (i.e. today's real markup) makes `getByRole('radiogroup')`
     **throw** — confirms Fact A and reconfirms my own round-2 finding.
   ```
   PASS src/molecules/language-selector/__a11y_probe.test.tsx
     ✓ getByRole(radiogroup) resolves once accessible=true is set
     ✓ all 4 radio children remain individually queryable via getAllByRole
     ✓ control: getByRole(radiogroup) throws WITHOUT accessible=true
   ```
3. **Verdict on the claim: TRUE, independently reproduced.** The implementator's reasoning is sound, not an
   excuse: this repo's test tooling (Jest + RNTL) structurally cannot distinguish "safe fix" from "fix that
   silently breaks real iOS VoiceOver," because RNTL's filtering algorithm doesn't implement the native
   `accessible`-gating semantics that `RCTViewComponentView.mm:398` implements on-device. I also spot-checked
   the two native-source citations directly in `node_modules/.pnpm/react-native@0.86.0.../react-native/`:
   `React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm:398`
   (`self.accessibilityElement.isAccessibilityElement = newViewProps.accessible;`) and
   `Libraries/Components/View/ViewAccessibility.js` (424 lines, matching the cited `341-424` range) — both
   citations are accurate. Declining to ship an RNTL-"verified" fix that cannot actually prove what it claims
   to prove is the correct call under this repo's Three Laws (a false-green test is worse than an honestly
   undocumented gap) — this part of the implementator's judgment is sound engineering, not evasion.

## 3. Test comment correction — accurate, no new overclaiming

`language-selector.test.tsx:76-84` (the comment on `exposes a radiogroup role for the container`) now states:
the test is "a regression guard for the literal `accessibilityRole` prop value only," explicitly says it does
**not** prove native AT perceives the grouping, states the `getByRole('radiogroup')` query throws and why
(container never `accessible={true}`), and links to `spec.md` FO2 / `tdd.md` Phase 6. I verified each clause
against the actual test body (`getByLabelText(...).props.accessibilityRole`, not a `byRole` query — matches
the comment) and against my own probe (the throw claim — matches). **No new inaccurate claim introduced.**
Sound.

## 4. `spec.md` FO2 write-up — accurate, calibrated, no overclaiming or underclaiming

Checked each required element against the actual code/history:
- **Root cause** — correctly attributes the gap to RN's `accessible`-gating (`View` is only an accessibility
  element with `accessible={true}` or inherent host type), cites `RCTViewComponentView.mm:398` (verified
  accurate, see §2).
- **Why the obvious fix is risky** — correctly explains the "opaque leaf swallows children" trap and, new
  in this round, correctly asserts this repo's test tooling cannot verify a fix is safe (now independently
  confirmed, §2) — this is a stronger and more honest claim than round 2's, which only asserted the *test*
  was weak, not that the tooling gap was structural/unresolvable.
- **Affects the pre-existing `RadioGroup` sibling** — states `radio-group.tsx:29`. I read the file: line 29
  is exactly `<View accessibilityRole="radiogroup" style={...}>` with no `accessible` and no group
  `accessibilityLabel` — an even less-labelled instance of the identical pattern. **Citation accurate.**
- **Out of this feature's scope** — reasonably argued (cross-cutting design-system fix, no on-device harness
  in this repo to verify any native-module-level alternative).
- **No overclaiming**: does not claim the gap is fixed, does not claim it's impossible in principle (hedges
  with "if one exists at all, e.g. via a native module... each requiring on-device verification this repo's
  tooling cannot provide").
- **No underclaiming**: does not minimize it as "just a test gap" (round 1's mistake) — correctly frames it
  as a component-level, WCAG 1.3.1/4.1.2 gap, and the new AC14 footnote surfaces it right at the acceptance
  criterion, not buried only in the follow-on list.
- Sound, honest, accurately scoped.

## 5. Green bar — re-verified

```
pnpm --filter @helsoft/components test
→ Test Suites: 2 passed, 2 total. Tests: 17 passed, 17 total.
pnpm turbo run check-types --filter=@helsoft/components
→ 4 successful, 4 total (types clean)
```
17/17, matching Phase 5/6's claimed count exactly — the comment-only change produced zero test-count change,
as expected. No regression. My probe file was deleted immediately after use;
`git status --short libs/components/src/molecules/language-selector/` shows only the intended
`language-selector.test.tsx` comment change, nothing else.

---

## 6. The judgment call: is this adequately resolved for this feature's gate?

I considered both framings the task posed and did not default to either.

**In favor of treating FO2 as sufficient (APPROVED):** No unverifiable/unsafe fix was force-shipped (correct
TDD discipline — Law 1 forbids writing production code with no test that can actually prove it's right).
Every individual `radio` option remains fully labelled, roled, and stated — the task is completable by a
VoiceOver/TalkBack user end-to-end; nothing regressed. The gap **predates this feature** and is systemic
(identical, even less-labelled, in the pre-existing `RadioGroup`) — fixing a design-system-wide native
accessibility pattern is legitimately larger than this feature's scope. The documentation is honest,
specific, well-cited, and no longer overclaims compliance anywhere I checked. Forcing a fourth round with no
new safe action available would be process theater.

**In favor of continued CHANGES_REQUESTED (my call):** My mandate here is WCAG 2.2 AA conformance, and my
explicit hard rule is to never approve an element — interactive **or informative** — that fails to expose its
role/label to assistive tech. WCAG 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value) are **Level A**
criteria, foundational to AA conformance, not an AA-specific nicety. The container is an informative element
(it conveys "these 4 controls are one mutually exclusive group named X") and that relationship is, on the
balance of evidence gathered across three rounds, very likely **not programmatically determinable** to native
VoiceOver/TalkBack today. That is a real, present-tense nonconformance shipping in production code — it is
not hypothetical, and good documentation about *why* it can't be fixed does not itself make the shipped
component conformant. Round 1 and round 2 already treated this as in-scope for this feature's review (it
wasn't dismissed as "belongs to `RadioGroup`, not us" until now) — I don't think it's consistent to reverse
that scoping in round 3 once a safe code fix turns out to be unavailable.

Critically, **FO1's precedent is not actually parallel yet**: FO1's interim behavior was reviewed and
explicitly human-approved *before* being written up as a tracked follow-on (`spec.md` Open decisions: "Human
gate (2026-07-09): APPROVED as-is"). FO2 has had no equivalent moment — a human has not yet been asked "is it
acceptable to ship this known Level-A gap in this release," only informed of it via documentation a human may
or may not read before merge. Documentation quality is necessary but not, by itself, equivalent to the risk
acceptance that made FO1 citable as precedent.

**My verdict:** I will not approve the container's current a11y contract as WCAG 2.2 AA-conformant, because it
is very likely not — but I also do not believe further code changes should be attempted in this feature (none
would be verifiable-safe with this repo's tooling, per §2), and I am not asking `tdd_craftsman` to keep
looping. This is exactly the situation the 3-round cap's escalation clause anticipates: stop, and let a human
make the risk-acceptance call the same way one was made for FO1 — not because the engineering response was
inadequate, but because a real, uncorrected WCAG Level A gap in shipping code is a product/risk decision, not
a reviewer's or an agent pipeline's unilateral call.

### What would flip this to APPROVED (either is sufficient, no further code required for either)
1. **A human explicitly signs off on FO2** in `spec.md`'s Open decisions (mirroring FO1's exact
   "Human gate: APPROVED as-is" pattern) — recording that shipping with this known, documented, tracked
   native-AT limitation is an accepted risk for this release. On that signature alone I would flip to
   APPROVED; no code change needed.
2. **A genuinely verified fix** — e.g. an on-device (real iOS/Android, not RNTL) VoiceOver/TalkBack check
   confirming a candidate change (platform-scoped `accessible` or otherwise) exposes the group role without
   swallowing the children — landed via TDD with that verification recorded. I do not believe this exists
   within this repo's current tooling, but I won't foreclose it if evidence changes.

## Findings (severity-ordered)

### Major (carried from round 2, unresolved by design — human decision needed, not more engineering)
- **`libs/components/src/molecules/language-selector/language-selector.tsx:38`** — container `View`'s
  `accessibilityRole="radiogroup"` + group `accessibilityLabel` are very likely inert for native
  VoiceOver/TalkBack (WCAG 1.3.1 / 4.1.2), because `accessible={true}` is never set and no safe alternative
  exists that has been verified with real native tooling. Independently reconfirmed this round (§2). Mitigated
  by fully-accessible individual `radio` children (task remains completable). Predates this feature; identical,
  even-less-labelled pattern exists in `libs/components/src/molecules/radio-group/radio-group.tsx:29`. Tracked
  honestly as `spec.md` Follow-on FO2 — but tracking alone does not resolve the underlying nonconformance.

### Resolved this round (no issue)
- `language-selector.test.tsx:76-84` comment — accurate, calibrated, no overclaiming (§3).
- `spec.md` FO2 + AC14 footnote — accurate, well-cited, correctly scoped, no overclaiming or underclaiming (§4).
- Green bar / no regression — confirmed 17/17, types clean (§5).

### Minor (carried, settled per human gate since round 1, not re-flagged)
- X3 — resting/unselected option border contrast ~1.66:1, `language-selector.tsx:75` — non-blocking,
  decorative boundary, state conveyed by other cues.

## Conclusion
The implementator's investigation is rigorous and its central technical claim about RNTL's descendant-filtering
is verified true by my own independent source-reading and probe — declining to ship an unverifiable "fix" was
the right engineering call, and the doc corrections (test comment, `spec.md` FO2, AC14 footnote) are accurate
and honest, with no overclaiming or underclaiming found anywhere I checked. However, a real WCAG 1.3.1/4.1.2
Level A gap remains, unresolved, in code that ships. Per this reviewer's mandate and hard rule, I do not
believe good documentation alone is sufficient to self-clear that gap without an explicit human risk-acceptance
decision — which, unlike FO1, has not yet happened for FO2. **CHANGES_REQUESTED**, understood explicitly as an
escalation for a human decision (per the 3-round cap), not a further engineering demand.
