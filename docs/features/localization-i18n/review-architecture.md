# Architecture review — localization-i18n (Round 3, final)

**Verdict: APPROVED**

> Round 2 report (superseded by this file): verdict APPROVED, 0 findings. Round 2's architecture pass had
> already flagged `libs/components/package.json` / `libs/lib-with-storybook/package.json` as pre-existing,
> out-of-scope working-tree noise, unrelated to this feature. That determination still holds and is
> reconfirmed below.

## Context

Since round 2, `reviewer_accessibility` returned `CHANGES_REQUESTED` (major: `LanguageSelector` container's
`radiogroup` role likely inert for native assistive tech). `reviews_lead` issued one consolidated change
request. `implementator` responded with **no production code changes** — only doc/test-comment corrections,
on the grounds that no verified-safe fix exists with this repo's tooling (full investigation in
`docs/features/localization-i18n/tdd.md`, Phase 6). This report re-verifies that response from the
layering/architecture lens only (a11y merits are `reviewer_accessibility`'s call, not mine).

## 1. No production code changed

Checked `git diff HEAD` against every known file for this feature:

| File | Diff |
|---|---|
| `libs/components/src/molecules/language-selector/language-selector.tsx` | none (exit 0, empty) |
| `libs/study-buddy/src/components/language-settings/language-settings.tsx` | none (exit 0, empty) |
| `libs/localization/src/**` | none (exit 0, empty) |
| `libs/services/src/**` | none (exit 0, empty) |
| `libs/components/src/molecules/radio-group/radio-group.tsx` | none (exit 0, empty) |

The only within-scope diff touching `libs/` is:
- `libs/components/src/molecules/language-selector/language-selector.test.tsx` — comment-only change on the
  `exposes a radiogroup role for the container` test (lines ~73-84). The assertion itself
  (`expect(screen.getByLabelText(...).props.accessibilityRole).toBe('radiogroup')`, unchanged) is untouched;
  only the surrounding prose comment was corrected to stop overclaiming what the test proves. This is test
  documentation, not production code — no Law-1/Law-3 (TDD) implications for this reviewer's lens, and no
  layering implications since a comment cannot violate a boundary.

Doc-only changes (outside `libs`/`apps`, not this reviewer's concern beyond confirming they're doc-only):
`docs/features/localization-i18n/tdd.md` (new Phase 6 section), `docs/features/localization-i18n/spec.md`
(new Follow-on FO2 + AC14 footnote).

**Conclusion: confirmed — zero production code changed anywhere in `libs` or `apps` for this feature.**

## 2. No new dependency, no barrel change, no layering touched

- `git diff HEAD --name-only -- '**/package.json' pnpm-lock.yaml pnpm-workspace.yaml` → only
  `libs/components/package.json` and `libs/lib-with-storybook/package.json`, both adding a single
  `test:e2e:ci": "npx playwright test --list"` script line — a CI tooling script, not a dependency addition
  (no `dependencies`/`devDependencies` entries touched, `pnpm-lock.yaml` has no diff). These two files were
  already noted as pre-existing/out-of-scope in round 2 and remain so; confirmed unchanged in substance since
  round 2 (same nature of edit, not new).
- No `index.ts` barrel changed anywhere in the repo (`git diff HEAD --name-only | grep -i 'index\.'` →
  empty).
- No import added/removed/moved — trivially true since no `.ts`/`.tsx` production file changed. `Component →
  Hook → Service → DAO` layering is exactly as it was at round 2: `LanguageSelector` (component, atom-level
  a11y props only, no DAO/service import) → `LanguageSettings` composes it → `use-localization` hook wraps
  `@helsoft/localization` + `@helsoft/services`' preference service → DAO → Supabase/AsyncStorage. Unchanged.

**Conclusion: confirmed — no new dependency, no barrel touched, no layering surface modified.**

## 3. `pnpm check-types` — fresh, non-cached run

Ran `pnpm turbo run check-types --force` (bypasses turbo cache):

```
Tasks:    8 successful, 8 total
Cached:    0 cached, 8 total
```

All 8 workspaces (`@helsoft/types`, `@helsoft/lib-with-storybook`, `@helsoft/services`, `@helsoft/localization`,
`@helsoft/hooks`, `@helsoft/components`, `@helsoft/study-buddy`, `app-study-buddy`) pass `tsc --noEmit` clean.
Expected and unsurprising given the only in-`libs` diff is a `.test.tsx` comment, but verified rather than
assumed per the task instructions.

## 4. `radio-group.tsx` sibling — confirmed correctly left untouched, out of scope

`git diff HEAD -- libs/components/src/molecules/radio-group/radio-group.tsx` is empty — confirmed unchanged.
Agreed this is correctly out of scope for this feature: `RadioGroup` is a separately-owned, pre-existing
design-system component; the identical native-accessibility pattern (container never `accessible={true}`)
predates this feature and is not something `localization-i18n` introduced or is chartered to fix. A generic,
design-system-wide resolution (if one exists) is a cross-cutting concern belonging to whoever owns
`libs/components`'s atoms/molecules generally, not to this feature slice. No layering concern either way —
`RadioGroup` has no DAO/service/hook dependency of its own to leak.

## Assessment

From the architecture/layering lens specifically, there is nothing to review that changed: no component
gained a DAO import, no service gained React, no DTO leaked, no hook was reworked to wrap a DAO directly, no
barrel was touched, no new dependency was introduced, and `libs/*` vs `apps/*` placement is unchanged. The
non-fix itself is a layering-neutral outcome (declining to ship an unverifiable native-accessibility prop
change is an a11y/testability judgment call, not an architecture one) and is consistent with round 2's clean
bill on this feature's structure.

**Verdict: APPROVED**
