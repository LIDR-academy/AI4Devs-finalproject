<?php

use App\Actions\NormalizeForSearch;
use App\Enums\GeographyLevel;
use App\Models\GeographyEntry;
use App\Models\SalesRegion;
use Database\Seeders\GeographyCatalogSeeder;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Tests\Support\Seeders\TestableGeographyCatalogSeeder;

// Fixture strategy (per the story's own decision): the small, ≥501-row fixture under
// tests/Fixtures/geography/ drives every behavioural test below, so seeding never costs
// ~8,300 real rows per test. The one exception is the real-catalog structural checks at
// the bottom of this file, which deliberately seed the real bundled fixtures once.

beforeEach(function () {
    TestableGeographyCatalogSeeder::reset();
    TestableGeographyCatalogSeeder::$municipalityFixture = base_path('tests/Fixtures/geography/es-municipalities-small.csv');
});

afterEach(function () {
    TestableGeographyCatalogSeeder::reset();
});

// --- Behavioural coverage (small fixture) ---

test('seeding creates a country row for every country row in the fixture', function () {
    $this->seed(TestableGeographyCatalogSeeder::class);

    $fixtureCountryCount = count(json_decode(file_get_contents(database_path('data/iso-3166-countries.json')), associative: true));

    expect(GeographyEntry::where('level', GeographyLevel::Country)->count())->toBe($fixtureCountryCount);
});

test('seeding creates exactly seventeen comunidad autonoma rows', function () {
    $this->seed(TestableGeographyCatalogSeeder::class);

    expect(GeographyEntry::where('level', GeographyLevel::Community)->count())->toBe(17);
});

test('every seeded municipio has a parent resolving to an existing comunidad, and every comunidad resolves to España', function () {
    $this->seed(TestableGeographyCatalogSeeder::class);

    $municipios = GeographyEntry::where('level', GeographyLevel::Municipality)->get();
    expect($municipios)->not->toBeEmpty();

    foreach ($municipios as $municipio) {
        expect($municipio->parent_id)->not->toBeNull()
            ->and($municipio->parent)->not->toBeNull()
            ->and($municipio->parent->level)->toBe(GeographyLevel::Community);
    }

    $comunidades = GeographyEntry::where('level', GeographyLevel::Community)->get();
    foreach ($comunidades as $comunidad) {
        expect($comunidad->parent)->not->toBeNull()
            ->and($comunidad->parent->level)->toBe(GeographyLevel::Country)
            ->and($comunidad->parent->iso_alpha2)->toBe('ES');
    }
});

test('the landmark row Gijón resolves through its parent chain to Asturias', function () {
    $this->seed(TestableGeographyCatalogSeeder::class);

    $gijon = GeographyEntry::where('level', GeographyLevel::Municipality)->where('name', 'Gijón')->first();

    expect($gijon)->not->toBeNull()
        ->and($gijon->parent->name)->toBe('Asturias');
});

test('a municipio name carrying accents or ñ round-trips byte-for-byte', function () {
    $this->seed(TestableGeographyCatalogSeeder::class);

    $coruna = GeographyEntry::where('ine_code', '15030')->first();

    expect($coruna)->not->toBeNull()
        ->and($coruna->name)->toBe('A Coruña');
});

test('a seeded row\'s normalized_name equals the shared normalizer applied to that row\'s own name', function () {
    $this->seed(TestableGeographyCatalogSeeder::class);

    $normalize = app(NormalizeForSearch::class);

    $rows = GeographyEntry::query()->inRandomOrder()->limit(20)->get();
    expect($rows)->not->toBeEmpty();

    foreach ($rows as $row) {
        expect($row->normalized_name)->toBe($normalize($row->name));
    }
});

test('a fixture field containing a comma or a quoted name parses as one field', function () {
    TestableGeographyCatalogSeeder::$municipalityFixture = base_path('tests/Fixtures/geography/es-municipalities-quoting.csv');

    $this->seed(TestableGeographyCatalogSeeder::class);

    expect(GeographyEntry::where('ine_code', '99001')->value('name'))->toBe('Test, Comma Name')
        ->and(GeographyEntry::where('ine_code', '99002')->value('name'))->toBe('Test "Quoted" Name');
});

