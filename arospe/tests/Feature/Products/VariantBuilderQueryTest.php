<?php

// Story 0031, Phase 3 (TDD "red" step): App\Livewire\Products\VariantBuilder does not exist yet.
// D-6's corrected eager-load list (featuredImage AND values.type -- 0029's own R-D names only the
// first and would N+1 twice per row on the combination column), the two-axis N+1 guard (FP-V11),
// and the pagination query shape (D-17).

use App\Actions\Products\CreateProductVariant;
use App\Livewire\Products\VariantBuilder;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
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
    $actor->givePermissionTo(['products.view', 'products.edit']);
    $this->actingAs($actor);
});

/**
 * @return array{0: ProductAttributeType, 1: ProductAttributeValue}
 */
function variantQueryTestAttribute(string $typeName, string $value): array
{
    $type = ProductAttributeType::factory()->create(['name' => $typeName]);
    $productAttributeValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => $value,
        'position' => 0,
    ]);

    return [$type, $productAttributeValue];
}

test('the variants list eager-loads featuredImage and values.type with no N+1 as the variant count grows', function () {
    $product = Product::factory()->create(['sku' => '0001']);

    // 0029 FP7: the first Gate::authorize()/Gate::allows() cold-loads the whole Spatie
    // roles+permissions graph -- a one-time cost entirely unrelated to this query's own N+1 shape.
    // Warmed BEFORE either counted run, mirroring tests/Feature/Products/IndexQueryTest.php.
    Gate::allows('update', $product);

    $queryCountFor = function (int $variantCount) use ($product): int {
        DB::table('product_variants')->where('product_id', $product->id)->delete();

        for ($i = 0; $i < $variantCount; $i++) {
            // A FRESH type per iteration -- product_attribute_types.name carries a UNIQUE index, so
            // a fixed literal reused across the loop (or across queryCountFor's two calls) would
            // collide from the second iteration onward. Faker's own default unique name generation
            // is used instead of a hand-typed literal for exactly that reason.
            $type = ProductAttributeType::factory()->create();
            $value = ProductAttributeValue::factory()->create(['product_attribute_type_id' => $type->id]);
            app(CreateProductVariant::class)($product, [$value->id], '19.99', 5, Media::factory()->create()->id);
        }

        $queries = 0;
        DB::listen(function () use (&$queries): void {
            $queries++;
        });

        Livewire::test(VariantBuilder::class, ['productId' => $product->id])->html();

        return $queries;
    };

    $countForOne = $queryCountFor(1);
    $countForTen = $queryCountFor(10);

    expect($countForTen)->toBe($countForOne);
});

test('growing the values-per-variant axis alone still shows no N+1 on the values pivot', function () {
    // FP-V11: growing only the variant count cannot detect an N+1 on the `values` pivot -- the very
    // relation D-6 found missing from 0029's own R-D. Ten variants with ONE value each vs ten with
    // THREE values each, variant count held fixed.
    $product = Product::factory()->create(['sku' => '0001']);

    Gate::allows('update', $product);

    $queryCountFor = function (int $valuesPerVariant) use ($product): int {
        DB::table('product_variants')->where('product_id', $product->id)->delete();

        for ($i = 0; $i < 10; $i++) {
            $valueIds = [];
            for ($v = 0; $v < $valuesPerVariant; $v++) {
                // Default, faker-unique type names (never a hand-typed literal reused across BOTH
                // calls of this closure) -- product_attribute_types.name carries a UNIQUE index, and
                // a repeated literal would collide the second time this closure runs.
                $type = ProductAttributeType::factory()->create();
                $valueIds[] = ProductAttributeValue::factory()->create([
                    'product_attribute_type_id' => $type->id,
                ])->id;
            }
            app(CreateProductVariant::class)($product, $valueIds, '19.99', 5);
        }

        $queries = 0;
        DB::listen(function () use (&$queries): void {
            $queries++;
        });

        Livewire::test(VariantBuilder::class, ['productId' => $product->id])->html();

        return $queries;
    };

    $countForOneValue = $queryCountFor(1);
    $countForThreeValues = $queryCountFor(3);

    expect($countForThreeValues)->toBe($countForOneValue);
});

test('the eager-loaded combination label and thumbnail render correctly, not merely issue the query', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [$talla, $m] = variantQueryTestAttribute('Talla', 'M');
    $ownImage = Media::factory()->create(['title' => 'Own Thumbnail']);
    app(CreateProductVariant::class)($product, [$m->id], '19.99', 5, $ownImage->id);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id]);

    $component->assertSee('Talla')
        ->assertSee('M')
        ->assertSee('Own Thumbnail');
});

test('pagination renders 25 rows on page 1 and 5 on page 2, with the query count on page 2 no worse than page 1', function () {
    // D-17: ->paginate(25), matching 0027 D-4's page size. Deliberately TIED position values, or
    // the sku tiebreak that makes pagination safe across the page boundary is never exercised.
    $product = Product::factory()->create(['sku' => '0001']);

    for ($i = 0; $i < 30; $i++) {
        $type = ProductAttributeType::factory()->create(['name' => "Type{$i}"]);
        $value = ProductAttributeValue::factory()->create([
            'product_attribute_type_id' => $type->id,
            'value' => sprintf('V%02d', $i),
        ]);
        $variant = app(CreateProductVariant::class)($product, [$value->id], '19.99', 5);
        // Force every row onto the same position so only the sku tiebreak can order them.
        DB::table('product_variants')->where('id', $variant->id)->update(['position' => 0]);
    }

    Gate::allows('update', $product);

    $page1 = Livewire::test(VariantBuilder::class, ['productId' => $product->id])->get('variants');
    expect($page1->total())->toBe(30)
        ->and($page1->count())->toBe(25);

    $queriesOnPage1 = 0;
    DB::listen(function () use (&$queriesOnPage1): void {
        $queriesOnPage1++;
    });
    Livewire::test(VariantBuilder::class, ['productId' => $product->id])->get('variants');
    $queriesOnPage1Total = $queriesOnPage1;

    $page2Component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('gotoPage', 2);

    $queriesOnPage2 = 0;
    DB::listen(function () use (&$queriesOnPage2): void {
        $queriesOnPage2++;
    });
    $page2 = $page2Component->get('variants');

    expect($page2->currentPage())->toBe(2)
        ->and($page2->count())->toBe(5)
        ->and($page2->total())->toBe(30);

    // The paginator's own COUNT(*) query is the only allowance -- page 2 must not issue
    // meaningfully more queries than page 1 (a per-row N+1 would multiply, not merely add one).
    expect($queriesOnPage2)->toBeLessThanOrEqual($queriesOnPage1Total + 1);

    // The order is total across the page boundary: page 1's last sku sorts before page 2's first.
    $page1Skus = $page1->pluck('sku')->all();
    $page2Skus = $page2->pluck('sku')->all();

    expect(end($page1Skus))->toBeLessThan(reset($page2Skus));
});
