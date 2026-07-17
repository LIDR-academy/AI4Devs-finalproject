# Spec review — activity-matching

**Verdict: APPROVED**

## Findings
None.

## Fix verification
- Prior finding (task-4.md `scenarios` omitted `@s15` despite a Done criterion testing "grader never called") — **fixed**: `task-4.md` frontmatter now `scenarios: [s8, s11, s12, s15]`; `tasks.md` index row for task-4 updated to `@s8,@s11,@s12,@s15`. Consistent with the Done criteria bullet for `@s15`.

## Verified OK (for the record — no action needed)
- All 17 ACs (spec.md) map 1:1 to `@s1`–`@s17`; every scenario traces back to an AC; no orphans.
- `tasks.md` task set collectively covers `@s1`–`@s17` (re-verified union across all 9 tasks); every task's `scenarios` frontmatter matches its Done criteria and matches the `tasks.md` table row; every `paths` entry is a valid `libs/*` location consistent with `hooks-service-dao.mdc` (no DAO/service for the I/O-free grader) and `atomic-design.mdc` (organism in `@helsoft/activities`).
- Human-locked decisions 1–7 are all correctly reflected and rationale'd in spec.md's "Open decisions" section (per-pair scoring, left↔right only, equal-length invariant, selection UX state machine, organism/wrapper split, Submit-all-paired gate, Empty/Error no-retry).
- risks.md: all 6 risks concrete with named mitigations tied to real scenario tags; dependencies table has a status for every entry.
- gherkin-scenarios.md: one `@s` per behavior, unique tags, declarative steps, happy + error/empty/edge covered (@s13–@s15).
- No scope creep: additions beyond the story's ACs (Empty/Error states, i18n, a11y) are standard cross-cutting requirements already established by the shipped `MultipleChoice` precedent, not gold-plating.
