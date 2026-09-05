<?php

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\Products\CreateProductVariant;
use App\Actions\Products\DeriveVariantSku;
use App\Actions\Products\GenerateProductVariantCombinations;
use App\Actions\Products\HashVariantCombination;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0029b -- App\Actions\Products\GenerateProductVariantCombinations. Every combination goes
// through the ordinary App\Actions\Products\CreateProductVariant (D-G3); this file tests the
// generator's OWN concerns -- the two-pass validation of attributeTypeIds, the batch cap computed
// from value-set sizes rather than a materialised cartesian product, the skip/refuse outcome
// semantics, and the once-only authorization gate -- never the SKU derivation or the hash
// algorithm themselves (both already covered by CreateProductVariant's own suite).

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

afterEach(function () {
    ProductVariant::flushEventListeners();
});

/**
 * @return array{0: ProductAttributeType, 1: array<int, ProductAttributeValue>}
 */
function generatorTestType(string $name, array $values, int $typePosition = 0): array
{
    $type = ProductAttributeType::factory()->create(['name' => $name, 'position' => $typePosition]);

    $rows = [];

    foreach (array_values($values) as $index => $value) {
        $rows[] = ProductAttributeValue::factory()->create([
            'product_attribute_type_id' => $type->id,
            'value' => $value,
            'position' => $index,
        ]);
    }

    return [$type, $rows];
}

function generatorTestActor(): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');

    return $actor;
}

/**
 * A bulk-inserted attribute type with N values, for tests whose value count
 * would make per-row factory creation slow -- mirrors
 * ProductVariantValidationBoundsTest.php's own bulk-insert pattern.
 */
function generatorTestBulkType(string $name, int $count, int $typePosition = 0): ProductAttributeType
{
    $type = ProductAttributeType::factory()->create(['name' => $name, 'position' => $typePosition]);

    $now = now();
    $rows = collect(range(1, $count))->map(fn (int $i): array => [
        'id' => (string) Str::uuid7(),
        'product_attribute_type_id' => $type->id,
        'value' => "V{$i}",
        'position' => $i,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('product_attribute_values')->insert($rows->all());

    return $type;
}

// =====================================================================
// The core cartesian generation
// =====================================================================

test('generating combinations creates one variant per combination and exactly N pivot rows', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = generatorTestType('Talla', ['38', '39', '40'], 0);
    [$color] = generatorTestType('Color', ['Black', 'White'], 1);

    $result = app(GenerateProductVariantCombinations::class)($product, [$talla->id, $color->id]);

    expect($result['created'])->toHaveCount(6)
        ->and($result['skipped'])->toHaveCount(0)
        ->and($result['refused'])->toHaveCount(0)
        ->and($result['attempted'])->toBe(6)
        ->and(ProductVariant::count())->toBe(6)
        ->and(DB::table('product_variant_values')->count())->toBe(12);
});

test('a single attribute type generates one variant per value', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = generatorTestType('Talla', ['38', '39', '40']);

    $result = app(GenerateProductVariantCombinations::class)($product, [$talla->id]);

    expect($result['created'])->toHaveCount(3)
        ->and(ProductVariant::count())->toBe(3);
});

test('every generated SKU is the ordinary derivation, in D-G6 iteration order, asserted as literal strings', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = generatorTestType('Talla', ['38', '39'], 0);
    [$color] = generatorTestType('Color', ['Black'], 1);

    app(GenerateProductVariantCombinations::class)($product, [$talla->id, $color->id]);

    $skus = $product->variants()->pluck('sku')->all();

    expect($skus)->toBe(['0002-38-Black', '0002-39-Black']);
});

test('the position sequence follows D-G6 order, asserted as an exact ordered SKU array', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = generatorTestType('Talla', ['38', '39', '40'], 0);
    [$color] = generatorTestType('Color', ['Black', 'White'], 1);

    app(GenerateProductVariantCombinations::class)($product, [$talla->id, $color->id]);

    $ordered = $product->variants()->pluck('sku')->all();

    expect($ordered)->toBe([
        '0002-38-Black', '0002-38-White',
        '0002-39-Black', '0002-39-White',
        '0002-40-Black', '0002-40-White',
    ]);

    // Positions are assigned sequentially by CreateProductVariant's own MAX(position)+1, and each
    // call must see the PREVIOUS call's write even though all six run inside this batch's single
    // outer transaction (InnoDB always makes a transaction's own writes visible to itself).
    expect($product->variants()->pluck('position')->all())->toBe([0, 1, 2, 3, 4, 5]);
});

