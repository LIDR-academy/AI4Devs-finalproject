# review-code.md — score-results-summary

**Round 2 verdict: APPROVED**

Both round-1 findings verified resolved against `git diff HEAD -- libs/hooks/src/hooks/use-lesson-attempt.ts libs/hooks/src/hooks/use-lesson-attempt.test.ts libs/components/src/organisms/results-summary/results-summary.tsx`:

1. `libs/hooks/src/hooks/use-lesson-attempt.ts:35-55` — guard moved into `runSave` via `isSaving` ref, checked/set synchronously before the service call, cleared in both `.then`/`.catch`. Both `saveAttempt` (line 57-62) and `retry` (line 64-67) now share the single enforcement point. Traced by hand: pre-fix, `retry()` called twice while a save is in flight would hit the service 3 times (1 initial + 2 retries, no guard on that path); post-fix it's 2 (1 initial + 1 retry, second retry blocked by `isSaving.current`). New test `use-lesson-attempt.test.ts:143-167` asserts exactly this and would fail pre-fix. `isSaving` is a `useRef` scoped per hook instance — unmount/remount creates a fresh instance with `isSaving.current = false`, no stuck-guard risk. Pre-existing `saveAttempt`-only overlap test (`use-lesson-attempt.test.ts:120-137`) untouched and still passes under the new guard.
2. `libs/components/src/organisms/results-summary/results-summary.tsx:75,84,99,104,120` — `showSaveFailure` extracted once, referenced at all former duplicate sites. Dependency arrays checked: `showSaveFailure` is a primitive boolean (not an object), so React's `Object.is` dependency comparison behaves identically to listing `saveFailed`+`variant` separately — no missing/extra effect fires. `variant` correctly remains in the second effect's deps (line 104) since it's used directly in the body (line 100), independent of `showSaveFailure`.

No new issues introduced by the fix. No console.log/debug artifacts, no disabled tests.
