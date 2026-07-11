# review-design — activity-matching (Slice 2)

**Verdict:** APPROVED  
**Scope:** task-5 only — Empty + Error (unavailable) states (`@s13`, `@s14`, `@s15`)  
**Rubric:** `.agents/rules/review-standards.md` §2 + `.agents/rules/atomic-design.mdc`

## Findings

_None._

## Checks (Slice 2)

| Check | Result |
|---|---|
| Tokens only (no ad-hoc color/spacing/type) | Pass — unavailable branch reuses `styles.root` (`theme.spacing.s4`) + `styles.prompt` (`theme.typography.titleLarge` / `theme.colors.onSurface`) |
| Existing components reused | Pass — `Card` from `@helsoft/components` |
| Atomic placement | Pass — organism at `libs/activities/src/organisms/matching/` |
| Empty state (`@s13`) | Pass — empty column → early-return unavailable notice, non-interactive (`matching.tsx:73-89`) |
| Error state (`@s14` unequal, `@s15` `unavailable` prop) | Pass — same notice branch (`matching.tsx:74-89`) |
| Sibling parity (MultipleChoice) | Pass — mirrors `multiple-choice.tsx:94-99` (`Card` + title-style `labels.unavailable` text, nothing interactive) |

## Deferred (not findings this pass)

| Item | When |
|---|---|
| `matching.stories.tsx` Empty/Error stories | Slice 3 / task-8 |
| Playwright e2e | Slice 3 / task-9 |
| Full a11y (`@s17`) | later slice |
| Slice 1 Content (already APPROVED) | n/a |
