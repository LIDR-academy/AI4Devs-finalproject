<?php

// Tests for App\Actions\Shipping\SearchGeographyEntries (D-4), per
// ai-spec/tasks/0034-shipping-zones-ui.md's "Tests to perform" section.
//
// Never seeds the real ~8,300-row geography catalog -- builds a handful of rows via
// GeographyEntryFactory's default state (a plain country row) plus its community()/
// municipality() states.
//
// GeographyEntryFactory's states compute `normalized_name` from the FAKED name generated
// inside definition()/community()/municipality() themselves, not from a `name` override
// passed to create() afterwards -- so every override in this file passes BOTH `name` and its
// own `normalized_name` explicitly, the same way Database\Seeders\GeographyCatalogSeeder
// keeps the two in lockstep for a real row.

use App\Actions\NormalizeForSearch;
use App\Actions\Shipping\SearchGeographyEntries;
use App\Enums\GeographyLevel;
use App\Exceptions\UnresolvedSelectionException;
use App\Models\GeographyEntry;
use Illuminate\Support\Facades\DB;

function normalizedGeographyName(string $value): string
{
    return app(NormalizeForSearch::class)($value);
}

/**
 * @param  array<string, mixed>  $overrides
 */
function makeCountryEntry(string $name, array $overrides = []): GeographyEntry
{
    return GeographyEntry::factory()->create([
        'name' => $name,
        'normalized_name' => normalizedGeographyName($name),
        ...$overrides,
    ]);
}

/**
 * @param  array<string, mixed>  $overrides
 */
function makeCommunityEntry(GeographyEntry $country, string $name, array $overrides = []): GeographyEntry
{
    return GeographyEntry::factory()->community($country)->create([
        'name' => $name,
        'normalized_name' => normalizedGeographyName($name),
        ...$overrides,
    ]);
}

/**
 * @param  array<string, mixed>  $overrides
 */
function makeMunicipalityEntry(GeographyEntry $community, string $name, array $overrides = []): GeographyEntry
{
    return GeographyEntry::factory()->municipality($community)->create([
        'name' => $name,
        'normalized_name' => normalizedGeographyName($name),
        ...$overrides,
    ]);
}

/**
 * @return array{country: GeographyEntry, community: GeographyEntry, municipality: GeographyEntry}
 */
function makeGeographyTree(): array
{
    $country = makeCountryEntry('España');
    $community = makeCommunityEntry($country, 'Asturias');
    $municipality = makeMunicipalityEntry($community, 'Gijón', ['province_name' => 'Asturias']);

    return compact('country', 'community', 'municipality');
}

test('a prefix term returns matching entries at all three levels, each carrying the right group', function () {
    ['country' => $country, 'community' => $community, 'municipality' => $municipality] = makeGeographyTree();

    $resolver = new SearchGeographyEntries;

    $countryResults = $resolver->search(normalizedGeographyName('esp'), 20);
    $communityResults = $resolver->search(normalizedGeographyName('astur'), 20);
    $municipalityResults = $resolver->search(normalizedGeographyName('gij'), 20);

    expect(collect($countryResults)->pluck('id'))->toContain((string) $country->id)
        ->and(collect($countryResults)->firstWhere('id', (string) $country->id)['group'])->toBe(GeographyLevel::Country->label())
        ->and(collect($communityResults)->firstWhere('id', (string) $community->id)['group'])->toBe(GeographyLevel::Community->label())
        ->and(collect($municipalityResults)->firstWhere('id', (string) $municipality->id)['group'])->toBe(GeographyLevel::Municipality->label());
});

test('a municipio label carries its province, and two same-named municipios in different provinces are distinguishable', function () {
    ['community' => $community] = makeGeographyTree();

    $villanuevaA = makeMunicipalityEntry($community, 'Villanueva', ['province_name' => 'Asturias']);
    $villanuevaB = makeMunicipalityEntry($community, 'Villanueva', ['province_name' => 'León']);

    $results = (new SearchGeographyEntries)->search(normalizedGeographyName('villanueva'), 20);
    $labels = collect($results)->pluck('label')->all();

    expect($labels)->toContain('Villanueva (Asturias)')
        ->and($labels)->toContain('Villanueva (León)')
        ->and($villanuevaA->id)->not->toBe($villanuevaB->id);
});

