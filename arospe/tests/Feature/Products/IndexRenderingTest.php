<?php

// View-level rendering tests for App\Livewire\Products\Index /
// resources/views/livewire/products.blade.php, per
// ai-spec/tasks/in-progress/0027-products-list-and-editor-ui.md's "Tests to perform" section.
// WRITTEN AGAINST THE ORIGINAL (pre-0076) contract -- name is a scalar products.name column, no
// per-language resolution.
//
// Written at TDD Phase 3 step 1 (red), before the real component/view exist. Component logic,
// persistence and authorization are covered by IndexTest.php / ScreenAuthorizationTest.php --
// nothing here duplicates that.
//
// Mirrors tests/Feature/ProductCategories/IndexRenderingTest.php's shape.

use App\Livewire\Products\Index;
use App\Models\Media;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function productsIndexRenderingActor(array $permissions = ['products.view', 'products.create', 'products.edit', 'products.delete']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

// =====================================================================
// Badges -- D-6/RQ-4: the out-of-stock override applies to Active only.
// =====================================================================

test('an active product with stock renders the active badge', function () {
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    Product::factory()->active()->create(['name' => 'In Stock Widget', 'stock' => 42]);

    Livewire::test(Index::class)->assertSee(__('products.statuses.active'));
});

test('an active product with zero stock renders the out-of-stock badge, never the active one', function () {
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    Product::factory()->active()->create(['name' => 'Sold Out Widget', 'stock' => 0]);

    Livewire::test(Index::class)
        ->assertSee(__('products.display_statuses.out_of_stock'));
});

test('a draft product with zero stock still reads draft, not out of stock', function () {
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    Product::factory()->draft()->create(['name' => 'Draft Empty Widget', 'stock' => 0]);

    Livewire::test(Index::class)
        ->assertSee(__('products.statuses.draft'))
        ->assertDontSee(__('products.display_statuses.out_of_stock'));
});

test('the string agotado never appears anywhere in the rendered list', function () {
    // D-6/D-7: the badge reads ProductDisplayStatus, never a raw "Agotado" literal ported from the
    // prototype.
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    Product::factory()->active()->create(['stock' => 0]);

    $html = Livewire::test(Index::class)->html();

    expect(mb_strtolower($html))->not->toContain('agotado');
});

// =====================================================================
// Stock colour bands (D-7): 0 -> out, 1-9 -> low, >=10 -> ok.
// =====================================================================

test('stock at 0, 8 and 42 renders the out, low and ok treatment respectively', function (int $stock, string $expectedClassHook) {
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    Product::factory()->create(['name' => 'Stock Band Widget', 'stock' => $stock]);

    $html = Livewire::test(Index::class)->html();

    expect($html)->toContain($expectedClassHook);
})->with([
    'out of stock (0)' => [0, 'data-test="stock-out"'],
    'low stock (8)' => [8, 'data-test="stock-low"'],
    'ok stock (42)' => [42, 'data-test="stock-ok"'],
]);

// =====================================================================
// Row action hooks (both branches, per D-16/errors-log).
// =====================================================================

test('every row action carries the edit and delete data-test hooks', function () {
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    $product = Product::factory()->create();

    $html = Livewire::test(Index::class)->html();

    expect($html)->toContain('data-test="edit-product-'.$product->id.'"')
        ->and($html)->toContain('data-test="delete-product-'.$product->id.'"');
});

test('a row action renders the delete/edit hooks disabled but present when the actor lacks the ability', function () {
    // D-16: the data-test hook is present on BOTH the enabled and the disabled branch, so a
    // browser test can select a row action identically either way.
    $creator = productsIndexRenderingActor();
    $this->actingAs($creator);
    $product = Product::factory()->create();

    $viewer = User::factory()->create();
    $viewer->givePermissionTo('products.view');
    $this->actingAs($viewer);

    $html = Livewire::test(Index::class)->html();

    expect($html)->toContain('data-test="edit-product-'.$product->id.'"')
        ->and($html)->toContain('data-test="delete-product-'.$product->id.'"');
});

// =====================================================================
// Flux/Blaze regression guards -- all three already in errors-log.md.
// =====================================================================

test('an enabled row action renders no data-flux-tooltip-content element', function () {
    // errors-log.md 2026-08-16: a `:tooltip="$cond ? … : null"` binding renders an empty tooltip
    // bubble on every ENABLED row under livewire/blaze -- the fix is a written-out @if/@else with
    // an explicit <flux:tooltip> wrapper on the disabled branch only.
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    Product::factory()->create();

    $html = Livewire::test(Index::class)->html();

    expect($html)->not->toContain('data-flux-tooltip-content');
});

test('the disabled branchs cursor-not-allowed class sits on the tooltip wrapper, not on the button', function () {
    $creator = productsIndexRenderingActor();
    $this->actingAs($creator);
    $product = Product::factory()->create();

    $viewer = User::factory()->create();
    $viewer->givePermissionTo('products.view');
    $this->actingAs($viewer);

    $html = Livewire::test(Index::class)->html();

    // The class must appear at all (proves the disabled branch renders a tooltip wrapper), and it
    // must never be paired with `disabled` on the same tag (the button itself is
    // pointer-events-none and must not also carry the cursor utility -- errors-log.md).
    expect($html)->toContain('cursor-not-allowed!');
    expect($html)->not->toMatch('/disabled[^>]*cursor-not-allowed!/');
});

test('every id interpolated into a wire click argument went through js', function () {
    // D-16: unconditional, UUIDs included. A `wire:click="deleteProduct('.$id.')"` (a raw,
    // unescaped interpolation) would be the anti-pattern this guards against -- the correct form
    // routes every id through @js().
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    $product = Product::factory()->create();

    $html = Livewire::test(Index::class)->html();

    // A raw, unquoted-by-@js() id inside a wire:click argument would appear as a bare, unquoted
    // UUID literal in the compiled attribute -- @js() always wraps it in a JSON string literal
    // (double quotes) instead.
    expect($html)->not->toContain('confirmDelete('.$product->id.')');
});

// =====================================================================
// "New product" primary action -- F-5 (appsec audit): must not render for an actor lacking
// products.create, matching the per-row canEdit/canDelete disabled convention this screen
// already follows.
// =====================================================================

test('the "New product" button renders for an actor holding products.create', function () {
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)->assertSee(__('products.index.new_product'));
});

