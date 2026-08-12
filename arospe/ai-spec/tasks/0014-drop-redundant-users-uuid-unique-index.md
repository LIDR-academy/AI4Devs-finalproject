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
- [ ] Integration test: after running migrations, `Schema::getIndexes('users')` (or the
      equivalent introspection) shows exactly one index on `id` (`PRIMARY`), no
      `users_uuid_unique`.
- [ ] Integration test: `down()` restores `users_uuid_unique` and the table still has a working
      `PRIMARY` on `id` (rollback does not corrupt the primary key).
- [ ] Regression: the full existing suite still passes — this must be a no-op for every other
      table/model (`passkeys.user_id`, `sessions.user_id`, the permission tables' morph key all
      keep working).

## Expected outcome
`users` carries a single index on `id` (the `PRIMARY`). Every insert into `users` does
marginally less index-maintenance work; no observable behavior changes anywhere else.

## Acceptance criteria
- [ ] `users_uuid_unique` no longer exists after migrating.
- [ ] `id` is still the table's `PRIMARY KEY`, still UUID-typed, still working with
      `HasUuids`/route-model binding exactly as before.
- [ ] `down()` is the exact inverse of `up()`.
- [ ] No other table or existing test is affected.

## Definition of Done
- [ ] Tests written and green, plus the full existing suite.
- [ ] Code reviewed (code-reviewer).
- [ ] No security findings (appsec-auditor) — not expected to apply (pure index cleanup), but
      Phase 4 still runs per the standard workflow.
- [ ] Documentation updated (docs-keeper) — `docs/database/schema.md`, `docs/errors-log.md` (see
      above).
- [ ] Acceptance criteria met.

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
