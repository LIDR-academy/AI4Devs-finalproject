<?php

use App\Actions\NormalizeForSearch;
use App\Actions\Products\SearchSalesRegions;
use App\Exceptions\UnresolvedSelectionException;
use App\Models\SalesRegion;
use Illuminate\Support\Str;

// Story 0026, Phase 3 (TDD "red" step). App\Actions\Products\SearchSalesRegions does not exist
// yet, so every test below is expected to fail red -- "class/method not found" style -- until
// backend-expert implements it next. It implements story 0022's locked
// App\Livewire\Components\MultiSelectOptionsResolver interface.
//
// search() and resolveSelected() answer DELIBERATELY DIFFERENT questions (D7), and $term arrives
// at search() ALREADY NORMALIZED by the shell -- these tests fold every needle through the real
// App\Actions\NormalizeForSearch rather than hand-rolling Str::lower()/iconv(), matching what the
// shell actually does and what the resolver's own haystack-side folding must match against.

/**
 * @return array<int, string>
 */
function idsOf(mixed $results): array
{
    return collect($results)->pluck('id')->all();
}

// =====================================================================
// search() -- assignable() entries only: active, and not a heading over fiscal territories
// =====================================================================

test('searching Espana returns the five fiscal territories and not the Espana heading itself', function () {
    $spain = SalesRegion::factory()->create(['name' => 'España']);
    $peninsula = SalesRegion::factory()->fiscalTerritoryOf($spain)->create(['name' => 'Península']);
    $baleares = SalesRegion::factory()->fiscalTerritoryOf($spain)->create(['name' => 'Baleares']);
    $canarias = SalesRegion::factory()->fiscalTerritoryOf($spain)->create(['name' => 'Canarias']);
    $ceuta = SalesRegion::factory()->fiscalTerritoryOf($spain)->create(['name' => 'Ceuta']);
    $melilla = SalesRegion::factory()->fiscalTerritoryOf($spain)->create(['name' => 'Melilla']);

    $term = app(NormalizeForSearch::class)('España');

    $results = app(SearchSalesRegions::class)->search($term, 50);

    expect(idsOf($results))->toEqualCanonicalizing([
        $peninsula->id, $baleares->id, $canarias->id, $ceuta->id, $melilla->id,
    ]);
    expect(idsOf($results))->not->toContain($spain->id);
});

test('searching a territory\'s own name returns it', function () {
    $spain = SalesRegion::factory()->create(['name' => 'España']);
    $canarias = SalesRegion::factory()->fiscalTerritoryOf($spain)->create(['name' => 'Canarias']);

    $term = app(NormalizeForSearch::class)('Canarias');

    $results = app(SearchSalesRegions::class)->search($term, 50);

    expect(idsOf($results))->toContain($canarias->id);
});

test('an inactive region is absent from search(), and enabling it makes it appear', function () {
    $region = SalesRegion::factory()->inactive()->create(['name' => 'Ruritania']);

    $term = app(NormalizeForSearch::class)('Ruritania');

    expect(idsOf(app(SearchSalesRegions::class)->search($term, 50)))->not->toContain($region->id);

    $region->is_active = true;
    $region->save();

    expect(idsOf(app(SearchSalesRegions::class)->search($term, 50)))->toContain($region->id);
});

test('a region with children is absent from search() even when active', function () {
    $spain = SalesRegion::factory()->create(['name' => 'España']);
    SalesRegion::factory()->fiscalTerritoryOf($spain)->create();

    $term = app(NormalizeForSearch::class)('España');

    expect(idsOf(app(SearchSalesRegions::class)->search($term, 50)))->not->toContain($spain->id);
});

test('search() honours $limit', function () {
    SalesRegion::factory()->count(5)->create(['name' => 'Ruritanian Territory']);

    $term = app(NormalizeForSearch::class)('Ruritanian Territory');

    $results = app(SearchSalesRegions::class)->search($term, 2);

    expect($results)->toHaveCount(2);
});

// =====================================================================
// resolveSelected() -- vouches for every currently-assigned id regardless of is_active (D7);
// throws for an id absent from the catalog entirely (0022 D12).
// =====================================================================

test('resolveSelected() vouches for a since-deactivated assigned id and marks it disabled', function () {
    $region = SalesRegion::factory()->create();

    $region->is_active = false;
    $region->save();

    $results = app(SearchSalesRegions::class)->resolveSelected([$region->id]);

    expect($results)->toHaveCount(1);
    expect($results[0]['id'])->toBe($region->id);
    expect($results[0]['disabled'])->toBeTrue();
});

test('resolveSelected() throws UnresolvedSelectionException when an id is absent from the catalog', function () {
    $missingId = (string) Str::uuid();

    $caught = null;

    try {
        app(SearchSalesRegions::class)->resolveSelected([$missingId]);
    } catch (UnresolvedSelectionException $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(UnresolvedSelectionException::class)
        ->and($caught->missingIds)->toBe([$missingId]);
});

// =====================================================================
// Shape -- every returned row matches 0022's exact array{id, label, group, disabled} shape.
// =====================================================================

test('every returned row matches the exact option shape, with id a string and group null', function () {
    $region = SalesRegion::factory()->create(['name' => 'Ruritania']);

    $term = app(NormalizeForSearch::class)('Ruritania');

    $searchResults = app(SearchSalesRegions::class)->search($term, 50);
    $resolvedResults = app(SearchSalesRegions::class)->resolveSelected([$region->id]);

    foreach ([$searchResults, $resolvedResults] as $results) {
        expect($results)->not->toBe([]);

        foreach ($results as $row) {
            expect($row)->toHaveKeys(['id', 'label', 'group', 'disabled']);
            expect($row['id'])->toBeString();
            expect($row['label'])->toBeString();
            expect($row['group'])->toBeNull();
            expect($row['disabled'])->toBeBool();
        }
    }
});
