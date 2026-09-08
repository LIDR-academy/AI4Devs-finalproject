<?php

use App\Actions\Products\ResolveProductTaxRate;
use App\Actions\Products\SyncProductSalesRegions;
use App\Enums\TaxRateResolutionTier;
use App\Models\Product;
use App\Models\SalesRegion;

// Story 0026, Phase 3 (TDD "red" step). None of App\Actions\Products\ResolveProductTaxRate,
// App\Actions\Products\ResolvedTaxRate, App\Enums\TaxRateResolutionTier or
// Product::salesRegions() exist yet, so every test below is expected to fail red --
// "class/method not found" style -- until backend-expert implements them next.
//
// The most likely test-authoring mistake in this story, stated once here per the task file's own
// instruction: SalesRegionFactory::isDefault() is deliberately NOT the base state, so a test that
// forgets to layer it on has ZERO default rows and every fallback assertion resolves against
// nothing. Never hardcode SalesRegionSeeder::DEFAULT_SLUG -- these tests never seed; identify rows
// by the factory-returned instances.

// =====================================================================
// Direct match (AssignedRegion tier)
// =====================================================================

test('a product assigned to Canarias resolves to Canarias\'s own rate', function () {
    $peninsula = SalesRegion::factory()->create();
    $canarias = SalesRegion::factory()->withRate('7.500')->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$peninsula->id, $canarias->id]);

    $result = app(ResolveProductTaxRate::class)($product, $canarias);

    // Pinning only the value would pass against a `float` regression -- this is the story's
    // highest-value assertion.
    expect($result->rate)->toBe('7.500')
        ->and($result->rate)->toBeString();
});

test('the resolved rate names Canarias as the region and AssignedRegion as the tier', function () {
    $canarias = SalesRegion::factory()->withRate('7.500')->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$canarias->id]);

    $result = app(ResolveProductTaxRate::class)($product, $canarias);

    expect($result->region->id)->toBe($canarias->id)
        ->and($result->tier)->toBe(TaxRateResolutionTier::AssignedRegion);
});

// =====================================================================
// No match -> the default's rate (CatalogDefault tier)
// =====================================================================

// Three DISTINGUISHABLE rates in one test, so a wrong-tier bug cannot coincidentally produce the
// expected number: the assigned region's own rate, the unassigned destination's own rate (the
// decoy), and the default's rate.
test('when no assigned region matches the destination, the default entry\'s rate is used', function () {
    $assigned = SalesRegion::factory()->withRate('5.000')->create();
    $destination = SalesRegion::factory()->withRate('9.000')->create();
    $default = SalesRegion::factory()->isDefault()->withRate('21.000')->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$assigned->id]);

    $result = app(ResolveProductTaxRate::class)($product, $destination);

    expect($result->rate)->toBe('21.000')
        ->and($result->region->id)->toBe($default->id)
        ->and($result->tier)->toBe(TaxRateResolutionTier::CatalogDefault);
});

// The decoy that makes the test above non-trivial: the unassigned destination carries its OWN
// rate, and it must never be what comes back.
test('the destination\'s own rate is not used when the product is not assigned to it', function () {
    $destination = SalesRegion::factory()->withRate('9.000')->create();
    $default = SalesRegion::factory()->isDefault()->withRate('21.000')->create();
    $product = Product::factory()->create();

    $result = app(ResolveProductTaxRate::class)($product, $destination);

    expect($result->rate)->toBe('21.000')
        ->and($result->rate)->not->toBe('9.000')
        ->and($result->region->id)->toBe($default->id);
});

// =====================================================================
// D5 -- 0.000 is a real rate, at both tiers, never mistaken for unconfigured
// =====================================================================

test('a rate of zero on an assigned region is used, rather than falling back to the default', function () {
    $zeroRated = SalesRegion::factory()->withRate('0.000')->create();
    $default = SalesRegion::factory()->isDefault()->withRate('21.000')->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$zeroRated->id]);

    $result = app(ResolveProductTaxRate::class)($product, $zeroRated);

    expect($result->rate)->toBe('0.000')
        ->and($result->rate)->not->toBe('21.000')
        ->and($result->tier)->toBe(TaxRateResolutionTier::AssignedRegion);
});

test('a rate of zero on the default entry is used when nothing matches', function () {
    $default = SalesRegion::factory()->isDefault()->withRate('0.000')->create();
    $destination = SalesRegion::factory()->create();
    $product = Product::factory()->create();

    $result = app(ResolveProductTaxRate::class)($product, $destination);

    expect($result->rate)->toBe('0.000')
        ->and($result->rate)->not->toBeNull()
        ->and($result->tier)->toBe(TaxRateResolutionTier::CatalogDefault);
});

// =====================================================================
// D5 -- an entry with no configured rate yields no rate, never a substitution
// =====================================================================

