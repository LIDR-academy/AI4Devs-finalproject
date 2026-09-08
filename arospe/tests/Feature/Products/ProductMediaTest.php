<?php

use App\Actions\Products\CreateProduct;
use App\Actions\Products\SyncProductGallery;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0024, Phase 3 (TDD "red" step): App\Actions\Products\SyncProductGallery,
// App\Models\Product and the product_media migration do not exist yet.
//
// Per the task file: MediaFactory (0019) fakes paths without touching disk — so no
// Storage::fake('public') and no file-existence assertions belong here; asserting a file exists
// would be asserting the factory, not this story's own code.
//
// SyncProductGallery::__invoke(Product $product, ?string $featuredMediaId, array
// $orderedGalleryMediaIds): void is given VERBATIM by the task file (D-17b) — no ambiguity here,
// unlike CreateProduct/UpdateProduct (see CreateProductTest.php's file banner for those).

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);
    $this->actingAs($actor);
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function mediaTestProductPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Runner Pro',
        'sku' => 'RNR-'.Str::random(10),
        'productCategoryId' => ProductCategory::factory()->create()->id,
        'type' => 'physical',
        'status' => 'active',
        'price' => '19.99',
        'stock' => 5,
        'description' => null,
        'featuredMediaId' => null,
        'orderedGalleryMediaIds' => [],
    ], $overrides);
}

// =====================================================================
// featured_media_id validation, via CreateProduct
// =====================================================================

