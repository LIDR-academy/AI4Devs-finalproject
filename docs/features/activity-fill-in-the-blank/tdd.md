# TDD log — activity-fill-in-the-blank

Strict Red→Green→Refactor per `.agents/rules/tdd.md`. **Slices 1–3**.

## `@s` → test map (Slice 1)

| Scenario | Test(s) |
|---|---|
| @s1 | `fill-in-the-blank.test.tsx` — unanswered inline blank + Submit enabled; onChangeValue while unanswered |
| @s2 | `grade-fill-in-the-blank.test.ts` correct shape; organism correct banner+lock; activity locks after correct submit |
| @s3 | grader incorrect+`[0]`; organism incorrect banner+reveal+lock; activity wrong submit reveals `[0]` |
| @s4 | `fill-in-the-blank.test.tsx` — explanation with result / absent |
| @s5 | organism ignores edit/resubmit when locked; activity onAnswered once + ignore re-submit |
| @s6 | grader empty → incorrect+`[0]`; activity empty submit payload |
| @s7 | organism Submit + Enter → same `onSubmit`; activity Enter grades once |
| @s8 | `normalizeFillInAnswer` + grader `it.each` outline |
| @s9 | grader non-first accepted match + `acceptedAnswerShown`; activity e2e synonym |
| @s10 | types shape; grader `toEqual` cases; activity `onAnswered` payloads |
| @s11 | `isFillInTheBlankSlideValid` empty list / empty entry; organism+activity unavailable |
| @s12 | valid=false missing/multi `____`; organism unavailable on unrenderable content |

## Cycles

### task-1 — types (`FillInTheBlankSlide` + `FillInTheBlankAnswer`)

**Cycle 1 (@s10 shape)**
- RED: consumers cannot resolve new types / union members.
- GREEN: extended `lesson.ts` + `activity-answer.ts`; barrels re-export.
- REFACTOR: none.

### task-2 — pure grader

**Cycle 2 (@s2/@s10)**
- RED: `grade-fill-in-the-blank.test.ts` — module missing.
- GREEN: `normalizeFillInAnswer` + `isFillInTheBlankSlideValid` + `gradeFillInTheBlank`; exported from study-buddy barrel.
- REFACTOR: none (minimal).

**Cycle 3 (@s3/@s6/@s8/@s9/@s10/@s11/@s12)**
- RED→GREEN: remaining grader/valid/normalize cases passed on obvious-implementation (documented, not dropped). Export confirmed.

### task-3 — `FillInTheBlank` organism

**Cycle 4 (@s1)**
- RED: organism module missing.
- GREEN: controlled split-on-`____`, TextInput + Submit, theme tokens.
- REFACTOR: none.

**Cycle 5 (@s2–@s5/@s7 + unavailable basics)**
- RED→GREEN: correct/incorrect lock, explanation, Enter+Submit, maxLength, unavailable prop/missing blank — all green against existing implement.

### task-4 — `FillInTheBlankActivity` wiring

**Cycle 6 (@s2)**
- RED: activity module missing.
- GREEN: useState value+answer, `maxLength=ceil([0]*1.25)`, grade once, `t()` labels, `unavailable={!valid}`.
- REFACTOR: named `ACCEPTED_LENGTH_HEADROOM` constant.

**Cycle 7 (@s3/@s5/@s7/@s10 + invalid)**
- RED→GREEN: incorrect path, onAnswered once, Enter, e2e payloads, unavailable, labels, maxLength assert — green; barrel export.

## Slice 1 gate

- `@helsoft/types` check-types: pass
- `@helsoft/study-buddy` grader + activity tests: 25 pass
- `@helsoft/activities` organism tests: 12 pass
- check-types study-buddy + activities: pass
- lint: no package lint scripts (turbo no-op for these filters)
- No commit (orchestrator owns slice commit after review)

## Slice 2 — Empty + Error + empty-submit (task-5)

### `@s` → test map (Slice 2 deepen)

