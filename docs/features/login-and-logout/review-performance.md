# Review — Performance (runtime & delivery cost)

**Feature:** login-and-logout — FULL feature review, Round 3 (final round, 3-round cap)
**HEAD reviewed:** `4f47504` ("fix(login-and-logout): derive TextField accessibilityInvalid from error")
**Round 1 verdict (this lens):** APPROVED, 0 findings
**Round 2 verdict (this lens):** APPROVED, 0 findings
**Round 3 verdict:** **APPROVED**

## Scope this round
Only one commit landed since Round 2 (`feb4204` → `4f47504`), responding to the Round-2 design
finding (`TextField`'s `accessibilityInvalid` not derived from its own `error`):

```
docs/features/login-and-logout/tdd.md                                     | 71 +++++++
libs/components/src/molecules/text-field/text-field.test.tsx (new)        | 27 +++
libs/components/src/molecules/text-field/text-field.tsx                   | 13 +-
libs/components/src/organisms/login-form/login-form.tsx                   |  2 -
libs/components/tests/e2e/molecules/text-field/text-field.e2e.js          | 17 +
```
Confirmed via `git diff feb4204..4f47504 --stat` and `git show 4f47504` (full patch read) — no
other production file touched, no `package.json`/`pnpm-lock.yaml` change (`git diff feb4204..4f47504
-- '**/package.json' pnpm-lock.yaml` → empty).

## Targeted check — `text-field.tsx`'s new `accessibilityInvalid` derivation

`libs/components/src/molecules/text-field/text-field.tsx`:
- `:52` — `accessibilityInvalid = error` as a destructuring default. This is a plain boolean
  assignment (no function call, no allocation) evaluated once per render from a prop already read
  every render (`error`) — same cost class as the pre-existing `const accent = error ? … : …` one
  line below. Not expensive, nothing to memoize.
- `:63` — `const inputProps = { ...rest, accessibilityInvalid };`. This is the only new object
  literal in the diff. Checked whether it's a regression:
  - **Before this commit**, `rest` (from `const { …, ...rest } = props`) was already a fresh object
    every render — object-rest destructuring always allocates a new object, and it was spread
    directly onto `<TextInput {...rest} />` (`text-field.tsx:80`, pre-commit). So a "new object
    every render" already existed on this exact line before the fix; the fix adds one more shallow
    merge (`{...rest, accessibilityInvalid}`) of the same, already-fresh object, not a new class of
    allocation.
  - It's a **flat** merge — no nested objects/arrays, no array literal anywhere in the diff.
  - `TextInput` is a native leaf host component, not wrapped in `React.memo` anywhere in this
    codebase, and `TextField` itself is not memoized either (pre- or post-commit) — so there is no
    shallow-equality/memoization boundary whose bail-out this new object could ever defeat. There
    was no memoization gap opened, because there was no memoization here in the first place (same
    conclusion as Round 2's note on `styles.root(...)`'s dynamic-function calling convention).
  - Net cost: one extra key added to an object that was being shallow-copied anyway. Negligible,
    not a hot loop, not inside a list.
- **Collateral change, `login-form.tsx:111,124`** — the two explicit
  `accessibilityInvalid={!!emailError}` / `accessibilityInvalid={!!passwordError}` props were
  *removed* (now redundant since `TextField` derives the same value from `error`, which is already
  passed). This is a net reduction of two prop assignments per render — strictly cheaper, not a
  regression.

**Conclusion for this check:** no new re-render risk, no object/array literal recreated where one
wasn't already being recreated, no memoization gap opened (none existed to begin with on this line).

## Fresh full-rubric pass (whole feature, one more time)

- **Re-renders / memoization**: `LoginForm`, `TextField`, `SignInForm`, `SignOut` remain small,
  un-memoized components with O(1) local state, appropriate at this scale (a two-field form + one
  confirm dialog) — `React.memo` would add overhead here, not save it. `SignInForm`'s
  `labels={{ … }}` object literal (`sign-in-form.tsx`) is still freshly constructed every render and
  still harmless for the same reason recorded in Round 1/2 (`LoginForm` isn't memoized; the
  `AccessibilityInfo` effects key off primitives extracted from the object, not the object's
  identity). No change since Round 2.
- **List virtualization**: n/a — confirmed again, no lists anywhere in this feature.
- **N+1 / redundant network round-trips**: `AuthDao.signInWithPassword`/`signOut` each still make
  exactly one `getSupabase().auth.*` call; `AuthService.signIn` short-circuits on validation before
  any DAO call reaches the network; no polling, no retry loop, no per-item request pattern anywhere.
  Unchanged since Round 2 (this round touched zero DAO/service/hook files).
- **Bundle/asset weight**: re-confirmed the deleted 638 KB `libs/study-buddy/assets/logo.png` has
  **not** been reintroduced — `find . -iname "*.png" -o -iname "*.jpg" -o -iname "*.svg" …` under
  every feature-touched directory returns nothing; `libs/study-buddy/assets/` still doesn't exist
  (`ls` → "No such file or directory"); `git ls-files | grep -i logo` → no matches. (The stray `??
  libs/study-buddy/assets/` line visible in this session's *initial* git-status snapshot is stale —
  that snapshot predates the later commits in this branch's history; the directory is confirmed
  absent on disk and in the tracked tree right now.) No new images/fonts/binaries introduced by
  `4f47504` (diff is 2 `.tsx`/`.test.tsx` files + 1 `.e2e.js` + docs).
- **Main-thread synchronous work**: nothing new this round; the only new runtime code
  (`accessibilityInvalid = error`, `{...rest, accessibilityInvalid}`) is O(1)/O(props-count),
  negligible.
- **Dependencies**: no `package.json`/`pnpm-lock.yaml` changes since Round 2 — zero bundle-size
  delta.

## Verification run (gate — run myself this round, not just trusted from tdd.md)
- `pnpm turbo run check-types --force` → **8/8 packages green**.
- `pnpm turbo run lint --force` → **green** (`app-study-buddy:lint` — the only workspace with a lint
  script — passes).
- `pnpm turbo run test --force` → **6/6 workspaces green**: `@helsoft/services` 38/38,
  `@helsoft/hooks` 21/21, `@helsoft/components` 65/65 (up from 62 — the 3 new
  `text-field.test.tsx` tests), `@helsoft/study-buddy` 25/25, `@helsoft/localization` 55/55,
  `@helsoft/lib-with-storybook` 2/2.
- `pnpm --filter @helsoft/components exec playwright test --reporter=list` → **29/29 green**,
  including the 2 new `text-field.e2e.js` `aria-invalid` cases (`Error text field exposes
  aria-invalid to assistive tech`, `Filled text field does not expose aria-invalid when there is no
  error`). (A `tmp-a11y-r3/tmp-a11y-r3.e2e.js` suite also ran, present as an untracked scratch file
  from a concurrently-running reviewer's own verification — not part of this feature's shipped code
  or test suite, no bundle/runtime relevance, disregarded for this lens.)

## Findings
None. Zero blocker/major/minor findings this round.

## Conclusion
The only change since Round 2 — `TextField` deriving `accessibilityInvalid` from its own `error`
prop — is a one-line boolean default plus a flat object-merge that replaces an already-per-render
object spread with an equivalent, marginally-larger one; no new allocation class, no defeated
memoization (none existed on this line before or after), and it *removes* two redundant prop
assignments from `LoginForm`. A fresh full-rubric pass across all 3 slices surfaces nothing new:
re-renders/memoization unchanged and appropriate at this scale, no lists, no N+1/redundant network
calls, the removed 638 KB `logo.png` stays removed, no new dependencies or assets. All verification
commands (`check-types`, `lint`, `test`, Playwright e2e) pass. **APPROVED — this lens's verdict
holds across all 3 rounds with zero findings throughout.**
