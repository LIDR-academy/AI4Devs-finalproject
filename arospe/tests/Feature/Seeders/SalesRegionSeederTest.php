<?php

use App\Enums\SalesRegionKind;
use App\Models\SalesRegion;
use App\Models\User;
use Database\Seeders\SalesRegionSeeder;
use Illuminate\Database\QueryException;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

// Every test seeds explicitly; none depends on another test having seeded. No
// forgetCachedPermissions() beforeEach() -- that hook exists in the role/permission
// seeder tests only because Spatie caches; SalesRegionSeeder touches no permission
// cache at all, so copying it here would be cargo-cult (see the story's "Tests to
// perform" section).

// --- Catalog coverage ---

test('seeding creates at least 200 country entries, guarding against a truncated or early-broken import', function () {
    $this->seed(SalesRegionSeeder::class);

    expect(SalesRegion::where('kind', SalesRegionKind::Country)->count())->toBeGreaterThanOrEqual(200);
});

test('seeding creates exactly five Spanish fiscal territories with their exact names and a shared parent', function () {
    $this->seed(SalesRegionSeeder::class);

    $spain = SalesRegion::where('slug', SalesRegionSeeder::SPAIN_SLUG)->firstOrFail();
    $territories = SalesRegion::where('kind', SalesRegionKind::FiscalTerritory)->get();

    // Names per the Gherkin's structural scenario ("Spain exposes its fiscal
    // sub-territories as separate entries"): Península, Baleares, Canarias, Ceuta, Melilla.
    $expectedNames = ['Península', 'Baleares', 'Canarias', 'Ceuta', 'Melilla'];

    expect($territories)->toHaveCount(5)
        ->and($territories->pluck('name')->sort()->values()->all())
        ->toBe(collect($expectedNames)->sort()->values()->all())
        ->and($territories->pluck('parent_id')->unique()->all())->toBe([$spain->id]);
});

test('every seeded entry\'s kind is either country or fiscal_territory, and no grouping entry is seeded', function () {
    $this->seed(SalesRegionSeeder::class);

    $kinds = SalesRegion::query()->pluck('kind')->map(fn (SalesRegionKind $kind): string => $kind->value)->unique()->values()->all();

    expect(array_diff($kinds, [SalesRegionKind::Country->value, SalesRegionKind::FiscalTerritory->value]))->toBeEmpty()
        ->and(SalesRegion::whereIn('slug', ['union-europea', 'internacional'])->exists())->toBeFalse();
});

test('the seeded catalog includes a representative anchor set of ISO countries', function (string $code) {
    $this->seed(SalesRegionSeeder::class);

    expect(SalesRegion::where('code', $code)->where('kind', SalesRegionKind::Country)->exists())->toBeTrue();
})->with(['ES', 'FR', 'DE', 'PT', 'US', 'JP', 'GB']);

test('every country entry\'s code matches a two-letter uppercase shape', function () {
    $this->seed(SalesRegionSeeder::class);

    $codes = SalesRegion::where('kind', SalesRegionKind::Country)->pluck('code');

    foreach ($codes as $code) {
        expect($code)->toMatch('/^[A-Z]{2}$/');
    }
});

test('the seeded catalog carries no retired or invented country code', function (string $retiredOrInventedCode) {
    $this->seed(SalesRegionSeeder::class);

    expect(SalesRegion::where('code', $retiredOrInventedCode)->exists())->toBeFalse();
})->with(['UK', 'AN', 'CS', 'YU', 'EU']);

// --- Structure ---

test('the catalog is never nested more than one level deep', function () {
    $this->seed(SalesRegionSeeder::class);

    $parentIdsInUse = SalesRegion::whereNotNull('parent_id')->pluck('parent_id')->unique();
    $grandparentCount = SalesRegion::whereIn('id', $parentIdsInUse)->whereNotNull('parent_id')->count();

    expect($grandparentCount)->toBe(0);
});

test('the España entry has no parent', function () {
    $this->seed(SalesRegionSeeder::class);

    $spain = SalesRegion::where('slug', SalesRegionSeeder::SPAIN_SLUG)->firstOrFail();

    expect($spain->parent_id)->toBeNull();
});

// --- Idempotency ---

test('running the seeder twice leaves the row count unchanged', function () {
    $this->seed(SalesRegionSeeder::class);
    $countBefore = SalesRegion::count();

    $this->seed(SalesRegionSeeder::class);

    expect(SalesRegion::count())->toBe($countBefore);
});

// --- The no-clobber guarantee (the load-bearing test in this story) ---

test('re-seeding preserves an administrator\'s configured rate, description, active flag and edited code on Canarias, and leaves its identity untouched', function () {
    $this->seed(SalesRegionSeeder::class);

    $canarias = SalesRegion::where('slug', 'es-canarias')->firstOrFail();
    $originalId = $canarias->id;
    $originalCreatedAt = $canarias->created_at;

    // Deliberately different from whatever the seeder just wrote on insert, so the
    // assertions below can only pass if re-seeding genuinely left these columns alone.
    $configuredRate = $canarias->rate === '11.500' ? '9.999' : '11.500';

    $canarias->forceFill([
        'rate' => $configuredRate,
        'description' => 'Custom administrator description for Canarias',
        'is_active' => false,
        'code' => 'ZZ-CUSTOM',
    ])->save();

    $countBefore = SalesRegion::count();

    $this->seed(SalesRegionSeeder::class);

    $canarias->refresh();

    // Mandatory revert-check (per the story's Definition of Done): temporarily make the
    // seeder also write `rate` (or any of the other three) on update, and confirm this
    // assertion goes red. If it stays green, the fixture above wasn't configured with
    // values that actually differ from what the seeder writes.
    //
    // The id-stability assertion is the single check distinguishing a real in-place
    // update from a truncate()-and-reinsert, which would pass every value assertion
    // above while silently reissuing UUIDs -- and it is what catches the edited-`code`
    // duplicate-row bug D1 exists to prevent.
    expect($canarias->rate)->toBe($configuredRate)
        ->and($canarias->description)->toBe('Custom administrator description for Canarias')
        ->and($canarias->is_active)->toBeFalse()
        ->and($canarias->code)->toBe('ZZ-CUSTOM')
        ->and($canarias->id)->toBe($originalId)
        ->and($canarias->created_at->toDateTimeString())->toBe($originalCreatedAt->toDateTimeString())
        ->and(SalesRegion::count())->toBe($countBefore);
});

