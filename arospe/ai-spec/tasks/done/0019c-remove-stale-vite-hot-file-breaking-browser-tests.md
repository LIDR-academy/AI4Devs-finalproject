# [0019c] Remove the stale Vite `public/hot` file breaking all browser tests

## Description
Not a code defect and not scoped to story 0019's own code — surfaced in the same investigation
session as tasks `0019a`/`0019b` (which *are* real fixes to story 0019's Media backend), so it
takes the next letter in that sequence for traceability rather than an unrelated top-level task
number. This entry exists so the full-suite closure work requested after `0019a`/`0019b` ("pasa
por el workflow completo... todo debe estar en verde") has the same paper trail for every failure
that was found, including the one whose fix was "delete a local file" rather than a code change.

While closing out `0019a`/`0019b` (running the full suite as the final green-check), 19 of 19
`tests/Browser/*` tests failed with `Timeout 5000ms exceeded`, across all three browser test
files (`UsersIndexTest`, `RolesIndexTest`, `SalesRegionsIndexTest`) — none of them Media-related,
and none touching any file `0019a`/`0019b` changed.

## Type
infra/environment (no `database-expert`, no `backend-expert`/`frontend-expert` implementation —
see Root cause)

## Investigation
A saved Playwright failure screenshot (`tests/Browser/Screenshots/...`) showed the real page
loading, but with **zero CSS applied**: gigantic unstyled SVG icons, near-invisible default-size
text, no layout — the visual signature of a page with no stylesheet, not a broken Livewire
component or a real product bug.

Confirmed the mechanism directly:

```
$ ls -la public/hot
-rw-r--r-- 1 sail sail 21 Aug 28 07:24 public/hot   # same day, stale

$ curl -s http://localhost/login | grep -oE 'href="[^"]*\.css[^"]*"'
href="http://localhost:5173/resources/css/app.css"   # Vite DEV SERVER, not the built manifest

$ curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5173/ --max-time 3
000   # nothing listening
```

Laravel's `@vite()` directive checks for `public/hot` first; when present, it emits asset tags
pointing at the Vite **dev server** (`localhost:5173`) instead of the built manifest in
`public/build/`. The file was left behind by an earlier `npm run dev` invocation that was never
cleanly stopped (killing the terminal rather than `Ctrl+C`, which skips Vite's own exit hook that
normally deletes this file). With nothing listening on 5173, every page loaded with no CSS and no
JS framework code, so every interaction-dependent assertion (a dropdown populating, a modal
opening, Flux's JS initializing) hit its 5-second timeout waiting for DOM state that could never
arrive.

## Files modified
- `public/hot` — **deleted**. Gitignored (`.gitignore:5`), never a repository file; nothing to
  commit.
- `docs/errors-log.md` — new entry ("A stale `public/hot` file from an old `npm run dev` session
  made all 19 browser tests time out, misread as real UI bugs") recording the visual tell and the
  one-command fix, so a future bulk browser-test timeout is diagnosed in seconds.
- `docs/README.md` — entry count corrected (twenty-nine → thirty).

## Tests to perform
- [x] `tests/Browser/*` (29 tests across the 3 files) — 19 previously-failing tests now pass; 0
      failures.
- [x] Re-verified fresh, on request: `ls public/hot` (still absent) and a full re-run of
      `tests/Browser` (29/29 green, 48.7s) — not a one-off fluke from the moment it was deleted.
- [x] Full suite (950 tests) — 950/950 green, confirming this was the only remaining failure
      source after `0019a`/`0019b`'s code fixes.

## Expected outcome
Every browser test loads a fully-styled page against the built asset manifest, exactly as CI
does (CI never runs `npm run dev`, so it never has this file). No code change, no test change —
the fix is entirely a local development-environment artifact removed.

## Acceptance criteria
- [x] `public/hot` does not exist.
- [x] All 19 previously-timing-out browser tests pass.
- [x] The full suite (all three testsuites) passes: 950/950.
- [x] The recurrence signature (bulk, unrelated browser-test timeouts + an unstyled screenshot)
      is documented so it is recognized in seconds next time, by anyone, not just this session.

## Definition of Done
- [x] Tests re-run and green (targeted + full suite).
- [x] Code reviewed — **N/A, no code changed.** Not sent through `code-reviewer`: there is no
      diff to review beyond a deleted, gitignored local file and a documentation entry, and
      dispatching a subagent to review "I ran `rm`" would be process theater with nothing to
      verify that a fresh `ls` and test run don't already prove more directly.
- [x] Security audit — **N/A**, same reason.
- [x] Documentation updated (`docs/errors-log.md`, `docs/README.md`, this task file).
- [x] Acceptance criteria met.

## Closure notes
Surfaced and closed within the same session as `0019a`/`0019b`'s Phase 4/5 follow-up, in response
to the explicit instruction to investigate every failing test found and leave the suite green.
Written up as its own task file — rather than folded silently into `0019a`'s closure notes — so
"which task fixed which failure" stays traceable one-to-one, even though this one required no
code and no formal review phase.