test('an accented catalog name is found by its unaccented spelling and vice versa', function () {
    ['municipality' => $municipality] = makeGeographyTree();

    $byUnaccented = (new SearchGeographyEntries)->search(normalizedGeographyName('gijon'), 20);
    $byAccented = (new SearchGeographyEntries)->search(normalizedGeographyName('gijón'), 20);

    expect(collect($byUnaccented)->pluck('id'))->toContain((string) $municipality->id)
        ->and(collect($byAccented)->pluck('id'))->toContain((string) $municipality->id);
});

test('the resolver routes no normalization logic of its own -- no inlined Str::lower, iconv or accent map', function () {
    // Strips PHP comments before scanning -- the resolver's own docblock legitimately NAMES
    // these forbidden patterns to explain why they must never appear as real code.
    $tokens = token_get_all((string) file_get_contents(app_path('Actions/Shipping/SearchGeographyEntries.php')));
    $codeOnly = implode('', array_map(
        fn (array|string $token): string => is_array($token) && in_array($token[0], [T_COMMENT, T_DOC_COMMENT], true)
            ? ''
            : (is_array($token) ? $token[1] : $token),
        $tokens,
    ));

    expect($codeOnly)->not->toContain('Str::lower')
        ->and($codeOnly)->not->toContain('iconv')
        ->and($codeOnly)->not->toContain('Str::ascii')
        ->and($codeOnly)->not->toContain('mb_strtolower');
});

test('the resolver honours the limit it is given and never returns more', function () {
    ['community' => $community] = makeGeographyTree();

    foreach (range(1, 5) as $i) {
        makeMunicipalityEntry($community, "Repetido {$i}");
    }

    $results = (new SearchGeographyEntries)->search(normalizedGeographyName('repetido'), 2);

    expect($results)->toHaveCount(2);
});

test('each level query carries an equality predicate on level', function () {
    makeGeographyTree();

    $queries = [];
    DB::listen(function ($query) use (&$queries) {
        if (str_contains($query->sql, 'geography_entries') && str_contains($query->sql, 'normalized_name')) {
            $queries[] = $query;
        }
    });

    (new SearchGeographyEntries)->search(normalizedGeographyName('a'), 20);

    expect($queries)->toHaveCount(3);

    foreach ($queries as $query) {
        expect($query->sql)->toContain('`level` =');
    }
});

test('a term matching nothing returns an empty array', function () {
    makeGeographyTree();

    $results = (new SearchGeographyEntries)->search(normalizedGeographyName('xyznonexistent'), 20);

    expect($results)->toBe([]);
});

test('disabled is false on every option', function () {
    ['country' => $country] = makeGeographyTree();

    $searchResults = (new SearchGeographyEntries)->search(normalizedGeographyName('esp'), 20);
    $resolved = (new SearchGeographyEntries)->resolveSelected([(string) $country->id]);

    foreach ([...$searchResults, ...$resolved] as $option) {
        expect($option['disabled'])->toBeFalse();
    }
});

test('resolveSelected returns authoritative labels for arbitrary ids with no search term applied', function () {
    ['municipality' => $municipality] = makeGeographyTree();

    $results = (new SearchGeographyEntries)->resolveSelected([(string) $municipality->id]);

    expect($results)->toHaveCount(1)
        ->and($results[0]['label'])->toBe('Gijón (Asturias)');
});

test('resolveSelected throws UnresolvedSelectionException naming every unresolvable id', function () {
    ['country' => $country] = makeGeographyTree();

    $caught = null;

    try {
        (new SearchGeographyEntries)->resolveSelected([(string) $country->id, '999999998', '999999999']);
    } catch (UnresolvedSelectionException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull()
        ->and($caught->missingIds)->toEqualCanonicalizing(['999999998', '999999999']);
});

// Phase 4 security-audit finding (test gap, not a code defect): no test previously exercised a
// term containing a LIKE wildcard character, so removing the resolver's own addcslashes() call
// left the suite green. A literal '%' in a search term must be matched literally, never as a
// wildcard.
test('a search term containing a LIKE wildcard character is matched literally, not as a wildcard', function () {
    makeCountryEntry('100% Free Zone');
    makeCountryEntry('1000 Something Else');

    $results = (new SearchGeographyEntries)->search(normalizedGeographyName('100%'), 20);

    expect(collect($results)->pluck('label')->all())->toBe(['100% Free Zone']);
});
