# Security review — activity-multiple-choice (OWASP / MASVS-relevant)

**Round:** 3 (full review, final round under the 3-round cap — fresh pass over the whole feature diff)
**Scope reviewed:** `git diff $(git merge-base feature-entrega2-HernanLaura HEAD)..HEAD` (merge-base
`0dfc914` → `HEAD` `38c450b`), i.e. the entire feature end to end (all 5 commits:
`875c575`, `8cf9524`, `f4c19a0`, `5dd0161`, `38c450b`), not only the delta since Round 2.

## Verdict: APPROVED

## Summary

Confirms the Round 1 and Round 2 verdicts on a fresh, full read of the entire feature diff. This
remains a client-only, presentational multiple-choice quiz component: options are rendered from
lesson data already in memory, grading (`gradeMultipleChoice`) is a pure function with no I/O, and
no code in this feature calls Supabase, `fetch`, or any external API. The only behavioral change
since Round 2 is commit `38c450b`, which scopes the imperative
`AccessibilityInfo.announceForAccessibility` call with `Platform.OS !== 'android'` — a pure
accessibility/UX change (avoids a duplicate TalkBack announcement) with zero security surface: no
new data source, no new sink, no change to what data is read, validated, rendered, or emitted.

## Findings

None — zero blocker/major/minor findings.

## Checks performed (with evidence)

1. **Secrets/keys/tokens** — `git diff 0dfc914..HEAD | grep -inE "api[_-]?key|secret|token|password|authorization|bearer|SUPABASE"` returns no credential/secret material; only doc-text/comment hits about design tokens and the pre-existing `EXPO_PUBLIC_SUPABASE_*` pattern described in unrelated docs, none introduced by this diff. `git diff 0dfc914..HEAD -- '**/package.json' pnpm-lock.yaml pnpm-workspace.yaml` is empty — no new dependency, no lockfile change, nothing to advisory-check. **No finding.**

2. **Input validation at the grading/domain layer (the actual trust boundary — the AI-generated slide payload)**:
   - `libs/study-buddy/src/grading/grade-multiple-choice.ts:9-12` — `gradeMultipleChoice` checks `selectedOptionId` against `slide.options` via `.some(...)` and throws a plain `Error` (static text + the id only, no secret/PII) instead of fabricating a bogus `MultipleChoiceAnswer`. Covered by `libs/study-buddy/src/grading/grade-multiple-choice.test.ts:46-50` (`throws when selectedOptionId is not one of the slide options`).
   - `libs/components/src/organisms/multiple-choice/multiple-choice.tsx:76-77` — `hasCorrectOption = options.some(...)`; `isUnavailable = !hasCorrectOption` renders the Empty/Error fallback (`labels.unavailable`, non-interactive, lines 95-101) for both a malformed `correctOptionId` (`@s9`) and zero options (`@s8`), instead of crashing. Covered by `multiple-choice.test.tsx`.
   - `libs/study-buddy/src/components/multiple-choice-activity/multiple-choice-activity.tsx:34-38` — `handleSelect` only ever calls `gradeMultipleChoice` with an `optionId` the component itself rendered from `slide.options`, and locks after the first call (`if (selectedOptionId) return`), independent of the organism's own UI-level `disabled` locking (defense in depth). **No finding.**

3. **The Round 3 diff itself** (`multiple-choice.tsx:1-2,89-93`, `answer-option.test.tsx`, `multiple-choice.test.tsx`) — the added `Platform` import and the `Platform.OS !== 'android'` guard only change *whether* a native accessibility-announcement API is invoked, not *what* string is passed to it (`resultLabel`, already-reviewed static/localized content, unchanged) or *what* is rendered. The strengthened `answer-option.test.tsx` assertion (`screen.getByRole('button').props.accessibilityLabel`) only reads a rendered prop back in a test — no new runtime code path, no new data source. **No finding.**

