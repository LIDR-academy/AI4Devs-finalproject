# Mutation testing — ai-key-management (StrykerJS)

## Round 2 (re-run after full-review Round 1+2 fixes, commits 33cb017/953a98d)

Re-run directly by `orchestrator_lead` (same script/base ref as Round 1) after the full review's
15 Round-1 + 2 Round-2 findings landed. Several review fixes were themselves mutation-driven
(Round 1's "negative-branch tests," "failed-first-save key-preservation test" etc. — see
`review.md`), so scores improved, but real survivors remain.

| Lib | total | killed | survived | no cov | score (Δ vs Round 1) |
|---|---:|---:|---:|---:|---:|
| @helsoft/services | 71 | 67 | 4 | 0 | **94.37%** (was 91.55%) |
| @helsoft/hooks | 28 | 22 | 6 | 0 | **84.21%** (was 80.00%, but same 6 survivors — this gap was never addressed by the review fixes) |
| @helsoft/components | 73 | 51 | 22 | 0 | **69.86%** (was 62.30%) |

### @helsoft/services — 4 remain (all Round 1 §"real, killable" #3-6; #1/#2 now fixed)
Round 1's #1 (`api-key.service.ts:28` NoCoverage) and #2 (`:26` tautological check) are **fixed** —
`api-key.service.test.ts` now has "does not classify a differently-coded FunctionsHttpError body,"
"with an empty body," and "normalizes to network_error when the body cannot be read." Still open,
unchanged from Round 1's analysis (message-content-only, per `spec.md`'s "copy is not part of the
contract" — kill with a one-line `.message` assertion each, per this repo's own
`localization-i18n` precedent, not equivalent):
1. `api-key.service.ts:42:41` — `'Network error'` → `""`.
2. `api-key.service.ts:40:41` — `"That key didn't validate"` → `""`.
3. `auth.service.ts:30:47` — `'Invalid credentials'` → `""`.
4. `auth.service.ts:32:39` — `'Network error'` → `""`.

### @helsoft/hooks — same 6 as Round 1, **not addressed** by the review fixes (line numbers shifted, same code)
Round 1's `sessionUserId`-keying fix (Round 1 finding #3) changed the effect's dependency list but
did **not** touch the `cancelled` guard itself — these are the identical 3+3 mutants from Round 1's
analysis, still real / still likely-equivalent:
- **Real (needs a new test — the session-change-while-in-flight race, not just unmount):**
  `use-api-key.ts:86:11` (`if (cancelled) return` → `if (false) return`), `:91:18` (cleanup
  `cancelled = true` → `{}`), `:92:19` (`cancelled = true` → `false`).
- **Likely-equivalent (still needs written confirmation, not yet given):** `:112:6`, `:114:107`,
  `:115:91` (the three `useCallback` dependency-array mutants on already-stable callbacks).

### @helsoft/components — 22 remain (real gaps from Round 1's analysis persist; style mutants persist)
Two of the four replace-save-revert-guard mutants were killed (Round 1's "failed-first-save
key-preservation test," `api-key-form.tsx:76-82`); the `GUIDANCE_URL` mutant is gone (Round 1
promoted it to an injected `guidanceUrl` prop, eliminating the literal). Everything else from
Round 1's analysis is **still open, unaddressed**, at their current line numbers:
- `api-key-form.tsx:81:9` — 2 of 4 guard mutants still survive (`ConditionalExpression`,
  `LogicalOperator`) — same guard, different sub-condition than the ones now killed.
- `api-key-form.tsx:74:64` — `isConfirmingRemove` initial `useState(false)` → `true`.
- `api-key-form.tsx:83:17` — `setApiKey('')` → garbage string (only observable on a second
  Replace-tap after a successful revert).