test('the row exactly at a chunk boundary and the row after it both exist after seeding', function () {
    $this->seed(TestableGeographyCatalogSeeder::class);

    $rows = array_slice(
        array_map(fn (string $line): array => str_getcsv($line, escape: '\\'), file(base_path('tests/Fixtures/geography/es-municipalities-small.csv'))),
        1
    );

    $boundaryRow = $rows[GeographyCatalogSeeder::CHUNK_SIZE - 1] ?? null;
    $nextRow = $rows[GeographyCatalogSeeder::CHUNK_SIZE] ?? null;

    expect($boundaryRow)->not->toBeNull()->and($nextRow)->not->toBeNull();

    expect(GeographyEntry::where('ine_code', $boundaryRow[0])->exists())->toBeTrue()
        ->and(GeographyEntry::where('ine_code', $nextRow[0])->exists())->toBeTrue();
});

test('running the seeder twice leaves the row count unchanged', function () {
    $this->seed(TestableGeographyCatalogSeeder::class);
    $firstCount = GeographyEntry::count();

    $this->seed(TestableGeographyCatalogSeeder::class);
    $secondCount = GeographyEntry::count();

    expect($secondCount)->toBe($firstCount)->and($firstCount)->toBeGreaterThan(0);
});

test('a duplicate ine_code in the source is refused rather than silently creating two rows', function () {
    TestableGeographyCatalogSeeder::$municipalityFixture = base_path('tests/Fixtures/geography/es-municipalities-duplicate.csv');

    expect(fn () => app(TestableGeographyCatalogSeeder::class)->run())->toThrow(RuntimeException::class);

    expect(GeographyEntry::count())->toBe(0);
});

test('a missing fixture file makes the seeder throw with an actionable message and leaves the table at zero rows', function () {
    TestableGeographyCatalogSeeder::$municipalityFixture = base_path('tests/Fixtures/geography/does-not-exist.csv');

    expect(fn () => app(TestableGeographyCatalogSeeder::class)->run())
        ->toThrow(RuntimeException::class, 'does-not-exist.csv');

    expect(GeographyEntry::count())->toBe(0);
});

test('a malformed row missing its INE code aborts the whole seed transaction, not just that row', function () {
    TestableGeographyCatalogSeeder::$municipalityFixture = base_path('tests/Fixtures/geography/es-municipalities-malformed.csv');

    expect(fn () => app(TestableGeographyCatalogSeeder::class)->run())->toThrow(RuntimeException::class);

    expect(GeographyEntry::count())->toBe(0);
});

test('a row with the wrong column count aborts the whole seed transaction', function () {
    TestableGeographyCatalogSeeder::$municipalityFixture = base_path('tests/Fixtures/geography/es-municipalities-wrong-column-count.csv');

    expect(fn () => app(TestableGeographyCatalogSeeder::class)->run())->toThrow(RuntimeException::class);

    expect(GeographyEntry::count())->toBe(0);
});

test('a municipio row whose ine_code does not match the 5-digit shape is refused rather than silently colliding with a comunidad row', function () {
    // Phase 4 finding F-1: `ine_code` is UNIQUE per column, not per level, so an
    // under-length code (e.g. a 2-digit comunidad-shaped value) risked upserting over an
    // already-seeded comunidad row and rewriting its level/parent_id in place.
    TestableGeographyCatalogSeeder::$municipalityFixture = base_path('tests/Fixtures/geography/es-municipalities-invalid-code-format.csv');

    expect(fn () => app(TestableGeographyCatalogSeeder::class)->run())
        ->toThrow(RuntimeException::class, 'malformed INE code');

    expect(GeographyEntry::count())->toBe(0);
});