// --- Drift repair (the mirror of the no-clobber test above) ---

test('re-seeding restores a seeder-owned canonical name that was overwritten directly on a row', function () {
    $this->seed(SalesRegionSeeder::class);

    $france = SalesRegion::where('code', 'FR')->where('kind', SalesRegionKind::Country)->firstOrFail();
    $canonicalName = $france->name;

    $france->forceFill(['name' => 'Not The Real Name'])->save();
    expect($france->fresh()->name)->toBe('Not The Real Name');

    $this->seed(SalesRegionSeeder::class);

    expect($france->fresh()->name)->toBe($canonicalName)
        ->and($france->fresh()->name)->not->toBe('Not The Real Name');
});

// --- Seeded state ---

test('seeding flags exactly one entry as the default, and it is the seeder\'s default slug', function () {
    $this->seed(SalesRegionSeeder::class);

    expect(SalesRegion::where('is_default', true)->count())->toBe(1);

    $default = SalesRegion::where('is_default', true)->firstOrFail();

    expect($default->slug)->toBe(SalesRegionSeeder::DEFAULT_SLUG);
});

test('the seeded default entry is active', function () {
    $this->seed(SalesRegionSeeder::class);

    $default = SalesRegion::where('is_default', true)->firstOrFail();

    expect($default->is_active)->toBeTrue();
});

test('the six business-relevant rows seed active, and every other country seeds inactive', function () {
    $this->seed(SalesRegionSeeder::class);

    expect(SalesRegion::where('is_active', true)->count())->toBe(6)
        ->and(SalesRegion::where('is_active', false)->count())->toBeGreaterThanOrEqual(200);
});

test('an inactive country entry carries no tax rate, distinguishable from a real zero', function () {
    $this->seed(SalesRegionSeeder::class);

    $inactiveCountry = SalesRegion::where('is_active', false)
        ->where('kind', SalesRegionKind::Country)
        ->firstOrFail();

    expect($inactiveCountry->rate)->toBeNull();
});

// --- The default is not yanked back on re-seed ---

test('re-seeding does not move the default away from an administrator\'s choice', function () {
    $this->seed(SalesRegionSeeder::class);

    $originalDefault = SalesRegion::where('is_default', true)->firstOrFail();
    $originalDefault->forceFill(['is_default' => false])->save();

    $canarias = SalesRegion::where('slug', 'es-canarias')->firstOrFail();
    $canarias->forceFill(['is_default' => true])->save();

    $this->seed(SalesRegionSeeder::class);

    expect($canarias->fresh()->is_default)->toBeTrue()
        ->and(SalesRegion::where('is_default', true)->count())->toBe(1);
});

// --- Isolation ---

test('running the Sales Region seeder alone creates no users, roles or permissions', function () {
    $this->seed(SalesRegionSeeder::class);

    expect(User::count())->toBe(0)
        ->and(Role::count())->toBe(0)
        ->and(Permission::count())->toBe(0);
});

// --- No ambient config ---
//
// SalesRegionSeeder reads no config at all. Per the errors-log rule that a test
// depending on a config key must set that key -- including to null -- these two
// tests pin both states of the one config key this repo's seeders are known to be
// sensitive to (SUPER_ADMIN_EMAIL, see RolePermissionSeederTest) and confirm the
// Sales Region catalog seeds identically regardless.

test('seeding is unaffected by an unrelated application config key left unset', function () {
    config(['auth.super_admin.email' => null]);

    $this->seed(SalesRegionSeeder::class);

    expect(SalesRegion::where('kind', SalesRegionKind::Country)->count())->toBeGreaterThanOrEqual(200)
        ->and(SalesRegion::where('is_active', true)->count())->toBe(6);
});

test('seeding is unaffected by an unrelated application config key being set', function () {
    config(['auth.super_admin.email' => 'someone@example.test']);

    $this->seed(SalesRegionSeeder::class);

    expect(SalesRegion::where('kind', SalesRegionKind::Country)->count())->toBeGreaterThanOrEqual(200)
        ->and(SalesRegion::where('is_active', true)->count())->toBe(6);
});

// --- Negative/edge ---

test('the database rejects a second row sharing an existing slug', function () {
    SalesRegion::factory()->create(['slug' => 'duplicate-slug']);

    expect(fn () => SalesRegion::factory()->create(['slug' => 'duplicate-slug']))
        ->toThrow(QueryException::class);
});

test('no two seeded rows share a slug', function () {
    $this->seed(SalesRegionSeeder::class);

    $duplicateSlugs = SalesRegion::query()
        ->select('slug')
        ->groupBy('slug')
        ->havingRaw('COUNT(*) > 1')
        ->pluck('slug');

    expect($duplicateSlugs)->toBeEmpty();
});
