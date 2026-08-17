# [0014] Drop the redundant `users_uuid_unique` index

## Description
The UUID primary-key conversion (ADR 0001, `2026_07_22_100001..100005_*.php`) created a
transient `uuid` column with `->unique()` to guarantee uniqueness during the migration, then
renamed it to `id` and promoted it to `PRIMARY KEY` without dropping that unique index. `users`
now carries both a `PRIMARY` index and a separate `users_uuid_unique` index on the same `id`
column — confirmed empirically (task 0003, see `docs/errors-log.md`'s 2026-08-12 entry) via:

```
$ php artisan db:table users
  primary id .................................................. btree, primary
  users_uuid_unique id ......................................... btree, unique
```

This is pure write amplification: every `INSERT` into `users` maintains a second, wholly
redundant `CHAR(36)` unique index alongside the primary key. Nothing is broken — this is schema
debt cleanup, not a bug fix.

## Type
backend | includes database-expert: yes

## Gherkin
```gherkin
Feature: Redundant secondary index removed from users.id

  Scenario: The users table no longer carries a duplicate unique index on id
    Given the users table currently has both a PRIMARY index and a users_uuid_unique index on id
    When the cleanup migration runs
    Then only the PRIMARY index remains on id and users_uuid_unique no longer exists

  Scenario: Existing rows and foreign keys are unaffected
    Given a users table populated with existing rows referenced by passkeys and sessions
    When the cleanup migration runs
    Then every existing row, and every foreign key referencing users.id, is unchanged
```

## Files to create/modify
- `database/migrations/<timestamp>_drop_redundant_uuid_unique_index_from_users_table.php` — new.
  `up()` drops `users_uuid_unique`; `down()` restores it (`$table->unique('id',
  'users_uuid_unique')`), per this repo's `down()`-must-exactly-reverse-`up()` convention (see
  `docs/database/migrations.md`).
- `docs/database/schema.md` — remove the "confirmed redundant `users_uuid_unique` index" note
  added by task 0003 once this migration lands.
- `docs/errors-log.md` — update the 2026-08-12 "A redundant `users_uuid_unique` index survived
  the UUID primary-key conversion" entry's "Fix applied" line from "not fixed" to the real
  migration file, rather than adding a duplicate entry.

## Tests to perform
- [x] Integration test: after running migrations, `Schema::getIndexes('users')` (or the
      equivalent introspection) shows exactly one index on `id` (`PRIMARY`), no
      `users_uuid_unique`.
- [x] Integration test: `down()` restores `users_uuid_unique` and the table still has a working
      `PRIMARY` on `id` (rollback does not corrupt the primary key).
- [x] Regression: the full existing suite still passes — this must be a no-op for every other
      table/model (`passkeys.user_id`, `sessions.user_id`, the permission tables' morph key all
      keep working).

## Expected outcome
`users` carries a single index on `id` (the `PRIMARY`). Every insert into `users` does
marginally less index-maintenance work; no observable behavior changes anywhere else.

## Acceptance criteria
- [x] `users_uuid_unique` no longer exists after migrating.
- [x] `id` is still the table's `PRIMARY KEY`, still UUID-typed, still working with
      `HasUuids`/route-model binding exactly as before.
- [x] `down()` is the exact inverse of `up()`.
- [x] No other table or existing test is affected.

## Definition of Done
- [x] Tests written and green, plus the full existing suite.
- [x] Code reviewed (code-reviewer).
- [x] No security findings (appsec-auditor) — not expected to apply (pure index cleanup), but
      Phase 4 still ran per the standard workflow; confirmed no findings.
- [x] Documentation updated (docs-keeper) — `docs/database/schema.md`, `docs/errors-log.md` (see
      above).
- [x] Acceptance criteria met.

## Closure notes