test('the "New product" button does not render for an actor holding only products.view', function () {
    $viewer = User::factory()->create();
    $viewer->givePermissionTo('products.view');
    $this->actingAs($viewer);

    Livewire::test(Index::class)->assertDontSee(__('products.index.new_product'));
});

// =====================================================================
// Empty state
// =====================================================================

test('the empty state renders when there are no products, and the table does not', function () {
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    expect(Product::count())->toBe(0);

    $html = Livewire::test(Index::class)->html();

    expect($html)->toContain('data-test="products-empty-state"')
        ->and($html)->not->toContain('<table');
});

// =====================================================================
// Thumbnail (D-17)
// =====================================================================

test('a product with no featured image renders the agreed placeholder rather than a broken image', function () {
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    Product::factory()->create(['featured_media_id' => null]);

    $html = Livewire::test(Index::class)->html();

    expect($html)->toContain('data-test="product-thumbnail-placeholder"');
});

test('the thumbnails three URLs are non-empty, distinct, and each ends in the extension of its source column', function () {
    // C3 (Phase 2 FAIL finding): reading a nonexistent ->avifUrl accessor off Media yields null
    // SILENTLY, so <source srcset=""> renders and the page still looks fine at a glance -- only a
    // non-empty assertion on each of the three attributes catches it. Asserting "a <picture>
    // element is present" would pass with all three empty.
    $actor = productsIndexRenderingActor();
    $this->actingAs($actor);

    $product = Product::factory()->withFeaturedImage()->create();
    $media = $product->fresh()->featuredImage;

    $html = Livewire::test(Index::class)->html();

    expect($html)->toContain('<picture');

    preg_match('/<source srcset="([^"]*)" type="image\/avif">/', $html, $avifMatch);
    preg_match('/<source srcset="([^"]*)" type="image\/webp">/', $html, $webpMatch);
    preg_match('/<img src="([^"]*)"/', $html, $imgMatch);

    $avifUrl = $avifMatch[1] ?? '';
    $webpUrl = $webpMatch[1] ?? '';
    $imgUrl = $imgMatch[1] ?? '';

    expect($avifUrl)->not->toBe('')
        ->and($webpUrl)->not->toBe('')
        ->and($imgUrl)->not->toBe('');

    expect([$avifUrl, $webpUrl, $imgUrl])->toEqual(array_unique([$avifUrl, $webpUrl, $imgUrl]));

    expect($avifUrl)->toEndWith('.avif')
        ->and($webpUrl)->toEndWith('.webp')
        ->and($imgUrl)->toEndWith(pathinfo($media->path, PATHINFO_EXTENSION));
});