| Scenario | Test(s) |
|---|---|
| @s6 | organism: Submit enabled + onSubmit when value empty; activity: empty submit → incorrect banner + cancel + reveal `[0]` + lock + onAnswered |
| @s11 | activity: empty `acceptedAnswers` **and** empty-string entry → unavailable, no grading |
| @s12 | organism: multi-`____` → unavailable; activity: missing blank **and** multi blank → unavailable, no grading |

### Cycles

**Cycle 8 (@s6)**
- RED: added empty-Submit organism + activity UI e2e asserts.
- GREEN: passed immediately on Slice 1 implement (no production change).
- REFACTOR: none.

**Cycle 9 (@s11)**
- RED: empty-string entry wiring case (empty-list renamed for clarity).
- GREEN: passed on existing `isFillInTheBlankSlideValid` + `unavailable={!valid}`.
- REFACTOR: none.

**Cycle 10 (@s12)**
- RED: organism multi-blank; activity missing + multi blank.
- GREEN: passed on existing `splitAroundBlank` / validity guards.
- REFACTOR: none. Content path unchanged.

## Slice 2 gate

- activities organism tests: 14 pass
- study-buddy activity tests: 13 pass
- check-types activities + study-buddy: pass
- No production code change required (coverage deepen only)
- No commit (orchestrator owns)

## Slice 3 — i18n + a11y + stories + e2e (tasks 6–9)

### `@s` → test map (Slice 3)

| Scenario | Test(s) |
|---|---|
| @s13 | `migration-coverage.test.ts` fill-in keys; en/es/pt/de `activity.fillInTheBlank.*`; wrapper already `t()` |
| @s14 | organism: blank name, Submit hitSlop→touchTarget, text+icon, polite/assertive announce, no announce unanswered, transition announce, Android no duplicate |
| @s1/@s2/@s3/@s11/@s12 | stories Unanswered/Correct/Incorrect/Unavailable/MissingBlank + e2e static story loads |
| @s2/@s3/@s5/@s6/@s7 | Interactive e2e: correct/wrong/empty/Enter/lock |

### Cycles

**Cycle 11 (@s13 / task-6)**
- RED: migration coverage for fill-in-the-blank-activity — missing keys.
- GREEN: `fillInTheBlank` block in en/es/pt/de; coverage dir registered. Wrapper already wired.
- REFACTOR: none.

**Cycle 12 (@s14 / task-7)**
- RED: announce/live-region/touch-target/text+icon tests failed (no announce).
- GREEN: Matching-style `AccessibilityInfo` + live region + alert on incorrect `bannerRow`; Android skip.
- REFACTOR: alert role on `bannerRow` (Text parent) so parent-role assert holds.

**Cycle 13 (task-8 stories)**
- Stories: Unanswered / Correct / Incorrect / Unavailable / MissingBlank / Interactive.
- check-types green.

**Cycle 14 (task-9 e2e)**
- RED: @s5 asserted `toBeDisabled` — RN web uses `readonly`.
- GREEN: assert `readonly` + value lock; 11 e2e pass via `--reporter=list`.

## Slice 3 gate

- localization coverage + check-types: pass
- activities organism unit: 22 pass; check-types pass
- Playwright fill-in-the-blank.e2e.js: 11 pass
- No commit (orchestrator owns)

## Mutation rework — killable survivors (pre-review)

**Cycle 15 (activities `:88` / `:99` / `:129`)**
- RED: weakened guards to `true ? …`; tests failed — empty before/after Text mounted; correct still revealed `Paris`.
- GREEN: restored `parts.before/after.length > 0` and `!result.isCorrect && result.acceptedAnswerShown`.
- Tests: blank-at-start / blank-at-end omit empty Text (toJSON probe); correct does not reveal `acceptedAnswerShown`.
- Kills ConditionalExpression + EqualityOperator on `:88`/`:99`, ConditionalExpression + LogicalOperator on `:129`.
- Unit suite: 25 pass. No lasting production change (guards already correct).