// The unconfigured assigned region does NOT fall through to the default (D5) -- asserted using a
// default that carries a DISTINCT rate, so a fall-through bug would be caught by the very next
// assertion rather than coincidentally producing the right answer.
test('an unconfigured assigned region resolves to no rate, and does not fall through to the default', function () {
    $unconfigured = SalesRegion::factory()->create(); // base state: rate is null
    $default = SalesRegion::factory()->isDefault()->withRate('21.000')->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$unconfigured->id]);

    $result = app(ResolveProductTaxRate::class)($product, $unconfigured);

    expect($result->rate)->toBeNull()
        ->and($result->rate)->not->toBe('21.000')
        ->and($result->region->id)->toBe($unconfigured->id)
        ->and($result->tier)->toBe(TaxRateResolutionTier::AssignedRegion);
});

test('an unconfigured default entry resolves to no rate when nothing matches, never a thrown exception', function () {
    $default = SalesRegion::factory()->isDefault()->create(); // base state: rate is null
    $destination = SalesRegion::factory()->create();
    $product = Product::factory()->create();

    $result = app(ResolveProductTaxRate::class)($product, $destination);

    expect($result->rate)->toBeNull()
        ->and($result->region->id)->toBe($default->id)
        ->and($result->tier)->toBe(TaxRateResolutionTier::CatalogDefault);
});

// The pairing that proves the null-handling is not accidentally identical to the zero-handling,
// at the assigned-region tier.
test('at the assigned-region tier, null and 0.000 resolve to different, distinguishable answers', function () {
    $unconfigured = SalesRegion::factory()->create();
    $zeroRated = SalesRegion::factory()->withRate('0.000')->create();
    $productWithUnconfigured = Product::factory()->create();
    $productWithZero = Product::factory()->create();

    app(SyncProductSalesRegions::class)($productWithUnconfigured, [$unconfigured->id]);
    app(SyncProductSalesRegions::class)($productWithZero, [$zeroRated->id]);

    $unconfiguredResult = app(ResolveProductTaxRate::class)($productWithUnconfigured, $unconfigured);
    $zeroResult = app(ResolveProductTaxRate::class)($productWithZero, $zeroRated);

    expect($unconfiguredResult->rate)->toBeNull()
        ->and($zeroResult->rate)->toBe('0.000');
});

// The same pairing at the default (CatalogDefault) tier.
test('at the default tier, null and 0.000 resolve to different, distinguishable answers', function () {
    $unconfiguredDefault = SalesRegion::factory()->isDefault()->create();
    $unmatchedDestination = SalesRegion::factory()->create();
    $productAgainstUnconfigured = Product::factory()->create();

    $unconfiguredResult = app(ResolveProductTaxRate::class)($productAgainstUnconfigured, $unmatchedDestination);

    expect($unconfiguredResult->rate)->toBeNull();

    $unconfiguredDefault->delete();
    $zeroDefault = SalesRegion::factory()->isDefault()->withRate('0.000')->create();
    $productAgainstZero = Product::factory()->create();

    $zeroResult = app(ResolveProductTaxRate::class)($productAgainstZero, $unmatchedDestination);

    expect($zeroResult->rate)->toBe('0.000');
});

// =====================================================================
// D6 -- a disabled but still-assigned region keeps deciding the rate
// =====================================================================

test('a disabled but still-assigned region keeps deciding the rate, rather than the default', function () {
    $region = SalesRegion::factory()->withRate('7.500')->create();
    $default = SalesRegion::factory()->isDefault()->withRate('21.000')->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$region->id]);

    $region->is_active = false;
    $region->save();

    $result = app(ResolveProductTaxRate::class)($product, $region);

    expect($result->rate)->toBe('7.500')
        ->and($result->tier)->toBe(TaxRateResolutionTier::AssignedRegion);
});

// Phase 4 finding F-4: a caller may hand this action a Product whose `salesRegions` relation was
// already eager-loaded with a CONSTRAINED closure (Product::with(['salesRegions' => fn ($q) =>
// $q->active()])) -- a `loadMissing()`-based match would be a no-op against that pre-loaded,
// filtered collection and silently drop the deactivated-but-assigned region from the match,
// producing the WRONG (CatalogDefault) answer. This must still resolve to the region's own rate.
test('a deactivated-but-assigned region still decides the rate when the caller eager-loads salesRegions constrained to active-only', function () {
    $region = SalesRegion::factory()->withRate('7.500')->create();
    $default = SalesRegion::factory()->isDefault()->withRate('21.000')->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$region->id]);

    $region->is_active = false;
    $region->save();

    // The trap: pre-load the relation constrained to active-only, exactly the shape a caller
    // resolving many products might reach for to "optimise" the eager-load.
    $constrainedProduct = Product::with(['salesRegions' => fn ($query) => $query->active()])
        ->findOrFail($product->id);

    // Prove the trap is real: the constrained relation genuinely does NOT contain the deactivated
    // region, so a loadMissing()-based implementation would find nothing here.
    expect($constrainedProduct->salesRegions->pluck('id')->all())->not->toContain($region->id);

    $result = app(ResolveProductTaxRate::class)($constrainedProduct, $region);

    expect($result->rate)->toBe('7.500')
        ->and($result->rate)->not->toBe('21.000')
        ->and($result->tier)->toBe(TaxRateResolutionTier::AssignedRegion);
});