test('price and stock (D-G4): every generated variant carries the parent price as a string and stock 0, with featured_media_id literally NULL', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002', 'price' => '19.99']);
    [$talla] = generatorTestType('Talla', ['38', '39']);

    app(GenerateProductVariantCombinations::class)($product, [$talla->id]);

    $variants = $product->variants()->get();

    expect($variants)->toHaveCount(2);

    foreach ($variants as $variant) {
        expect($variant->price)->toBe('19.99')
            ->and($variant->stock)->toBe(0)
            ->and($variant->featured_media_id)->toBeNull();
    }
});

// =====================================================================
// D-G2: skip vs. refuse outcome semantics
// =====================================================================

test('the second run skips combinations that already exist, without touching them, and reports the split', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla, $values] = generatorTestType('Talla', ['38', '39', '40']);

    app(CreateProductVariant::class)($product, [$values[0]->id], '19.99', 5);
    $existing = ProductVariant::where('product_id', $product->id)->sole();
    $existingUpdatedAt = $existing->updated_at;

    $result = app(GenerateProductVariantCombinations::class)($product, [$talla->id]);

    expect($result['created'])->toHaveCount(2)
        ->and($result['skipped'])->toHaveCount(1)
        ->and($result['refused'])->toHaveCount(0)
        ->and($result['attempted'])->toBe(3)
        ->and(ProductVariant::where('product_id', $product->id)->count())->toBe(3);

    $existing->refresh();

    expect($existing->price)->toBe('19.99')
        ->and($existing->stock)->toBe(5)
        ->and($existing->updated_at->equalTo($existingUpdatedAt))->toBeTrue();
});

test('a skip does not re-price: a custom price on an existing variant survives regeneration', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002', 'price' => '19.99']);
    [$talla, $values] = generatorTestType('Talla', ['38', '39']);

    $variant = app(CreateProductVariant::class)($product, [$values[0]->id], '19.99', 5);
    $variant->update(['price' => '25.00', 'stock' => 1]);

    app(GenerateProductVariantCombinations::class)($product, [$talla->id]);

    expect($variant->fresh()->price)->toBe('25.00')
        ->and($variant->fresh()->stock)->toBe(1);
});

test('a SKU collision is refused, not fatal, and the rest of the batch still commits, with zero orphan pivot rows', function () {
    $this->actingAs(generatorTestActor());
    Product::factory()->create(['sku' => '0002-39']); // the conflicting product
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = generatorTestType('Talla', ['38', '39', '40']);

    $result = app(GenerateProductVariantCombinations::class)($product, [$talla->id]);

    expect($result['created'])->toHaveCount(2)
        ->and($result['skipped'])->toHaveCount(0)
        ->and($result['refused'])->toHaveCount(1)
        ->and($result['refused'][0]['sku'])->toBe('0002-39')
        ->and($result['refused'][0]['message'])->toContain('0002-39')
        ->and(ProductVariant::where('product_id', $product->id)->count())->toBe(2);

    $refusedVariant = ProductVariant::where('sku', '0002-39')->where('product_id', $product->id)->first();
    expect($refusedVariant)->toBeNull();

    // Zero orphan pivot rows for the refused combination: the refused combination's value id
    // must not appear in product_variant_values against a non-existent variant.
    expect(DB::table('product_variant_values')->count())->toBe(2); // 2 created x 1 value each
});

// FP-G2: a batch where nothing is skipped and nothing is refused cannot distinguish the three
// code paths -- toHaveCount(N) alone is satisfied by an implementation that skips and refuses
// nothing. This is the one fixture in the file that produces a non-empty value in EACH of
// created/skipped/refused at once, in a single generation call.
test('the whole created/skipped/refused/attempted shape is correct on one batch that exercises all three outcomes at once', function () {
    $this->actingAs(generatorTestActor());
    Product::factory()->create(['sku' => '0002-39']); // forces the 39 combination to be refused
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla, $values] = generatorTestType('Talla', ['38', '39', '40']);

    app(CreateProductVariant::class)($product, [$values[0]->id], '19.99', 5); // 38 already exists

    $result = app(GenerateProductVariantCombinations::class)($product, [$talla->id]);

    expect($result['created'])->toHaveCount(1) // 40
        ->and($result['skipped'])->toHaveCount(1) // 38 -- skipped, NOT refused
        ->and($result['refused'])->toHaveCount(1) // 39
        ->and($result['refused'][0]['sku'])->toBe('0002-39')
        ->and($result['attempted'])->toBe(3);

    expect($result['created']->first()->sku)->toBe('0002-40');
});

