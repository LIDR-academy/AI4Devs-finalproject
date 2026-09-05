<?php

use App\Models\Media;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

// Story 0029, Phase 3 (TDD "red" step): App\Models\ProductVariant::displayFeaturedMediaId() does
// not exist yet. D-7: a variant's featured-image inheritance is resolved at READ time, never
// copied at creation -- the null pointer IS the inheritance flag, and it must stay null.

test('a variant created with no image persists featured_media_id as literally NULL', function () {
    $product = Product::factory()->withFeaturedImage()->create();

    $variant = ProductVariant::factory()->for($product)->inheritingImage()->create();

    // The storage-layer proof that no copy happened -- the only assertion that distinguishes a
    // read-time resolver from a copy-at-creation implementation BEFORE any resolution occurs.
    $this->assertDatabaseHas('product_variants', [
        'id' => $variant->id,
        'featured_media_id' => null,
    ]);
});

test('an inheriting variant resolves to the parent\'s featured image', function () {
    $parentImage = Media::factory()->create();
    $product = Product::factory()->create(['featured_media_id' => $parentImage->id]);

    $variant = ProductVariant::factory()->for($product)->inheritingImage()->create();

    expect($variant->displayFeaturedMediaId())->toBe($parentImage->id);
});

// FP2, the discriminating test: a copy-at-creation implementation returns the OLD image here and
// fails, while passing every other test in this file.
test('changing the parent\'s featured image changes what an inheriting variant resolves to', function () {
    $originalImage = Media::factory()->create();
    $newImage = Media::factory()->create();
    $product = Product::factory()->create(['featured_media_id' => $originalImage->id]);

    $variant = ProductVariant::factory()->for($product)->inheritingImage()->create();

    expect($variant->displayFeaturedMediaId())->toBe($originalImage->id);

    // featured_media_id is deliberately absent from Product's #[Fillable] (it's server-derived,
    // written only by SyncProductGallery), so update() silently drops it -- forceFill() is what
    // actually changes the stored value here.
    $product->forceFill(['featured_media_id' => $newImage->id])->save();

    expect($variant->fresh()->displayFeaturedMediaId())->toBe($newImage->id);
});

test('a variant with its own image resolves to its own', function () {
    $parentImage = Media::factory()->create();
    $ownImage = Media::factory()->create();
    $product = Product::factory()->create(['featured_media_id' => $parentImage->id]);

    $variant = ProductVariant::factory()->for($product)->create(['featured_media_id' => $ownImage->id]);

    expect($variant->displayFeaturedMediaId())->toBe($ownImage->id);
});

// Proves the fallback does not override an explicit choice.
test('changing the parent\'s featured image leaves a variant with its own image unchanged', function () {
    $ownImage = Media::factory()->create();
    $newParentImage = Media::factory()->create();
    $product = Product::factory()->withFeaturedImage()->create();

    $variant = ProductVariant::factory()->for($product)->create(['featured_media_id' => $ownImage->id]);

    // featured_media_id is deliberately absent from Product's #[Fillable] -- see the identical note
    // above. forceFill() is what actually exercises "the parent's image really did change".
    $product->forceFill(['featured_media_id' => $newParentImage->id])->save();

    expect($variant->fresh()->displayFeaturedMediaId())->toBe($ownImage->id);
});

test('a variant whose parent has no featured image resolves to null cleanly', function () {
    $product = Product::factory()->create(['featured_media_id' => null]);

    $variant = ProductVariant::factory()->for($product)->inheritingImage()->create();

    expect($variant->displayFeaturedMediaId())->toBeNull();
});

// R-D: a variants list must eager-load ['featuredImage', 'product.featuredImage'] or the accessor
// lazy-loads per row. Warm-up call first, per docs/errors-log.md's permission-cache-cold-load
// lesson (FP7) -- the first Gate/relation touch in a process absorbs a one-time cost unrelated to
// this query's own N+1 shape.
test('resolving displayFeaturedMediaId across a list of variants does not N+1', function () {
    Media::factory()->count(2)->create();
    $warmupProduct = Product::factory()->withFeaturedImage()->create();
    ProductVariant::factory()->for($warmupProduct)->inheritingImage()->create();

    $queryCountFor = function (int $variantCount): int {
        ProductVariant::query()->delete();
        Product::query()->delete();

        for ($i = 0; $i < $variantCount; $i++) {
            $product = Product::factory()->withFeaturedImage()->create();
            ProductVariant::factory()->for($product)->inheritingImage()->create();
        }

        $queries = 0;
        DB::listen(function () use (&$queries): void {
            $queries++;
        });

        ProductVariant::query()
            ->with(['featuredImage', 'product.featuredImage'])
            ->get()
            ->each(fn (ProductVariant $variant) => $variant->displayFeaturedMediaId());

        return $queries;
    };

    $queriesForOne = $queryCountFor(1);
    $queriesForTen = $queryCountFor(10);

    expect($queriesForTen)->toBe($queriesForOne);
});