// =====================================================================
// D4 -- no hierarchy climbing, in either direction. No grouping tier exists (D10).
// =====================================================================

test('assigning a fiscal territory does not cover its parent', function () {
    $spain = SalesRegion::factory()->create();
    $peninsula = SalesRegion::factory()->fiscalTerritoryOf($spain)->withRate('21.000')->create();
    $canarias = SalesRegion::factory()->fiscalTerritoryOf($spain)->withRate('7.000')->create();
    $default = SalesRegion::factory()->isDefault()->withRate('15.000')->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$canarias->id]);

    $result = app(ResolveProductTaxRate::class)($product, $peninsula);

    expect($result->rate)->toBe('15.000')
        ->and($result->region->id)->toBe($default->id)
        ->and($result->tier)->toBe(TaxRateResolutionTier::CatalogDefault);
});

test('assigning a parent entry does not cover its fiscal territories', function () {
    $spain = SalesRegion::factory()->withRate('99.000')->create();
    $canarias = SalesRegion::factory()->fiscalTerritoryOf($spain)->withRate('7.000')->create();
    $default = SalesRegion::factory()->isDefault()->withRate('15.000')->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$spain->id]);

    $result = app(ResolveProductTaxRate::class)($product, $canarias);

    expect($result->rate)->toBe('15.000')
        ->and($result->region->id)->toBe($default->id)
        ->and($result->tier)->toBe(TaxRateResolutionTier::CatalogDefault);
});

test('a different country never matches -- with groupings gone, this is the whole no-match surface', function () {
    $francia = SalesRegion::factory()->withRate('20.000')->create();
    $portugal = SalesRegion::factory()->withRate('23.000')->create();
    $default = SalesRegion::factory()->isDefault()->withRate('15.000')->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$francia->id]);

    $result = app(ResolveProductTaxRate::class)($product, $portugal);

    expect($result->rate)->toBe('15.000')
        ->and($result->region->id)->toBe($default->id)
        ->and($result->tier)->toBe(TaxRateResolutionTier::CatalogDefault);
});

// =====================================================================
// Phase 4 finding F-5 -- deterministic tiebreak if the single-default
// invariant is ever violated (nothing in the database enforces it; see
// docs/database/schema.md's ⚠️ on sales_regions).
// =====================================================================

test('when two rows are flagged default, the older one (by created_at) wins, consistently across calls', function () {
    $older = SalesRegion::factory()->isDefault()->withRate('5.000')->create();
    $older->forceFill(['created_at' => now()->subDay()])->saveQuietly();

    $newer = SalesRegion::factory()->isDefault()->withRate('9.000')->create();
    $newer->forceFill(['created_at' => now()])->saveQuietly();

    $destination = SalesRegion::factory()->create();
    $product = Product::factory()->create();

    $first = app(ResolveProductTaxRate::class)($product, $destination);
    $second = app(ResolveProductTaxRate::class)($product, $destination);

    expect($first->region->id)->toBe($older->id)
        ->and($first->rate)->toBe('5.000')
        ->and($second->region->id)->toBe($older->id)
        ->and($second->rate)->toBe('5.000');
});

// =====================================================================
// D5 -- no default row at all is an invariant violation, not a silent null
// =====================================================================

// Asserted against a RuntimeException base class rather than a specific subclass name -- the task
// file names this "a thrown domain exception" following the ImmutableRoleException precedent
// (app/Exceptions/, extends RuntimeException) without naming the concrete class, so pinning the
// base class is what proves it without guessing at a name backend-expert has not chosen yet.
test('resolving with no default row at all throws a domain exception, not a silent null', function () {
    $destination = SalesRegion::factory()->create();
    $product = Product::factory()->create();

    expect(fn () => app(ResolveProductTaxRate::class)($product, $destination))
        ->toThrow(RuntimeException::class);
});

// =====================================================================
// Type pinning at both tiers -- a branch doing (string) $default->rate would turn null into ''
// and '0.000' into '0'.
// =====================================================================

test('the resolved rate is a genuine string at the assigned-region tier', function () {
    $region = SalesRegion::factory()->withRate('12.345')->create();
    $product = Product::factory()->create();

    app(SyncProductSalesRegions::class)($product, [$region->id]);

    $result = app(ResolveProductTaxRate::class)($product, $region);

    expect($result->rate)->toBeString()
        ->and($result->rate)->toBe('12.345');
});

test('the resolved rate is a genuine string at the default tier, never coerced from null or zero', function () {
    $default = SalesRegion::factory()->isDefault()->withRate('12.345')->create();
    $destination = SalesRegion::factory()->create();
    $product = Product::factory()->create();

    $result = app(ResolveProductTaxRate::class)($product, $destination);

    expect($result->rate)->toBeString()
        ->and($result->rate)->toBe('12.345');
});
