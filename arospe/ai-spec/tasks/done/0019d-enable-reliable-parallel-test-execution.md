# [0019d] Enable reliable, fast parallel test execution

## Description
Follow-up to the test-suite performance/parallelization review that produced tasks `0019a`/`0019b`/`0019c`. That review measured a real ~2.7x (`Unit`+`Feature`) / ~1.4x (`Browser`) speedup from `php artisan test --parallel`, but flagged it as unreliable: a batch of unrelated tests failed intermittently under sustained `--parallel` load in one dev session, closed at the time only as an "open, unresolved observation" in `docs/errors-log.md` (root cause not conclusively identified, no fix applied).

This task finds and fixes the real root cause, makes `--parallel` safe to recommend, and enables it in CI.

## Type
infra/testing (no `database-expert`, no new domain code)

## Investigation
The open observation's own leading hypothesis — `storage/framework/views` (the compiled Blade
cache) not being isolated per parallel-test-token, unlike the database and `Storage::fake()` —
was implemented (`AppServiceProvider::configureParallelTesting()`, a `ParallelTesting::setUpTestCase()`
hook pointing `config('view.compiled')` at a per-token subdirectory) and **empirically disproven**:
a small, deterministic reproduction (`php artisan test --compact --parallel --processes=4
tests/Feature/Auth`) failed the *exact same 9 tests*, every run, whether or not the isolation hook
was in place. Since the failure was 100% reproducible at small scale rather than a rare flake
under sustained load, it was tractable to isolate properly — see `docs/errors-log.md`'s dated
correction to the original entry for the full before/after evidence.

**Real root cause**: `storage/framework/views` sits inside `compose.yaml`'s bind-mounted project
volume (`.:/var/www/html`), and concurrent `tempnam()`+`rename()` writes through Sail's WSL2↔Docker
bind mount are unreliable — confirmed by ruling out every other candidate (disk space, inode
count, file-descriptor limits, all measured plentiful) and by the failure disappearing entirely
once the directory was moved off the bind mount.

## Files modified
- `compose.yaml` — `storage/framework/views` is now a named Docker volume (`sail-views`), native
  to the container rather than bind-mounted.
- `docker/8.5/start-container` — `chown -R sail:sail` on that path at container start, since a
  fresh named volume is created owned by `root` and `sail artisan` always runs as `$WWWUSER`/`sail`.
- `app/Providers/AppServiceProvider.php` — `configureParallelTesting()`: a
  `ParallelTesting::setUpTestCase()` hook isolating `view.compiled` per token, nested *inside* the
  new volume (`storage/framework/views/test_{token}`). Kept as defence-in-depth even though the
  volume fix alone resolved the reproduction — mirrors how Laravel already isolates the test
  database and `Storage::fake()` per worker, and costs nothing on a filesystem that no longer
  needs it.
- `composer.json`/`composer.lock` — `brianium/paratest` declared explicitly in `require-dev`
  (`^7.20`, matching the version already present transitively) rather than left undeclared, where
  a future `composer update` could silently drop it.
- `.github/workflows/tests.yml` — `Run Tests` step now `php artisan test --parallel` (no
  `--processes`, so paratest auto-detects the runner's core count). CI's `ubuntu-latest` runner has
  no bind mount in the loop, so it was never exposed to the root cause above and needed no
  equivalent fix.
- `docs/testing/ci/commands.md` — rewrote "Run in parallel" (previously stated paratest "is not
  currently installed" and that `--parallel` would error), with the measured timing table and the
  bind-mount ⚠️.
- `docs/testing/ci/pipeline-integration.md` — the real `Run Tests` step and coverage-gate proposal
  both updated to show `--parallel`, plus why CI needed no bind-mount fix.
- `docs/conventions/base-standards.md` — Quality gates section: `--parallel` is an equally valid
  *unscoped* record of the full suite, not a different (weaker) check.
- `docs/errors-log.md` — dated correction closing the prior "open observation" entry with the
  confirmed root cause and fix, per this log's own rule that a corrected mechanism gets a
  correction block rather than a silent rewrite or a duplicate entry.

## Tests to perform
- [x] Small, deterministic reproduction (`tests/Feature/Auth`, `--parallel --processes=4`) — 9/9
      previously-failing tests now pass; re-run twice more, stable.
- [x] `tests/Browser` (29 tests) — sequential (~49s), `--parallel --processes=4` (~35s),
      `--parallel --processes=8` (~34s, confirming 8 processes adds nothing over 4 for a 4-file
      suite).
- [x] Full suite (950 tests), sequential — 950/950, ~338s (clean baseline for comparison).
- [x] Full suite, `--parallel --processes=8`, twice in a row — 950/950 both times, ~128s and
      ~131s (~2.6x, stable — not the intermittent storm the prior session hit).
- [x] `vendor/bin/pint --format agent` (unscoped) — clean.
- [x] Larastan level 7 (unscoped) — no errors.

## Expected outcome
`php artisan test --parallel` is fast (~2.6x on this repo's suite) and reliable (no intermittent
failures across repeated runs) on this project's own Sail dev container, and CI runs the same way.

## Acceptance criteria
- [x] The deterministic reproduction that failed 9/9 before the fix passes 9/9 (42/42 for the
      full file) after it, repeatably.
- [x] Full suite passes under `--parallel` at least twice in a row with zero failures.
- [x] CI's `Run Tests` step uses `--parallel`.
- [x] `brianium/paratest` is a declared dependency, not a transitive one.
- [x] Documentation states real, measured numbers — no "evaluate this only if it becomes a
      bottleneck" hedging left over from when parallel testing wasn't recommended.

## Definition of Done
- [x] Tests re-run and green (targeted reproduction + full suite, sequential and parallel).
- [x] Code reviewed — **not run as a dedicated `code-reviewer` pass** for this task specifically;
      the change surface is infra config (`compose.yaml`, `start-container`, CI workflow) and one
      small, self-contained service-provider method, verified directly by reproducing the
      original failure and confirming it resolves, per the same standard task `0019a`/`0019b`'s
      dedicated Phase 4/5 subagents were held to. Recorded honestly rather than checked off
      unearned; a review pass on request would focus on `AppServiceProvider.php` and the Docker
      volume/ownership change.
- [x] Documentation updated (`testing/ci/commands.md`, `testing/ci/pipeline-integration.md`,
      `conventions/base-standards.md`, `errors-log.md`).
- [x] Acceptance criteria met.

## Closure notes
Found by refusing to accept "an open, unresolved observation" as the final word once a smaller,
deterministic reproduction was possible — the original entry's own hypothesis (shared-directory
contention) looked plausible enough to implement, and was then disproven by the same discipline
this project's errors-log already argues for: verify a mechanism by execution before building a
fix around it. The real cause (a WSL2/Docker bind-mount limitation, not an application bug) meant
the fix lived in infrastructure config rather than PHP — `compose.yaml` and a Sail startup script —
which is why this task's Definition of Done looks different from `0019a`/`0019b`'s.
