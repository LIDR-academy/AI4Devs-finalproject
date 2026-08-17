<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

// Task 0014: the UUID primary-key conversion (2026_07_22_100001..100005_*.php) left `users`
// carrying both a `PRIMARY` index and a redundant `users_uuid_unique` unique index on the same
// `id` column — confirmed empirically in task 0003 (see docs/errors-log.md's 2026-08-12 entry).
// This suite proves the cleanup migration removes the redundant index and nothing else, and that
// its down() is an exact inverse. MySQL is required (not SQLite) because the index-introspection
// this asserts on is what the redundant index actually is — see docs/database/schema.md.

// A local closure, not a global `function` — this repo's one precedent for a shared test helper
// (tests/Pest.php's "Functions" section) is a suite-wide surface, and this introspection is
// specific to this one file; a top-level `function` declared here would instead be a *global*
// PHP symbol with no file scoping, so a same-named helper added to another test file later would
// fatally redeclare it.
/**
 * @return array<int, array{name: string, columns: array<int, string>, type: string, unique: bool, primary: bool}>
 */
$usersIndexesOnId = fn (): array => collect(Schema::getIndexes('users'))
    ->filter(fn (array $index): bool => in_array('id', $index['columns'], true))
    ->values()
    ->all();

test('the users table carries exactly one index on id after migrating, the PRIMARY', function () use ($usersIndexesOnId) {
    $indexesOnId = $usersIndexesOnId();

    expect($indexesOnId)->toHaveCount(1);
    expect($indexesOnId[0]['name'])->toBe('primary');
    expect($indexesOnId[0]['primary'])->toBeTrue();
    expect(collect(Schema::getIndexes('users'))->pluck('name'))->not->toContain('users_uuid_unique');
});

test('down() restores users_uuid_unique and the PRIMARY key keeps working', function () use ($usersIndexesOnId) {
    // Pinned by --path rather than --step=1: --step rolls back "the newest migration", which
    // silently stops being this one the moment a later-timestamped migration is added, and would
    // then execute an unrelated (possibly destructive) down() instead.
    $migrationPath = 'database/migrations/2026_08_17_132646_drop_redundant_uuid_unique_index_from_users_table.php';

    // DDL implicitly commits in MySQL, so RefreshDatabase's per-test transaction cannot undo the
    // rollback below — and RefreshDatabase only re-migrates once per run, not per test (see
    // docs/testing/backend/database-strategy.md). This test must restore the schema itself, and
    // must still do so even if an assertion in between fails, or every later test in the run
    // would silently execute against the un-migrated schema.
    try {
        Artisan::call('migrate:rollback', ['--path' => $migrationPath]);

        $indexesOnIdAfterRollback = $usersIndexesOnId();

        expect($indexesOnIdAfterRollback)->toHaveCount(2);
        expect(collect($indexesOnIdAfterRollback)->pluck('name'))->toContain('users_uuid_unique');
        expect(collect($indexesOnIdAfterRollback)->firstWhere('primary', true))->not->toBeNull();
    } finally {
        Artisan::call('migrate', ['--path' => $migrationPath]);
    }

    $indexesOnIdAfterReapply = $usersIndexesOnId();

    expect($indexesOnIdAfterReapply)->toHaveCount(1);
    expect($indexesOnIdAfterReapply[0]['name'])->toBe('primary');
});