test('a comunidad autonoma code mapping to two conflicting names in the source is refused rather than silently first-wins', function () {
    // Phase 4 finding F-2: a second row disagreeing on community_name for an
    // already-seen community_ine_code used to be silently discarded.
    TestableGeographyCatalogSeeder::$municipalityFixture = base_path('tests/Fixtures/geography/es-municipalities-conflicting-community-name.csv');

    expect(fn () => app(TestableGeographyCatalogSeeder::class)->run())
        ->toThrow(RuntimeException::class, 'conflicting names');

    expect(GeographyEntry::count())->toBe(0);
});

// --- Country-fixture guards (seedCountries()'s own refusal paths, distinct from the
// municipality-fixture guards above -- these abort BEFORE any row is written at all,
// rather than after 249 country rows already committed inside the same transaction) ---

test('a missing country fixture file makes the seeder throw and leaves the table at zero rows', function () {
    TestableGeographyCatalogSeeder::$countryFixture = base_path('tests/Fixtures/geography/does-not-exist.json');

    expect(fn () => app(TestableGeographyCatalogSeeder::class)->run())
        ->toThrow(RuntimeException::class, 'does-not-exist.json');

    expect(GeographyEntry::count())->toBe(0);
});

test('a malformed country fixture entry aborts the whole seed with no partial data', function () {
    TestableGeographyCatalogSeeder::$countryFixture = base_path('tests/Fixtures/geography/iso-countries-malformed.json');

    expect(fn () => app(TestableGeographyCatalogSeeder::class)->run())->toThrow(RuntimeException::class);

    expect(GeographyEntry::count())->toBe(0);
});

test('a duplicate alpha2 code in the country fixture is refused rather than silently upserting over it', function () {
    TestableGeographyCatalogSeeder::$countryFixture = base_path('tests/Fixtures/geography/iso-countries-duplicate.json');

    expect(fn () => app(TestableGeographyCatalogSeeder::class)->run())->toThrow(RuntimeException::class);

    expect(GeographyEntry::count())->toBe(0);
});

test('an index covering the search column exists on the catalog table', function () {
    $this->seed(TestableGeographyCatalogSeeder::class);

    $indexes = collect(Schema::getIndexes('geography_entries'));

    expect($indexes->contains(fn (array $index): bool => $index['columns'] === ['level', 'normalized_name']))->toBeTrue();
});

test('seeding the geography catalog leaves the Sales Region catalog untouched', function () {
    // sales_regions exists (story 0016 has shipped), so this direction is a real,
    // un-skipped assertion rather than a placeholder -- this seeder must never write to
    // it. The reverse direction (a future shipping zone must never touch sales_regions)
    // is genuinely blocked on story 0033 -- see the named skip immediately below.
    expect(Schema::hasTable('sales_regions'))->toBeTrue();

    $before = SalesRegion::count();

    $this->seed(TestableGeographyCatalogSeeder::class);

    expect(SalesRegion::count())->toBe($before);
});

test('creating a shipping zone leaves the Sales Region catalog untouched')
    ->skip('shipping_zones does not exist yet -- see story 0033');

test('the catalog ships with no way for an administrator to add to it', function () {
    // No route, no permission, no policy -- this is the honest form of the PRD scenario
    // "no such route, screen or permission exists": there is no screen to click through in
    // a Feature test, so this asserts the two structural facts that make one impossible.
    expect(Schema::hasTable('geography_entries'))->toBeTrue()
        ->and(Route::has('geography.create'))->toBeFalse();

    $catalog = Permission::where('name', 'like', 'geography.%')->count();
    expect($catalog)->toBe(0);
});

// --- Real bundled fixture: structural checks only, seeded once ---

test('the real bundled fixtures seed the full catalog with no partial data', function () {
    $this->seed(GeographyCatalogSeeder::class);

    $countries = json_decode(file_get_contents(database_path('data/iso-3166-countries.json')), associative: true);

    expect(GeographyEntry::where('level', GeographyLevel::Country)->count())->toBe(count($countries))
        ->and(GeographyEntry::where('level', GeographyLevel::Community)->count())->toBe(17)
        ->and(GeographyEntry::where('level', GeographyLevel::Municipality)->count())->toBeGreaterThan(8000);
});