4. **No PII in logs/analytics** — `git diff 0dfc914..HEAD | grep -inE "console\.(log|warn|error|debug)"` returns zero hits in code (only doc-text lines like "No console.log/debug leftovers" inside `tdd.md`). No analytics wiring exists anywhere in this story (`spec.md` "Analytics events: None"). All test/story/e2e fixtures (`'Paris'`, `'opt-a'`, `'What is the capital of France?'`, etc.) are synthetic, never real user data. **No finding.**

5. **No unexpected I/O introduced** — `grep -rn "getSupabase\|fetch(" libs/study-buddy/src/grading libs/study-buddy/src/components/multiple-choice-activity libs/components/src/organisms/multiple-choice libs/components/src/molecules/answer-option` returns nothing. Confirmed via the barrel diffs (`libs/types/src/index.ts`, `libs/study-buddy/src/index.ts`, `libs/components/src/organisms/index.ts`) that only new pure-type/pure-component/pure-function exports were added — no DAO/service/hook wiring. RLS/auth/TLS review is **N/A**: no Supabase/DAO/network call exists in this feature to review. **No finding.**

6. **No unsafe deep links / webviews** — no `Linking.*`, no `WebView` anywhere in the diff. The only "iframe" references are in the Storybook Playwright harness (`libs/components/tests/e2e/organisms/multiple-choice/multiple-choice.e2e.js:9,16,29,39`), driving the local Storybook preview iframe in a test runner — not app runtime code, not a deep-link/webview attack surface. **No finding.**

7. **Rendering of (eventually AI-generated) content is injection-safe** — `question`/option `label`/`explanation` are rendered exclusively via React Native `<Text>` (`multiple-choice.tsx:105,114,136-137`), which does not interpret HTML/markup — no `dangerouslySetInnerHTML`-equivalent, no raw HTML/markdown injection, no `eval`/`new Function` anywhere in the diff (`git diff 0dfc914..HEAD | grep -nE "eval\(|dangerouslySetInnerHTML|innerHTML|new Function"` → zero hits). Addresses OWASP A03 (Injection)/XSS-equivalent risk for an RN context. **No finding.**

8. **Localization additions** (`libs/localization/src/resources/{en,es,pt,de}.ts:activity.mcq.*`) — four static strings per locale (`correct`/`incorrect`/`explanation`/`unavailable`), no interpolation/templating, no unsafe patterns. **No finding.**

9. **Dependency/type surface** — `libs/types/src/lesson.ts` (discriminated `Slide`/`MultipleChoiceSlide` union) and `libs/types/src/activity-answer.ts` (`MultipleChoiceAnswer`) are additive-only, plain-data TS types with no runtime behavior; `libs/types/src/index.ts`, `libs/study-buddy/src/index.ts`, `libs/components/src/organisms/index.ts` barrels updated accordingly. No security surface. **No finding.**

10. **Gate health (re-run independently this round)** — `pnpm --filter @helsoft/types --filter @helsoft/study-buddy --filter @helsoft/components --filter @helsoft/localization check-types` → green (all 4 packages). `pnpm --filter @helsoft/components --filter @helsoft/study-buddy --filter @helsoft/localization test` → green (`components`: 87/87 across 7 suites, `study-buddy`: 35/35 across 5 suites, `localization`: 56/56 across 8 suites). Satisfies the general hard rule against approving with failing gates.

## Conclusion

Round 3 re-confirms Rounds 1 and 2 on a fresh full-diff read. This feature's only meaningful
attack surface is "don't misbehave on a malformed or (eventually) model-influenced slide payload,"
and that guard (`gradeMultipleChoice`'s throw-on-unknown-option, the organism's Empty/Error
fallback) is correctly implemented and tested, with an added defense-in-depth guard in the
wrapper's own lock. The Round 2→3 fix (`Platform.OS !== 'android'` scoping of an accessibility
announcement) is a pure a11y/UX change with no data, sink, or trust-boundary implications. No
secrets, no injection vectors, no PII/logging leakage, no unexpected I/O, no unsafe navigation, no
new/changed dependencies.