test('an unexpected failure mid-batch rolls the whole batch back', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = generatorTestType('Talla', ['38', '39', '40']);

    $attempts = 0;

    ProductVariant::creating(function () use (&$attempts): void {
        $attempts++;

        if ($attempts === 3) {
            throw new RuntimeException('simulated unexpected failure');
        }
    });

    $caught = null;

    try {
        app(GenerateProductVariantCombinations::class)($product, [$talla->id]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(RuntimeException::class)
        ->and(ProductVariant::where('product_id', $product->id)->count())->toBe(0)
        ->and(DB::table('product_variant_values')->count())->toBe(0);
});

// =====================================================================
// D-G5: the batch cap
// =====================================================================

test('the batch cap refuses before writing, naming the limit and the attempted count, with a boundary pair', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    // Exactly MAX_COMBINATIONS (200): a single type with 200 values.
    $exact = generatorTestBulkType('Exact', 200);

    $result = app(GenerateProductVariantCombinations::class)($product, [$exact->id]);
    expect($result['attempted'])->toBe(200)
        ->and($result['created'])->toHaveCount(200);

    // One over the limit, on a fresh product: 201 values.
    $productB = Product::factory()->create(['sku' => '0003']);
    $over = generatorTestBulkType('Over', 201);

    $caught = null;

    try {
        app(GenerateProductVariantCombinations::class)($productB, [$over->id]);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull()
        ->and($caught->validator->errors()->get('attributeTypeIds'))->toHaveCount(1)
        ->and($caught->validator->errors()->first('attributeTypeIds'))->toContain('200')->toContain('201')
        ->and(ProductVariant::where('product_id', $productB->id)->count())->toBe(0);
});

test('the cap is computed without materialising the product (D-G5)', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);

    $typeIds = [];

    foreach (range(1, 5) as $t) {
        [$type] = generatorTestType("Type{$t}", array_map(fn (int $i): string => "V{$i}", range(1, 20)), $t);
        $typeIds[] = $type->id;
    }

    $before = memory_get_peak_usage(true);

    $caught = null;

    try {
        app(GenerateProductVariantCombinations::class)($product, $typeIds);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    $peakGrowth = memory_get_peak_usage(true) - $before;

    expect($caught)->not->toBeNull()
        ->and($caught->validator->errors()->first('attributeTypeIds'))->toContain('3200000')
        // A materialise-then-count implementation would allocate millions of PHP arrays here;
        // a multiply-the-sizes one allocates nothing proportional to the attempted count.
        ->and($peakGrowth)->toBeLessThan(64 * 1024 * 1024)
        ->and(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

test('the empty-type check runs before the cap multiplication (D-G6)', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    $emptyType = ProductAttributeType::factory()->create(['name' => 'Empty', 'position' => 0]);
    $big = generatorTestBulkType('Big', 201, 1);

    $caught = null;

    try {
        app(GenerateProductVariantCombinations::class)($product, [$emptyType->id, $big->id]);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull()
        ->and($caught->validator->errors()->first('attributeTypeIds'))->toContain('Empty')
        ->and(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

test('a selected type with no values is refused on attributeTypeIds naming the type, with zero rows written', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    $emptyType = ProductAttributeType::factory()->create(['name' => 'Material']);

    $caught = null;

    try {
        app(GenerateProductVariantCombinations::class)($product, [$emptyType->id]);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull()
        ->and($caught->validator->errors()->first('attributeTypeIds'))->toContain('Material')
        ->and(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

// =====================================================================
// D-G8: two-pass validation
// =====================================================================

test('unknown, duplicated, and empty type-id inputs are refused, each on attributeTypeIds, writing zero rows', function (array $ids) {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);

    $caught = null;

    try {
        app(GenerateProductVariantCombinations::class)($product, $ids);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull()
        ->and($caught->validator->errors()->has('attributeTypeIds'))->toBeTrue()
        ->and(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
})->with([
    'unknown id' => [[(string) Str::uuid7()]],
    'empty array' => [[]],
]);

test('a duplicated type id in the submission is refused on attributeTypeIds', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = generatorTestType('Talla', ['38']);

    $caught = null;

    try {
        app(GenerateProductVariantCombinations::class)($product, [$talla->id, $talla->id]);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull()
        ->and($caught->validator->errors()->has('attributeTypeIds'))->toBeTrue()
        ->and(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

test('an oversized attributeTypeIds submission issues zero product_attribute_types existence queries and returns one error message', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);

    // FP-G3-style warm-up: prime the permission cache/gate evaluation before counting.
    try {
        app(GenerateProductVariantCombinations::class)($product, []);
    } catch (Throwable) {
        // expected -- warming up only.
    }

    $oversized = array_map(fn () => (string) Str::uuid7(), range(1, 2000));

    $queries = 0;
    DB::listen(function ($query) use (&$queries): void {
        if (str_contains($query->sql, 'product_attribute_types')) {
            $queries++;
        }
    });

    $caught = null;

    try {
        app(GenerateProductVariantCombinations::class)($product, $oversized);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull()
        ->and($queries)->toBe(0)
        ->and($caught->validator->errors()->get('attributeTypeIds'))->toHaveCount(1)
        ->and(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

test('no product_attribute_types query ever carries more bindings than the max:5 cap allows, for an oversized REAL submission', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);

    $now = now();
    $rows = collect(range(1, 2000))->map(fn (int $i): array => [
        'id' => (string) Str::uuid7(),
        'name' => "Type-{$i}",
        'position' => $i,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    DB::table('product_attribute_types')->insert($rows->all());
    $ids = $rows->pluck('id')->all();

    $bindingCounts = [];
    DB::listen(function ($query) use (&$bindingCounts): void {
        if (str_contains($query->sql, 'product_attribute_types')) {
            $bindingCounts[] = count($query->bindings);
        }
    });

    $caught = null;

    try {
        app(GenerateProductVariantCombinations::class)($product, $ids);
    } catch (ValidationException $e) {
        $caught = $e;
    }

    expect($caught)->not->toBeNull();

    // The 2,000-id submission never reaches a product_attribute_types query at all (D-G8 pass 1
    // throws first) -- an empty array here is the CORRECT outcome for this fixture, but it also
    // means this assertion alone cannot distinguish "bounded" from "never reached". The second
    // half of this test, immediately below, is what actually exercises the query with a real
    // binding list to bound.
    expect($bindingCounts)->toBeEmpty();
    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(0);

    // The positive half: exactly 5 of those same 2,000 real ids DO reach the type read-back
    // query (D-G8's own two passes both pass for 5 legitimate existing ids), so this is the
    // fixture that can actually fail against an implementation binding the whole submitted array
    // rather than the validated, bounded one.
    $bindingCounts = [];
    $fiveIds = array_slice($ids, 0, 5);

    $caught = null;

    try {
        app(GenerateProductVariantCombinations::class)($product, $fiveIds);
    } catch (ValidationException $e) {
        $caught = $e; // expected -- these 5 bare types have no values, so D-G6 refuses them
    }

    expect($caught)->not->toBeNull()
        ->and($bindingCounts)->not->toBeEmpty();

    foreach ($bindingCounts as $count) {
        expect($count)->toBeLessThanOrEqual(5);
    }

    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

// =====================================================================
// D-G0: authorization
// =====================================================================

test('an actor without products.edit is refused, learns neither the attempted count nor the empty type, zero rows are written, and the refusal is logged against the parent product', function () {
    $product = Product::factory()->create(['sku' => '0002']);
    $emptyType = ProductAttributeType::factory()->create(['name' => 'SecretType']);
    $big = generatorTestBulkType('Big', 201, 1);

    $actor = User::factory()->create();
    $this->actingAs($actor);

    Log::spy();

    $caught = null;

    try {
        app(GenerateProductVariantCombinations::class)($product, [$emptyType->id, $big->id]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class)
        ->and($caught->getMessage())->not->toContain('SecretType')
        ->and($caught->getMessage())->not->toContain('201')
        ->and(ProductVariant::where('product_id', $product->id)->count())->toBe(0);

    Log::shouldHaveReceived('warning')
        ->withArgs(function (string $message, array $context) use ($actor, $product): bool {
            expect($message)->toBe('Privileged action refused')
                ->and($context['actor_id'] ?? null)->toBe($actor->id)
                ->and($context['ability'] ?? null)->toBe('update')
                ->and($context['target_type'] ?? null)->toBe('product')
                ->and($context['target_id'] ?? null)->toBe($product->id);

            $encoded = json_encode($context);

            return ! str_contains((string) $encoded, 'SecretType') && ! str_contains((string) $encoded, '201');
        })
        ->once();
});

test('a Super Admin with zero permission rows passes', function () {
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = generatorTestType('Talla', ['38']);

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    $result = app(GenerateProductVariantCombinations::class)($product, [$talla->id]);

    expect($result['created'])->toHaveCount(1);
});

test('the gate is asked once, not per row, across a successful multi-combination run', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = generatorTestType('Talla', ['38', '39', '40']);
    [$color] = generatorTestType('Color', ['Black', 'White'], 1);

    // A counting decorator around the SAME class both the generator and CreateProductVariant
    // constructor-inject: since both authorize the identical (ability, target) pair, the only
    // way to tell "gate once, up front" apart from "discover the refusal mid-batch" is a raw
    // call count, not the call's arguments.
    $counter = new class extends LogRefusedPrivilegedAttempt
    {
        public int $calls = 0;

        public function authorize(
            string $ability,
            mixed $gateTarget,
            ?User $actor = null,
            ?string $targetType = null,
            int|string|null $targetId = null,
        ): void {
            $this->calls++;

            parent::authorize($ability, $gateTarget, $actor, $targetType, $targetId);
        }
    };

    $this->app->instance(LogRefusedPrivilegedAttempt::class, $counter);

    $result = app(GenerateProductVariantCombinations::class)($product, [$talla->id, $color->id]);

    // 6 created variants + 1 for the generator's OWN up-front gate = 7 total calls to
    // authorize() -- CreateProductVariant's own per-row gate (D-G0 point 3) is expected and
    // separate, never a second generator-level gate call per row.
    expect($result['created'])->toHaveCount(6)
        ->and($counter->calls)->toBe(7);
});

// =====================================================================
// D-G2: the pre-read is one query, and does not N+1
// =====================================================================

test('the pre-read of existing combinations is one query, and does not scale with the combination count', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = generatorTestType('Talla', ['38', '39', '40']);
    [$color] = generatorTestType('Color', ['Black', 'White'], 1);

    // Throwaway warm-up call so the permission cache load doesn't skew the count.
    $warmupProduct = Product::factory()->create(['sku' => '0099']);
    [$warmupType] = generatorTestType('Warmup', ['x']);
    app(GenerateProductVariantCombinations::class)($warmupProduct, [$warmupType->id]);

    $preReadQueries = 0;
    DB::listen(function ($query) use (&$preReadQueries): void {
        if (str_starts_with($query->sql, 'select `combination_hash`')) {
            $preReadQueries++;
        }
    });

    app(GenerateProductVariantCombinations::class)($product, [$talla->id, $color->id]);

    expect($preReadQueries)->toBe(1);
});

// =====================================================================
// The global consistency invariant (0029 D-4.3) holds over generated rows too
// =====================================================================

test('every generated variant\'s stored sku still equals the derivation of its current inputs', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = generatorTestType('Talla', ['38', '39'], 0);
    [$color] = generatorTestType('Color', ['Black'], 1);

    app(GenerateProductVariantCombinations::class)($product, [$talla->id, $color->id]);

    $variants = ProductVariant::where('product_id', $product->id)->with('product', 'values')->get();

    expect($variants)->toHaveCount(2);

    foreach ($variants as $variant) {
        $orderedValues = $variant->values->pluck('value')->all();
        $expected = app(DeriveVariantSku::class)->checked($variant->product->sku, $orderedValues);

        expect($variant->sku)->toBe($expected);
    }
});

// =====================================================================
// The race: a concurrent insert between the pre-read and this combination's own attempt
// =====================================================================

test('a combination inserted concurrently between the pre-read and this batch\'s own attempt is skipped, never a 500 and never a duplicate', function () {
    $this->actingAs(generatorTestActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla, $values] = generatorTestType('Talla', ['38', '39'], 0);
    $racedValueId = $values[1]->id; // '39' -- processed second

    $raceFired = false;

    ProductVariant::creating(function () use (&$raceFired, $product, $racedValueId): void {
        if ($raceFired) {
            return;
        }

        $raceFired = true;

        $hash = app(HashVariantCombination::class)([$racedValueId]);

        DB::table('product_variants')->insert([
            'id' => (string) Str::uuid7(),
            'product_id' => $product->id,
            'combination_hash' => $hash,
            'sku' => '0002-RACE-INSERTED',
            'price' => '19.99',
            'stock' => 0,
            'featured_media_id' => null,
            'position' => 99,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    $caught = null;

    try {
        $result = app(GenerateProductVariantCombinations::class)($product, [$talla->id]);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeNull();
    expect($result['created'])->toHaveCount(1) // '38' only -- '39' loses the race
        ->and($result['skipped'])->toHaveCount(1)
        ->and($result['refused'])->toHaveCount(0);
});