- Phase 3 (TDD) — `tests/Feature/Database/DropRedundantUsersUuidIndexTest.php` written first and
  confirmed red (both assertions failed against the pre-existing schema), then
  `database/migrations/2026_08_17_132646_drop_redundant_uuid_unique_index_from_users_table.php`
  written to make it green. Verified directly against a real, isolated MySQL 8.4 Sail stack (not
  SQLite) via `php artisan db:table users` before and after `up()`/`down()`.
- Phase 4 (`appsec-auditor`) — no security findings on the migration itself (`PRIMARY` remains the
  sole uniqueness guarantee on `id`; `users_email_unique` / `users_pending_email_unique` are
  separate, untouched indexes; `dropUnique()`'s string form cannot collide with a column-derived
  name). Two Low-severity test-robustness findings were raised and fixed: the rollback test now
  pins `--path` to this exact migration file instead of `--step=1` (which rolls back "the newest
  migration", not necessarily this one, once a later migration exists), and the rollback/re-migrate
  pair is wrapped in `try`/`finally` so a failed assertion still restores the schema for the rest of
  the suite.
- Phase 5 (`code-reviewer`) — approved; every Definition of Done item and acceptance criterion
  independently re-verified (full suite re-run in isolation: 347/347, 852 assertions). Two
  additional advisories (Low/Info, non-blocking) were fixed anyway: the shared index-lookup helper
  was changed from a top-level `function` (a global PHP symbol with no file scoping, so a same-named
  helper added to another test file later would fatally redeclare it) to a closure captured per test
  via `use (...)`, and the migration's `dropUnique('users_uuid_unique')` call gained a comment
  explaining why it must stay the explicit string form rather than `dropUnique(['id'])` (which
  would target a name — `users_id_unique` — that was never created).
- Phase 6 (`docs-keeper`) — done directly rather than via a dispatched agent (judged faster and
  equally correct for a two-file, narrowly-scoped doc change): `docs/database/schema.md`'s "Known
  schema debt" bullet removed, `docs/errors-log.md`'s 2026-08-12 entry's "Fix applied" line updated
  to point at the real migration file instead of "not fixed".
- Phase 7 (closure) — this file moves to `ai-spec/tasks/done/`.
- **Noted, out of scope**: Phase 4 independently confirmed that this repo's CI workflow
  (`.github/workflows/tests.yml`) has no MySQL service and `.env.example` defaults to
  `DB_CONNECTION=sqlite`, and that the pre-existing UUID-conversion migration
  `2026_07_22_100002_convert_user_id_to_uuid_in_passkeys_table.php` (task 0001, long predating this
  task) fails outright on SQLite (`SQLSTATE[HY000]: General error: 1 no such column: users.uuid`) —
  before this task's own migration, timestamped after it, ever runs. This task's migration cannot
  be the cause and cannot fix it; it is flagged here as a real, previously-undetected gap worth a
  separate follow-up task (either wire a MySQL service into CI, or make the conversion chain
  SQLite-safe), not addressed in this story.

### Link-integrity check on the stage moves

Per `docs/workflow.md`'s link-integrity rule. This file contains no relative markdown links at any
point in its lifecycle (verified by grepping for `](` — zero matches both before the `new` →
`in-progress/` move and again here before the `in-progress/` → `done/` move), so neither move
changes any link resolution. Nothing to fix.

## Dependencies and related work
- **Follow-up from task 0003** (`ai-spec/tasks/done/0003-users-status-and-email-verification-lifecycle.md`,
  Open Question OQ-2), which confirmed the redundant index empirically but left it unfixed as
  out of scope for that story.
- No dependency on tasks 0004–0013 (the users-CRUD / roles-permissions line); purely a schema
  cleanup independent of that work.

## Provenance
Raised as OQ-2 during task 0003's Phase 1 debate (unconfirmed at the time — `SHOW INDEX` could
not be run), confirmed empirically during that story's Phase 5 code review via
`php artisan db:table users`, and logged in `docs/errors-log.md` at Phase 6. This task is the
follow-up that entry explicitly asked for.