- `api-key-form.tsx:167:33` — `accessibilityState={{ disabled: isSubmitting }}` → `{}`.
- `api-key-form.tsx:199:33` — dialog-close `setIsConfirmingRemove(false)` → `true` after confirm.
- `api-key-form.tsx:200:11` — `onRemove?.()` → `onRemove()` (optional chaining; `onRemove` is
  typed optional in `ApiKeyFormProps`).
- `api-key-form.tsx:54:39` — `LOADING_STATUS_TEST_ID` literal, tautologically asserted via the
  imported constant.
- StyleSheet mutants (real per this repo's own precedent, not equivalent): `api-key-form.tsx`
  lines 209-238 (`form`/`actionsRow`/`status`/`errorBanner`/`errorBannerText`/`visuallyHidden`
  objects + their string values — `visuallyHidden` is new since Round 1's WCAG 4.1.3 fix) and
  `api-key-required-notice.tsx` lines 31-35 (`notice`/`message`).

### Route
Hand to `implementator`: fix all "real" items above via TDD (one-line message assertions in
services; the session-change-race test in hooks; the `api-key-form.tsx` gaps; `toHaveStyle`
assertions for the style mutants, per `language-selector.test.tsx`'s precedent). Get a written
equivalence confirmation for the 3 flagged `useCallback`-array hook mutants and the `onRemove`
optional-chaining call before excluding either. Re-run mutation per lib after fixes; report back
for a final verification pass before the mutation gate can close.

### Round 2 fix pass (implementator) — results

All four `@helsoft/services` message-content survivors killed with one-line `.message`
assertions added to the existing matching-code test in each case (`api-key.service.test.ts`'s
"normalizes an invalid_key ..." and "...transport failure..." tests; `auth.service.test.ts`'s
"normalizes a Supabase invalid-login error..." and "...retryable-fetch error..." tests).
Re-run: **100%** (71/71 killed) on `api-key.dao.ts,api-key.service.ts,auth.service.ts,typed-error.ts`.

`@helsoft/hooks` — the 3 "real" `cancelled`-guard mutants (`:86,91,92`) are killed by one new
test, `use-api-key.test.ts`'s "does not let a status load in flight before logout clobber the
reset no-key status once it resolves": an authenticated session with a controllable pending
`getApiKeyStatus()` promise, `rerender`s to a no-session state (triggers the effect's cleanup +
re-run via the `sessionUserId` dep), then resolves the stale promise and asserts `status` stays
`{ hasKey: false }`. Confirmed by re-running mutation: those 3 now report Killed.

**Equivalence confirmation — `use-api-key.ts:112:6` (`runMutation`'s own `[]` deps), `:114:107`
and `:115:91` (`saveApiKey`/`removeApiKey`'s `[runMutation]` deps) — CONFIRMED EQUIVALENT, excluded.**
Independently verified (not taking Round 2's proposal on faith): manually applied each of the
three mutations in isolation and re-ran the full `use-api-key.test.ts` + `api-key.integration.test.ts`
suite (27 tests) against each — all 27 pass under every one of the three mutants, matching
Stryker's own "survived" verdict, i.e. this is not a Stryker coverage artifact. Reasoning: `runMutation`
closes only over the three `useState` setters (React-guaranteed stable references across the
component's lifetime) and is declared with a literal `[]` dependency array. Whether that array is
`[]` or `["Stryker was here"]`, its *elements* are hard-coded string/absent literals that never
depend on any prop, state, or ref the component receives — every render re-evaluates to the exact
same primitive value(s), so `Object.is`-based dependency comparison always reports "unchanged"
regardless of how many times the component (or its ancestors) re-render, or with what props. This
makes `runMutation`'s identity permanently stable from mount onward in both the original and the
mutated code — there is no reachable render sequence, prop combination, or timing in which the two
versions could produce a different `runMutation` reference, and therefore no reachable difference
in `saveApiKey`/`removeApiKey`'s own identity either (mutating their `[runMutation]` deps down to
`[]` is moot when `runMutation` itself never changes). Since no test input can ever distinguish
them, per `docs/features/localization-i18n/mutation.md` #21/#22's accepted precedent (same
reasoning, different file), these 3 are excluded as equivalent — no test added.

`@helsoft/components` — all 22 `api-key-form.tsx`/`api-key-required-notice.tsx` survivors killed:
- `:81:9` (2 remaining guard mutants, `ConditionalExpression` + `LogicalOperator`) — killed by one
  new test, "does not clear the typed key when status.hasKey flips true without ever having
  submitted": types a key in the Empty state, then flips `status` straight to a saved key (no
  submission ever happened, so `wasSubmitting.current` was never set true), then presses Replace
  again and asserts the typed value survived. Verified against Stryker's *actual* AST-level
  mutation (not its cosmetic diff text, which omits disambiguating parens — the real `LogicalOperator`
  mutant is `(wasSubmitting.current || !isSubmitting) && status.hasKey`, confirmed by manually
  applying it and re-running the suite) — both remaining mutants collapse the guard to
  `status.hasKey` alone in every path the pre-existing tests exercised (they only ever check the
  guard *after* `isSubmitting` has already resolved to `false`, at which point `!isSubmitting` is
  trivially true), so a case with `wasSubmitting.current` still `false` was needed to distinguish.
- `:74:64` — new test "renders with the removal confirmation dialog closed".
- `:83:17` — extended "reverts to the masked state after a replace-save resolves successfully" to
  type a key before submitting, then press Replace again after the revert and assert blank.
- `:167:33` — new test "exposes accessibilityState.disabled on the input matching isSubmitting".
- `:199:33` — new test "closes the confirmation dialog after the removal is confirmed".
- `:200:11` (`onRemove?.()`) — kept optional; `ApiKeySettings` (the only current caller) always
  supplies `onRemove`, but making the prop required would force adding a dummy `onRemove={jest.fn()}`
  to ~39 unrelated existing test render calls purely to satisfy the type, which is out of proportion
  to the fix. Chose option (a): new test "does not crash confirming a removal when onRemove is not
  supplied" (renders with no `onRemove`, confirms removal, asserts the flow doesn't throw).
- `:54:39` — new test asserting `screen.getByTestId('api-key-form-loading-status')` against the
  literal string directly (not solely via the re-imported `LOADING_STATUS_TEST_ID` constant).
- StyleSheet mutants (`api-key-form.tsx` `form`/`actionsRow`/`status`/`errorBanner`/
  `errorBannerText`/`visuallyHidden`, `api-key-required-notice.tsx` `notice`/`message`) — killed
  with `toHaveStyle` assertions against theme tokens (`spacing`, `shape`, `lightColors`,
  `typography`), following `language-selector.test.tsx`'s precedent.

Re-run: **100%** (`api-key-form.tsx` 69/69, `api-key-required-notice.tsx` 4/4).

Final scores: `@helsoft/services` 100% (71/71), `@helsoft/hooks` 100% (25/25 killed + 3 confirmed
equivalent, excluded), `@helsoft/components` 100% (73/73). Mutation gate closed.

---

# Mutation testing — ai-key-management (Round 1, StrykerJS)

**Verdict: SURVIVORS** — does not meet the 100%-on-changed-lines gate. Measure-only run (`git status` confirms no source file was modified by these runs). Run directly against the changed files vs base `feature-entrega2-HernanLaura` (`.agents/skills/mutation-testing/scripts/run-mutation.sh feature-entrega2-HernanLaura`, then per-lib for hooks/components after the script's `set -e` stopped it on the first non-zero exit).

`supabase/functions/manage-api-key` (Deno) and the SQL migrations are out of scope by design (risks.md R1/R2; gherkin-scenarios.md harness note) — not Jest/Stryker-covered.

## Per-lib scores

| Lib | File(s) mutated | total | killed | survived | no cov | score |
|---|---|---:|---:|---:|---:|---:|
| @helsoft/services | api-key.dao.ts, api-key.service.ts, auth.service.ts, typed-error.ts | 71 (excl. 51 static/errors) | 65 | 5 | 1 | **91.55%** |
| @helsoft/hooks | use-api-key.ts | 30 (excl. 12 static) | 18 | 6 | 0 | **80.00%** |
| @helsoft/components | api-key-form.tsx, api-key-required-notice.tsx | 61 (excl. 2 errors) | 38 | 23 | 0 | **62.30%** |

Per-file: `api-key.dao.ts` 100% (0 survived) · `api-key.service.ts` 77.78% (3 survived, 1 no-cov) · `auth.service.ts` 94.59% (2 survived — pre-existing file, only surfaced because Slice 1's `toTypedError` extraction touched it) · `typed-error.ts` n/a (fully static-filtered) · `use-api-key.ts` 80.00% (6 survived) · `api-key-form.tsx` 64.91% (20 survived) · `api-key-required-notice.tsx` 25.00% (3 survived, all StyleSheet).

---

## Surviving mutants — `file:line:col` + mutation, with judgment call

### @helsoft/services — 6 real, all killable with a targeted assertion (no equivalents)

1. **`api-key.service.ts:28:12`** (NoCoverage) `return false;` → `return true;` inside `readsInvalidKeyBody`'s catch block (the case where the invalid-key body's `.json()` call itself throws/rejects). **Zero tests exercise this branch at all.** Not equivalent — this is the exact "safer default" the code comment claims (an unparseable body must not be misread as invalid_key). To kill: a test where `cause` is a `FunctionsHttpError` whose `context.json()` rejects, asserting the result normalizes to `network_error`.

2. **`api-key.service.ts:26:12`** `body?.code === 'invalid_key'` → `true` (ConditionalExpression, survived despite coverage). The only test with a `FunctionsHttpError` cause has `body.code === 'invalid_key'`, so replacing the check with a tautology still passes. Not equivalent — this is risks.md R4's exact concern ("classifying the provider probe result is brittle"). To kill: a test with a `FunctionsHttpError` whose body `code` is something else (or missing), asserting `network_error` (not `invalid_key`).

3. **`api-key.service.ts:40:41`** `"That key didn't validate"` → `""` (StringLiteral). No test asserts `error.message` content for the `invalid_key` path — only `.code`.
4. **`api-key.service.ts:42:41`** `'Network error'` → `""` (StringLiteral), same gap for the `network_error` path (both `saveApiKey` and `removeApiKey` normalize through it).
5. **`auth.service.ts:30:47`** `'Invalid credentials'` → `""` (StringLiteral) — pre-existing file, surfaced by the Slice-1 `toTypedError` refactor touching it; same message-content gap for `invalid_credentials`.
6. **`auth.service.ts:32:39`** `'Network error'` → `""` (StringLiteral), same gap for `AuthService`'s `network_error` path.

   *(3–6: `spec.md`'s Error contract states "copy is not part of the contract — the UI maps `code` → an i18n key," so the message text has no UI consumer. Per this repo's own precedent (`docs/features/localization-i18n/mutation.md` #8 — a `console.warn` message text survivor was killed with a plain assertion rather than declared equivalent, "low value, but not equivalent"), the message IS an observable property of the thrown `Error` regardless of whether the app currently reads it — kill with a one-line `.message` assertion per case, don't exclude.)*

### @helsoft/hooks — 3 real + 3 likely-equivalent (needs written confirmation before excluding)

**Real — the `cancelled` race guard (`use-api-key.ts:63-72`) is not just an unmount guard:**

7. **`use-api-key.ts:65:11`** `if (cancelled) return;` → `if (false) return;` (ConditionalExpression)
8. **`use-api-key.ts:70-72`** `return () => { cancelled = true; };` → `return () => {};` (BlockStatement)
9. **`use-api-key.ts:71:19`** `cancelled = true` → `cancelled = false` (BooleanLiteral)

   The effect's deps are `[session, isSessionLoading]` — **the effect re-runs (with cleanup) whenever `session` changes, not only on unmount.** The existing test (`use-api-key.test.ts:233`, "ignores a status load that resolves after unmount") only exercises the unmount case, and — checked directly — only asserts `console.error` wasn't called; it never re-reads `result.current` (a `renderHook` result can't reflect a post-unmount re-render anyway, so that specific test genuinely can't distinguish the guard's presence for *unmount*). But a **session-change-while-in-flight** race is real and currently untested: e.g. an authenticated session with a pending `getApiKeyStatus()` call, then the session flips to `null` (logout) before it resolves — without the guard, the stale promise's `setStatus`/`setIsLoading` calls would incorrectly overwrite the already-reset no-key state. **Not equivalent — this is a real, currently-unverified race.** To kill: mock an authenticated session with a controllable pending promise, `rerender` with `noSession` before resolving, then resolve it, and assert `status` stays `{ hasKey: false }` (not clobbered by the stale resolution).

**Likely-equivalent (propose excluding, but implementator/reviewer must confirm in writing before doing so — do not exclude on my say-so alone):**

10. **`use-api-key.ts:91:6`** `}, []);` → `}, ["Stryker was here"]);` (ArrayDeclaration, `runMutation`'s own `useCallback` deps).
11. **`use-api-key.ts:93:107`** `[runMutation]` → `[]` (ArrayDeclaration, `saveApiKey`'s deps).
12. **`use-api-key.ts:94:91`** `[runMutation]` → `[]` (ArrayDeclaration, `removeApiKey`'s deps).

    `runMutation` closes only over the three `useState` setters (React-guaranteed stable references) and has literal `[]` deps today, so it is referentially stable across the component's lifetime regardless of what's in its own dep array (a fresh-but-constant string literal element compares equal via `Object.is` on every render). Since `runMutation` never changes identity, `saveApiKey`/`removeApiKey`'s dep arrays being `[runMutation]` vs `[]` produce the same stable identity either way. Mirrors the accepted equivalent pattern in `docs/features/localization-i18n/mutation.md` #21/#22 (dependency arrays on an already-stable callback) — same reasoning, different file. If implementator's own check confirms no test input can observe a difference, exclude with that written justification; otherwise treat as real.

### @helsoft/components — 20 real (api-key-form.tsx) + 3 style mutants (api-key-required-notice.tsx), no proposed equivalents

**Replace-save revert logic (`api-key-form.tsx:76-82`) — 4 survivors, all in the same guard:**

13-16. `if (wasSubmitting.current && !isSubmitting && status.hasKey)` — 2× `LogicalOperator` (&&→||) and 2× `ConditionalExpression` (dropping subconditions) all survive. The one existing test ("reverts to the masked state after a replace-save resolves successfully") only exercises the case where **all three subconditions are simultaneously true**, so mutants that only change behavior when the subconditions diverge don't get caught. Not equivalent — e.g. a failed replace-save (`isSubmitting` flips false but `status.hasKey` stays reflecting the prior state while `errorMessage` is set) must NOT clear the input/collapse to masked view, and the current suite doesn't test that. To kill: add a case where `status.hasKey` is false at the isSubmitting-flip transition (or `wasSubmitting.current` starts false), asserting the form does **not** reset.

17. **`api-key-form.tsx:70:64`** `useState(false)` → `useState(true)` (`isConfirmingRemove` initial value). No test asserts the confirm dialog is closed on first render. To kill: assert the dialog isn't open before Remove is pressed.

18. **`api-key-form.tsx:79:17`** `setApiKey('')` → `setApiKey("Stryker was here!")`. Not observable in the existing "reverts to masked" test because the input isn't rendered once masked — but it becomes observable in a real second interaction: replace-save succeeds, then Replace is pressed again, and the input should be blank, not the previously-typed value. To kill: extend that flow one step further and assert the reopened input is empty.

19. **`api-key-form.tsx:87:9`** `if (errorMessage) {...}` → `if (true) {...}` (gates the `AccessibilityInfo.announceForAccessibility` effect). No test asserts the announcement does **not** fire when `errorMessage` is absent (only that it fires when present/changed). To kill: assert `announceForAccessibility` is not called on a mount/update with no `errorMessage`.

20. **`api-key-form.tsx:124:33`** `accessibilityState={{ disabled: isSubmitting }}` → `accessibilityState={{}}`. No test asserts this prop's actual value (WCAG state-change relevance, task-14's a11y pass). To kill: assert the input's `accessibilityState` reflects `isSubmitting`.

21. **`api-key-form.tsx:170:11`** `onRemove?.()` → `onRemove()` (OptionalChaining). Survives because the one test exercising this always provides `onRemove`. `onRemove` is typed optional in `ApiKeyFormProps`, so this is a real (if edge-case) gap — either (a) add a test rendering without `onRemove` and confirming removal, asserting no crash, or (b) if `ApiKeySettings` always provides it in practice, tighten the prop to required and delete the optional chain (removes the mutant entirely). Implementator's call — flag which was chosen in `tdd.md`.

22. **`api-key-form.tsx:169:33`** `setIsConfirmingRemove(false)` → `setIsConfirmingRemove(true)`. No test asserts the dialog actually closes after confirming (only that `onRemove` fires). To kill: assert the dialog is closed post-confirm.

23. **`api-key-form.tsx:13:22`** `GUIDANCE_URL = 'https://platform.openai.com/api-keys'` → `= ""`. The existing guidance-link test only asserts the `Linking.openURL` rejection is caught, never the URL argument. A silently-emptied URL would be a real, shippable UX bug ("where to get a key" would go nowhere). To kill: assert `Linking.openURL` is called with the literal URL string.

24. **`api-key-form.tsx:51:39`** `LOADING_STATUS_TEST_ID = 'api-key-form-loading-status'` → `= ""`. The Loading-state test almost certainly asserts via the *imported constant* (`getByTestId(LOADING_STATUS_TEST_ID)`), which is tautological the same way `docs/features/localization-i18n/mutation.md` #1 was (`LOCALE_PREFERENCE_STORAGE_KEY`) — mutating the constant mutates both the code and the check. To kill: assert against the literal string `'api-key-form-loading-status'` directly, not through the re-imported constant.

**StyleSheet mutants — 8 in `api-key-form.tsx` (lines 179-201, `form`/`actionsRow`/`status`/`errorBanner`/`errorBannerText` objects and their `flexDirection`/`alignItems` string values) + 3 in `api-key-required-notice.tsx` (lines 31-35, `notice`/`message` objects). Per this repo's own precedent these are treated as real and killed, not waved off as presentational-equivalent:** `docs/features/localization-i18n/mutation.md` Group B explicitly states style mutants are "not equivalent (they change layout/appearance)" and were killed via `toHaveStyle` assertions (confirmed working with `react-native-unistyles` in this exact codebase — see `libs/components/src/molecules/language-selector/language-selector.test.tsx:117,125,137`). Add the equivalent `toHaveStyle` assertions here (e.g. `actionsRow`'s `flexDirection`/`alignItems`/`gap`, the error banner's background/padding, `api-key-required-notice`'s `notice`/`message` spacing+typography) rather than excluding them.

---

## Threshold check

Gate requires 100% killed on changed lines. Not met (91.55% / 80.00% / 62.30%). **Route: hand to `implementator`** to write the red tests above (Group real) and get a written equivalence confirmation for the 3 flagged hook mutants (#10-12) and the `onRemove` optional-chaining call (#21) before any exclusion. Re-run mutation per lib after fixes; this loop runs alongside the full review's fix round per the ORCHESTRATOR quality loop (one combined round, not two).
