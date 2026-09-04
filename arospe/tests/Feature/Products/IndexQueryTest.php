<?php

// The list query's own shape -- a named risk per the story's D-4, split into its own file. WRITTEN
// AGAINST THE ORIGINAL (pre-0076) query shape, which is still what runs today: an explicit-column
// select() naming `products.name` directly, `orderBy('name')->orderBy('id')`, and two eager loads
// (`category:id,name`, `featuredImage:id,title,path,webp_path,avif_path`). The 0076 correction that
// replaces `orderBy('name')` with `orderByTranslatedName()` does not apply -- 0076 is not built.
//
// Written at TDD Phase 3 step 1 (red), before App\Livewire\Products\Index exists.

use App\Livewire\Products\Index;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.view');
    $this->actingAs($actor);
});

test('the list query selects explicit columns and never selects description', function () {
    // 0024 R-9: a SELECT * (or any select naming description) drags a MEDIUMTEXT out of the
    // clustered index on every row of a paginated list. Captured with DB::listen() and asserted
    // on the real SQL, per the story's own instruction -- an assertion on rendered output could
    // never catch an over-fetching SELECT.
    Product::factory()->count(3)->create();

    $capturedSelects = [];

    DB::listen(function ($query) use (&$capturedSelects): void {
        if (str_contains($query->sql, 'from `products`') || str_contains($query->sql, 'from "products"')) {
            $capturedSelects[] = $query->sql;
        }
    });

    Livewire::test(Index::class)->get('products');

    expect($capturedSelects)->not->toBeEmpty();

    foreach ($capturedSelects as $sql) {
        expect($sql)->not->toContain('description')
            ->and($sql)->not->toContain('select *');
    }
});

test('the list query eager-loads the category and featured image with no N+1', function () {
    // 10 products with 10 DISTINCT categories and 10 DISTINCT featured images -- distinct
    // relations are load-bearing, since identical ones would pass through Eloquent's identity map
    // and hide the defect. The query count for 10 must equal the count for 1, plus or minus the
    // paginator's own COUNT(*) query.
    //
    // Warm the acting user's permission-relation cache BEFORE either counted run. Index::products()
    // calls Gate::allows('update'|'delete', $product) per row (ProductPolicy::update()/delete(),
    // both hasPermissionTo() calls), and Spatie's PermissionRegistrar lazily loads and caches the
    // whole roles+permissions graph on the FIRST such check per test -- one-time queries entirely
    // unrelated to this list query's own N+1 shape. Without this warm-up, whichever of the two
    // counted calls runs first absorbs that one-time cost and the two counts diverge for a reason
    // that has nothing to do with eager loading (docs/errors-log.md).
    Gate::allows('update', Product::factory()->create());
    Product::query()->delete();

    $queryCountFor = function (int $productCount): int {
        Product::query()->delete();

        for ($i = 0; $i < $productCount; $i++) {
            Product::factory()->create([
                'product_category_id' => ProductCategory::factory()->create()->id,
                'featured_media_id' => Media::factory()->create()->id,
            ]);
        }

        $queries = 0;
        DB::listen(function () use (&$queries): void {
            $queries++;
        });

        Livewire::test(Index::class)->get('products')->items();

        return $queries;
    };

    $countForOne = $queryCountFor(1);
    $countForTen = $queryCountFor(10);

    expect($countForTen)->toBe($countForOne);
});

test('pagination returns the next pages rows and the correct total', function () {
    // D-4: paginate(25). 30 products across two pages -- page 2 holds exactly the remaining 5.
    Product::factory()->count(30)->sequence(fn ($sequence) => [
        'name' => sprintf('Product %03d', $sequence->index),
    ])->create();

    $page1 = Livewire::test(Index::class)->get('products');
    expect($page1->total())->toBe(30)
        ->and($page1->count())->toBe(25);

    $page2 = Livewire::test(Index::class)
        ->call('gotoPage', 2)
        ->get('products');

    expect($page2->currentPage())->toBe(2)
        ->and($page2->count())->toBe(5)
        ->and($page2->total())->toBe(30);
});
