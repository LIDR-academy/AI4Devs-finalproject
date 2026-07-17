# Spec review — ai-key-management

## Round 3 (final)

**Verdict:** APPROVED — spec_ready, bundle cleared for human gate.

Both Round 2 findings confirmed resolved, no regressions anywhere in the bundle. Full traceability sweep (story → ACs → @s → tasks) clean: no orphaned tags, no duplicate tags, no stale AC-number references, all paths valid per `hooks-service-dao.mdc`/`atomic-design.mdc`. Open decisions and risks remain clearly documented with rationale.

---

## Round 2

**Verdict:** CHANGES_REQUESTED (1 major, 1 minor — new; all 7 Round 1 findings confirmed fixed, no regressions)

### Major

1. **`spec.md:40` (AC12) doesn't cover what it's cited for; `gherkin-scenarios.md:134-139` (@s14) doesn't test everything AC12 asserts.** AC12's Given covers two contexts (account screen **and** the generation-entry guard) and its Then requires accessible label on the key input, button role on Save/Replace/Remove **and the notice action**, and error announcement. `@s14` only covers the account-screen context and never asserts the notice's action exposes a button role — the generation-entry-guard/`ApiKeyRequiredNotice` half of AC12 is untested. No task's Done criteria commits to this assertion (`task-12.md`'s notice-test criteria only checks message + navigation action fire, no role assertion; `task-14.md` — the only task tagged `@s14` — never mentions the notice component). Fix: add a step to `@s14` (or a companion scenario) asserting the guard/notice action exposes a button role in the generation-entry-guard context, and have a task's Done criteria commit to writing it.

### Minor

2. **`task-14.md:7`** — `paths` omits `api-key-form.test.tsx` / `api-key-required-notice.test.tsx` even though `task-14.md:17`'s Done criteria requires editing exactly those two test files (button-role/label/announcement assertions). Sibling precedent `login-and-logout/task-9.md:7` lists `login-form.test.tsx` alongside `login-form.tsx` in its equivalent a11y-pass task. Fix: add both `.test.tsx` paths to `task-14.md`'s `paths` list.

---

## Round 1

**Verdict:** CHANGES_REQUESTED (3 major, 4 minor)

## Major

1. **`spec.md:30` (AC2) doesn't cover what it's cited for.** AC2's Given/When/Then is scoped strictly to "a submitted key that fails the provider test call (invalid/revoked)," but its citation `(→ @s6, @s7)` includes `@s7` (`gherkin-scenarios.md:71-80`, "A transport failure on save is retryable"), a *different* failure mode (server unreachable with a *valid* key) with its own `network_error` code in the Error & security contract (`spec.md:78`). Sibling `login-and-logout` splits this into AC5 (invalid credentials) / AC6 (network error). Fix: split AC2 into an invalid-key AC and a separate network/retry AC (or broaden AC2's GWT to explicitly state both branches).

2. **`spec.md:32` (AC4) doesn't cover what it's cited for.** AC4's GWT only describes the successful-removal path, but is cited `(→ @s8, @s9)` where `@s9` (`gherkin-scenarios.md:89-96`) is the removal-*failure* scenario. Fix: reword AC4 to cover both outcomes or add a distinct AC for failed removal.

3. **`validation_error` (blank/whitespace key) has no backing `@s` scenario or AC anywhere in the bundle.** The Error & security contract (`spec.md:79`) defines `validation_error`, `task-5.md:12` requires the service to reject it, `task-13.md:12` plans the `error.empty` i18n key — but no scenario exercises it and no AC mentions it. `task-5.md:19`'s Done-criteria bullet is the only one in that file with no `Scenario @sX` prefix. `login-and-logout` documented an equivalent case as a confirmed Open Decision (defensive-only backstop, tested at the service layer). Fix: either add a scenario for the service-level `validation_error` path and reference it from an AC, or add an explicit Open Decision documenting the defensive-backstop reasoning (mirroring the login precedent).

## Minor

4. **`task-12.md:13,18`** — `ApiKeyGate`'s loading branch has no `@s` tag; only `@s10` is attached to the whole task, and `@s10`'s GWT (`gherkin-scenarios.md:98-105`) doesn't mention the loading state.

5. **`spec.md:33` (AC5) / `gherkin-scenarios.md:154`** — AC5's coverage list includes `@s5` (no-key/empty-state scenario), which doesn't test AC5's given clause ("Given a saved key..."). `@s3`/`@s11` already fully satisfy AC5; the `@s5` reference is superfluous.

6. **`task-14.md:7`** — `.e2e.js` paths (`libs/components/tests/e2e/organisms/api-key-form.e2e.js`, `.../api-key-required-notice.e2e.js`) omit the per-component subfolder used elsewhere (e.g. `.../organisms/login-form/login-form.e2e.js`). Should be `.../organisms/api-key-form/api-key-form.e2e.js` and `.../organisms/api-key-required-notice/api-key-required-notice.e2e.js`.

7. **`gherkin-scenarios.md` @s14/@s15 have no explicit spec.md AC anchor.** Unlike `login-and-logout` (AC12 accessibility → @s12, AC13 i18n → @s13), `ai-key-management/spec.md`'s AC1–AC8 has no accessibility or i18n AC, leaving @s14/@s15 un-anchored in the AC → scenario coverage table (`gherkin-scenarios.md:146-157`). Recommend adding explicit ACs for these.

## Confirmed clean (no issue)

- Both non-interactively resolved Open decisions (encryption mechanism, validation call) are clearly labeled, numbered, cross-referenced to `risks.md` R-enc/R-prov, marked "to confirm at gate."
- R3 (key-transmission-at-save vs. AC8) reconciled in `spec.md` Architecture section and `risks.md`.
- R1/R2 (Deno/migration outside Jest/Stryker harness) consistently flagged across `risks.md`, `tasks.md`, `gherkin-scenarios.md`.
- All `libs/*` task paths match existing conventions; `supabase/migrations/` and `supabase/functions/` correctly outside `libs/*`.
- Every `@s1`–`@s13` scenario covered by ≥1 task; every AC1–AC8 maps to ≥1 scenario.
