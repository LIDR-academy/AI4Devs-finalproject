# review — score-results-summary (slice 2)

Scope: `git diff dad20d0..5525f74` (slice 2 — error handling + empty state, commit `5525f74`) plus the round-1 fix (applied on top, uncommitted at review time). Reviewers: `reviewer_code`, `reviewer_design`.

## Round 1 (commit `5525f74`)
- **Major** (`reviewer_design`) — `results-summary.tsx:74-83` save-failure notice had `accessibilityRole`/`accessibilityLiveRegion` but no `AccessibilityInfo.announceForAccessibility` call, so iOS VoiceOver got no notification on save failure (LoginForm's `errorBanner` pattern it claimed to mirror does call it). **Resolved** — `useEffect` added guarded by `saveFailed && variant === 'score'`, verified to match `LoginForm`'s effect shape and to re-announce on repeat failures via `retry()`.
- **Major** (`reviewer_design`) — `lesson-results.stories.tsx` still only exported `Score`/`Loading`, missing `Completion`/`SaveFailed` stories despite `LessonResults` supporting both branches. **Resolved** — both stories added, reusing the existing `withLessonAttemptMock` decorator; verified to render distinctly (completion: no score; save-failed: score + notice + retry).
- **Minor** (`reviewer_code`) — `lesson-results.tsx:35` computed `percent` in the unscorable/completion branch though never rendered there and untested (Three Laws). **Resolved** — ternary removed, computed unconditionally (inert `NaN`, never rendered).
- **Minor** (`reviewer_code`) — `results-summary.tsx` `saveFailed` docstring claimed "ignored for completion variant" but render logic had no `variant` check. **Resolved** — `variant === 'score'` guard added to the actual render condition; pinned by a negative test.
- **Minor** (`reviewer_code`) — `score`/`percent` style keys reused for the completion variant's headline/body, no longer revealing. **Resolved** — renamed to `headline`/`body` (now consistent with sibling `dialog.tsx` naming); no stale references left.
- **Minor** (`reviewer_code`) — `onRetrySave` optional despite docstring saying required when `saveFailed` is true; unenforced. **Resolved** — retry `Button` now renders conditionally on `onRetrySave` being provided (graceful degradation), docstring updated to match.
- Not actioned: `reviewer_code`'s note that slice-1's review docs landed in commit `5525f74` instead of `dad20d0` — a git-history observation, not a code defect, excluded from the change request as out-of-rubric.

## Round 2 (fix diff, re-reviewed)
Both reviewers re-ran against the fix diff. `reviewer_code` → `APPROVED`, zero findings. `reviewer_design` → `APPROVED`, zero findings, including explicit re-verification that the iOS announcement genuinely matches `LoginForm`'s pattern and the two new stories render distinctly. Gates green: `pnpm --filter @helsoft/components test/check-types`, `pnpm --filter @helsoft/study-buddy test/check-types`, `pnpm lint`.

## Open findings
None.

## Verdict
APPROVED — slice 2, round 2 (of 2-round cap). Zero open findings.