test('a nonexistent or malformed featured_media_id is refused', function (mixed $malformed) {
    $caught = null;

    try {
        app(CreateProduct::class)(...mediaTestProductPayload(['featuredMediaId' => $malformed]));
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('featured_media_id');

    expect(Product::count())->toBe(0);
})->with([
    'a well-formed but nonexistent media id' => [(string) Str::uuid7()],
    'a malformed media id' => ['not-a-uuid'],
]);

test('featured_media_id is nullable, and the accessor returns null when none is set', function () {
    $product = app(CreateProduct::class)(...mediaTestProductPayload(['featuredMediaId' => null]));

    expect($product->fresh()->featured_media_id)->toBeNull()
        ->and($product->fresh()->featuredImage)->toBeNull();
});

// D-9: the featured image and the gallery are independent — setting one must not implicitly
// populate the other. If left unasserted, story 0027 inherits an ambiguous "remove image".
test('setting a featured image creates no gallery pivot row', function () {
    $product = Product::factory()->create();
    $media = Media::factory()->create();

    app(SyncProductGallery::class)($product, $media->id, []);

    expect($product->fresh()->featured_media_id)->toBe($media->id)
        ->and($product->fresh()->gallery)->toHaveCount(0);
});

// =====================================================================
// Gallery pivot semantics
// =====================================================================

test('syncing the gallery to [a, b] over an existing [b, c] leaves exactly [a, b]', function () {
    $product = Product::factory()->create();
    $a = Media::factory()->create();
    $b = Media::factory()->create();
    $c = Media::factory()->create();

    app(SyncProductGallery::class)($product, null, [$b->id, $c->id]);
    app(SyncProductGallery::class)($product, null, [$a->id, $b->id]);

    $galleryIds = $product->fresh()->gallery->pluck('id')->all();

    expect($galleryIds)->toEqualCanonicalizing([$a->id, $b->id])
        ->and($galleryIds)->not->toContain($c->id);
});

test('attaching the same media twice via the input array yields exactly one pivot row', function () {
    $product = Product::factory()->create();
    $media = Media::factory()->create();

    app(SyncProductGallery::class)($product, null, [$media->id, $media->id]);

    expect(DB::table('product_media')->where('product_id', $product->id)->where('media_id', $media->id)->count())->toBe(1);
});

// The shared-library premise of 0019: both products keep the same media, and detaching from one
// leaves the other's row intact.
test('the same media used by two products is kept independently by each', function () {
    $productA = Product::factory()->create();
    $productB = Product::factory()->create();
    $shared = Media::factory()->create();

    app(SyncProductGallery::class)($productA, null, [$shared->id]);
    app(SyncProductGallery::class)($productB, null, [$shared->id]);

    app(SyncProductGallery::class)($productA, null, []);

    expect($productA->fresh()->gallery)->toHaveCount(0)
        ->and($productB->fresh()->gallery->pluck('id')->all())->toBe([$shared->id]);
});

// =====================================================================
// D-17: position is the caller's 0-based array index — four assertions, because the first two
// alone would pass against an append-only implementation.
// =====================================================================

test('gallery order round-trips and position is the caller\'s 0-based array index', function () {
    $product = Product::factory()->create();
    $a = Media::factory()->create();
    $b = Media::factory()->create();
    $c = Media::factory()->create();

    app(SyncProductGallery::class)($product, null, [$a->id, $b->id, $c->id]);

    // (a) the literal pivot values, not merely the read-back order.
    $this->assertDatabaseHas('product_media', ['product_id' => $product->id, 'media_id' => $a->id, 'position' => 0]);
    $this->assertDatabaseHas('product_media', ['product_id' => $product->id, 'media_id' => $b->id, 'position' => 1]);
    $this->assertDatabaseHas('product_media', ['product_id' => $product->id, 'media_id' => $c->id, 'position' => 2]);

    // (b) the relationship reads back in exactly that order.
    expect($product->fresh()->gallery->pluck('id')->all())->toBe([$a->id, $b->id, $c->id]);

    // (c) the reorder — the assertion that goes red against a naive MAX(position) + 1
    // implementation: the SAME three pivot rows must now carry position 0, 1, 2 belonging to
    // c, a, b respectively, never a fourth appended row.
    app(SyncProductGallery::class)($product, null, [$c->id, $a->id, $b->id]);

    expect(DB::table('product_media')->where('product_id', $product->id)->count())->toBe(3);
    $this->assertDatabaseHas('product_media', ['product_id' => $product->id, 'media_id' => $c->id, 'position' => 0]);
    $this->assertDatabaseHas('product_media', ['product_id' => $product->id, 'media_id' => $a->id, 'position' => 1]);
    $this->assertDatabaseHas('product_media', ['product_id' => $product->id, 'media_id' => $b->id, 'position' => 2]);
    expect($product->fresh()->gallery->pluck('id')->all())->toBe([$c->id, $a->id, $b->id]);

    // (d) positions stay contiguous after a removal — syncing [a, c] over the current [c, a, b]
    // leaves exactly two rows, at position 0 and 1, with no gap at 1 and no row left at 2.
    app(SyncProductGallery::class)($product, null, [$a->id, $c->id]);

    expect(DB::table('product_media')->where('product_id', $product->id)->count())->toBe(2);
    $this->assertDatabaseHas('product_media', ['product_id' => $product->id, 'media_id' => $a->id, 'position' => 0]);
    $this->assertDatabaseHas('product_media', ['product_id' => $product->id, 'media_id' => $c->id, 'position' => 1]);
    $this->assertDatabaseMissing('product_media', ['product_id' => $product->id, 'media_id' => $b->id]);
});

// Guards the "0027 just resubmits the array" premise of D-17: a reorder is one transaction, one
// shape of call — resubmitting an unchanged array is a no-op in effect.
test('resubmitting an unchanged gallery array is a no-op in effect, same rows and positions', function () {
    $product = Product::factory()->create();
    $a = Media::factory()->create();
    $b = Media::factory()->create();

    app(SyncProductGallery::class)($product, null, [$a->id, $b->id]);
    app(SyncProductGallery::class)($product, null, [$a->id, $b->id]);

    expect(DB::table('product_media')->where('product_id', $product->id)->count())->toBe(2);
    $this->assertDatabaseHas('product_media', ['product_id' => $product->id, 'media_id' => $a->id, 'position' => 0]);
    $this->assertDatabaseHas('product_media', ['product_id' => $product->id, 'media_id' => $b->id, 'position' => 1]);
});

test('a duplicated id in the input array yields exactly one pivot row and a total order, never a 23000', function () {
    $product = Product::factory()->create();
    $a = Media::factory()->create();
    $b = Media::factory()->create();

    app(SyncProductGallery::class)($product, null, [$a->id, $b->id, $a->id]);

    expect(DB::table('product_media')->where('product_id', $product->id)->count())->toBe(2);
    expect($product->fresh()->gallery->pluck('id')->all())->toBe([$a->id, $b->id]);
});

// R-6, narrowed by D-17: the action itself can no longer produce a tie (every row gets an
// explicit index), so only a raw insert bypassing the action can still exercise the
// position/media_id tiebreak.
test('two rows written by a raw insert with no explicit position still come back in a stable order', function () {
    $product = Product::factory()->create();
    $rows = collect([Media::factory()->create(), Media::factory()->create()])
        ->sortBy('id')
        ->values();

    DB::table('product_media')->insert([
        ['product_id' => $product->id, 'media_id' => $rows[0]->id],
        ['product_id' => $product->id, 'media_id' => $rows[1]->id],
    ]);

    expect($product->fresh()->gallery->pluck('id')->all())->toBe([$rows[0]->id, $rows[1]->id]);
});

// =====================================================================
// RQ-2: the media FKs really restrict — the only executable proof of D-9 until a media-delete
// story exists.
// =====================================================================

test('a media row referenced as a product\'s featured image cannot be deleted', function () {
    $product = Product::factory()->create();
    $media = Media::factory()->create();

    app(SyncProductGallery::class)($product, $media->id, []);

    expect(fn () => DB::table('media')->where('id', $media->id)->delete())->toThrow(QueryException::class);
    expect(Media::where('id', $media->id)->exists())->toBeTrue();
});

test('a media row referenced by a product_media pivot row cannot be deleted', function () {
    $product = Product::factory()->create();
    $media = Media::factory()->create();

    app(SyncProductGallery::class)($product, null, [$media->id]);

    expect(fn () => DB::table('media')->where('id', $media->id)->delete())->toThrow(QueryException::class);
    expect(Media::where('id', $media->id)->exists())->toBeTrue();
});

// The complement, so the restriction is not over-broad: deleting a PRODUCT succeeds and takes its
// product_media rows with it, leaving the media rows intact.
test('deleting a product removes its own gallery pivot rows and leaves the media rows intact', function () {
    $product = Product::factory()->create();
    $media = Media::factory()->create();

    app(SyncProductGallery::class)($product, null, [$media->id]);

    $product->delete();

    expect(DB::table('product_media')->where('product_id', $product->id)->exists())->toBeFalse()
        ->and(Media::where('id', $media->id)->exists())->toBeTrue();
});
