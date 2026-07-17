# review-performance — ai-key-management (FULL review, round 3 of 3 — FINAL)

**Verdict: APPROVED**

Scope: fresh whole-feature performance pass per rubric §6 (`.agents/rules/review-standards.md`),
plus targeted re-verification of Round 2's one open finding (unmemoized `ApiKeyProvider`/
`useApiKeyState` context value, `use-api-key.ts:108,144-145`), fixed in `33cb017`.

Read in full: `libs/hooks/src/hooks/use-api-key.ts` (+`.test.ts`),
`libs/supabase-services/src/dao/api-key.dao.ts`, `libs/supabase-services/src/services/api-key.service.ts`,
`supabase/functions/manage-api-key/validate-key.ts`, `libs/components/src/organisms/{api-key-form,
api-key-required-notice}/*`, `libs/study-buddy/src/components/{api-key-settings,api-key-gate}/*`,
`apps/app-study-buddy/src/app/(app)/{_layout.tsx,settings.tsx,upload.tsx}`.

## Round-2 finding — re-verification

**`use-api-key.ts:117-124`** — `useApiKeyState` now returns
`useMemo(() => ({ status, isLoading, isSubmitting, error, saveApiKey, removeApiKey }), [status, isLoading, isSubmitting, error, saveApiKey, removeApiKey])`.
Dependency array is complete (matches every field of the returned object, no omissions/extras).
`saveApiKey`/`removeApiKey` are themselves stable (`useCallback([runMutation])` at
`use-api-key.ts:114-115`, `runMutation` is `useCallback([])` at `use-api-key.ts:100-112`) — so the
memo is keyed correctly and won't spuriously invalidate on identity churn of the callbacks.
`ApiKeyProvider` (`use-api-key.ts:159-162`) passes this same memoized value straight through as
its context `value` — the fix is applied once at the source, covering both the standalone
`useApiKey()` path and the provider path, not duplicated.

New test `use-api-key.test.ts:413-433` ("returns a referentially stable context value across an
unrelated parent re-render") genuinely proves reference stability: it captures the resolved
context value after initial load, forces a re-render of the tree with an unrelated sibling prop
change, and asserts `renders.at(-1)).toBe(stableValue)` (`Object.is` identity, not deep equality).

Independently reproduced RED→GREEN myself rather than trusting the commit narration: reverted
`use-api-key.ts:117-124`'s `useMemo` wrapper back to a plain object-literal return, re-ran
`pnpm --filter @helsoft/hooks test` — exactly this one test failed (`Expected: {...} / Received:
serializes to the same string`, the other 46 stayed green), then restored the file byte-exact
(`git diff` on the file is empty) and re-ran — 5 suites / 47 tests, all green. Genuine regression
guard, not incidentally passing.

**Closed — no finding.**

## Fresh full-surface pass — no new findings

- **Re-render surface downstream of the fix.** `ApiKeySettings` (`api-key-settings.tsx:34`) and
  `ApiKeyGate` (`api-key-gate.tsx:20`) both consume `useApiKey()`'s now-stable value; neither is
  wrapped in `React.memo`, but that no longer matters for the Context-propagation concern the
  Round-2 finding was about — with the value reference stable across unrelated parent re-renders,
  React's context consumers only re-render when a field actually changes. `ApiKeyForm`'s local
  key-input state (`apiKey`, `api-key-form.tsx:72`) lives inside `ApiKeyForm` itself, so keystrokes
  never propagate up to re-render `ApiKeySettings`/`ApiKeyProvider` — no re-render storm on typing.
- **`(app)/_layout.tsx:13`** — `ApiKeyProvider` still wraps all 6 route-group screens (not just
  Settings/Upload); re-affirming Round 2's non-blocking coupling observation (carried in
  `review.md`, not a finding): this now costs exactly one status fetch per session regardless of
  which screens are visited, and — post-fix — an unrelated re-render of `AppLayout` (e.g. a locale
  change via `useLocalization()`, `_layout.tsx:6`) no longer force-rerenders the 2 real consumers,
  since the memoized value doesn't change reference. No finding.
- **No N+1 / redundant round-trips.** `ApiKeyDao.getApiKeyStatus`/`saveApiKey`/`removeApiKey`
  (`api-key.dao.ts:16-40`) are each a single Supabase call; `ApiKeyService` (`api-key.service.ts:51-77`)
  adds no extra round-trip (validates locally, catches/normalizes, no secondary fetch). Save/remove
  apply the DAO's own returned `ApiKeyStatus` directly to `setStatus` (`use-api-key.ts:100-105`) —
  no follow-up `getApiKeyStatus()` call after a mutation.
- **`validate-key.ts:29,51,56`** — `PROBE_TIMEOUT_MS = 5000` + `AbortSignal.timeout(timeoutMs)` on
  the provider probe confirmed still in place; `handle-save.ts`'s validate-then-store sequencing
  unchanged. Reasonable timeout for a single external HTTPS call; no regression.
- **No lists.** Settings/Upload/guard screens render single-item forms/notices; no `.map` over an
  array of any size in this feature's surface — `FlatList`/`FlashList` genuinely N/A.
- **No heavy synchronous work, no images.** No `Image` usage anywhere in this feature's component
  surface (`api-key-form`, `api-key-required-notice`, `api-key-settings`, `api-key-gate`); no
  synchronous parsing/loops of note — all I/O is `async`/`await`ed through the DAO/service/Edge
  Function layers.
- **No new heavy dependency.** `ApiKeyProvider`/`ApiKeyContext` are built on `react`'s own
  `createContext`/`createElement`/`useContext`/`useMemo` — no new package pulled in for this fix.

## Summary

Round 2's sole open finding (unmemoized `ApiKeyProvider`/`useApiKeyState` context value) is fixed
correctly — complete, correctly-keyed `useMemo`, stable callback deps, and a genuinely
regression-proving test (independently RED→GREEN verified). Round 1's Major 3 (session-identity
effect dependency) and Minor 15 (probe timeout) remain resolved on re-read. No new findings from
this round's fresh full-feature pass.

**Zero open findings — APPROVED.**
