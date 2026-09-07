<?php

// Story 0031a, Phase 3 (TDD "red" step): the cartesian generator UI composed onto 0031's
// App\Livewire\Products\VariantBuilder. GenerateProductVariantCombinations's own BEHAVIOUR --
// cartesian expansion, iteration order, savepoint isolation, MAX_COMBINATIONS, the empty-type
// refusal, the one-query duplicate pre-read -- is 0029b's and is NOT re-tested here
// (what-not-to-test.md). What is only provable here is that the UI passes the right axes IN and
// renders the right summary OUT, plus the one thing no backend test can reach: that a partial
// batch's `refused` rows are VISIBLE.

use App\Actions\Products\CreateProductVariant;
use App\Actions\Products\GenerateProductVariantCombinations;
use App\Livewire\Products\VariantBuilder;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Livewire\Features\SupportLockedProperties\CannotUpdateLockedPropertyException;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<int, string>  $permissions
 */
function variantGeneratorActor(array $permissions = ['products.view', 'products.edit']): User
{
    $actor = User::factory()->create();
    $actor->givePermissionTo($permissions);

    return $actor;
}

/**
 * @param  array<int, string>  $values
 * @return array{0: ProductAttributeType, 1: Collection<int, ProductAttributeValue>}
 */
function variantGeneratorType(string $name, array $values, int $position = 0): array
{
    $type = ProductAttributeType::factory()->create(['name' => $name, 'position' => $position]);

    $rows = collect($values)->values()->map(
        fn (string $value, int $index): ProductAttributeValue => ProductAttributeValue::factory()->create([
            'product_attribute_type_id' => $type->id,
            'value' => $value,
            'position' => $index,
        ]),
    );

    return [$type, $rows];
}

// =====================================================================
// D-17.1: the axis picker -- pre-selection and the full catalog listing
// =====================================================================

test('the axis picker pre-selects the types this products existing variants already use, and offers an unused type unchecked', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla, $tallaValues] = variantGeneratorType('Talla', ['38', '39'], 0);
    [$acabado] = variantGeneratorType('Acabado', ['Mate'], 1);

    app(CreateProductVariant::class)($product, [$tallaValues->first()->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal');

    expect($component->get('attributeTypeIds'))
        ->toBe([$talla->id])
        ->not->toContain($acabado->id);
});

test('a product with no variants pre-selects nothing, and the picker still lists every type', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    variantGeneratorType('Talla', ['38', '39']);
    variantGeneratorType('Color', ['Black', 'White']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal');

    expect($component->get('attributeTypeIds'))->toBe([]);
    expect($component->instance()->attributeTypes())->toHaveCount(2);
});

// =====================================================================
// D-17.1: the live combination count
// =====================================================================

test('the live combination count multiplies the selected types own value counts', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', ['38', '39', '40'], 0);
    [$color] = variantGeneratorType('Color', ['Black', 'White'], 1);

    // 3 x 2 = 6, never 2 x 2 -- a squared fixture would pass against an implementation that
    // sums, adds, or reads one factor twice.
    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id, $color->id]);

    expect($component->instance()->generateCombinationCount())->toBe(6);
});

test('the live combination count is zero while nothing is selected', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal');

    expect($component->instance()->generateCombinationCount())->toBe(0);
});

// =====================================================================
// D-17.2: exactly the checked ids reach the action, in the order the picker renders
// =====================================================================

test('generateCombinations passes exactly the checked type ids to the action', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', ['38', '39'], 0);
    [$color] = variantGeneratorType('Color', ['Black'], 1);
    // A third catalog type deliberately left UNCHECKED (FP-V19): a UI that ignored the
    // checkboxes and generated across every type in the catalog would still pass a
    // single-type fixture, so a real test needs at least one unchecked type to catch it.
    variantGeneratorType('Acabado', ['Mate'], 2);

    $spy = Mockery::mock(GenerateProductVariantCombinations::class);
    $spy->shouldReceive('__invoke')
        ->once()
        ->withArgs(fn (Product $p, array $ids): bool => $p->is($product) && $ids === [$talla->id, $color->id])
        ->andReturn(['created' => collect(), 'skipped' => [], 'refused' => [], 'attempted' => 0]);
    $this->instance(GenerateProductVariantCombinations::class, $spy);

    Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id, $color->id])
        ->call('generateCombinations');
});

// =====================================================================
// D-17.3: a successful call closes the modal and renders the summary
// =====================================================================

test('a successful generation closes the modal and leaves the summary panel rendered', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', ['38', '39']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id])
        ->call('generateCombinations');

    expect($component->get('showGenerateModal'))->toBeFalse();
    $component->assertSee(__('products.variants.generate.result_title'));
});

test('the summary renders 0029bs own summary key with the created count', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', ['38', '39']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id])
        ->call('generateCombinations');

    $component->assertSee(trans_choice('products.variants.generate.summary', 2, ['count' => 2]));
});

// =====================================================================
// D-17.3: the refused/created/skipped mix -- the single highest-value case in this file
// =====================================================================

test('a batch mixing created, skipped and refused reports all three outcomes correctly, scoped to the summary panel', function () {
    // R-12 / the task's own Phase-3 reviewer check: at least one test must arrange a batch with
    // ALL THREE outcomes at once, since that is the one fixture that exercises every rendering
    // group in D-17.3 simultaneously -- created=1 (40), skipped=1 (38, already a variant),
    // refused=1 (39, another product already holds the SKU it would derive).
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla, $values] = variantGeneratorType('Talla', ['38', '39', '40']);

    app(CreateProductVariant::class)($product, [$values->firstWhere('value', '38')->id], '19.99', 5);

    // Another product already holds the SKU the Talla-39 combination would derive
    // ("0002-39") -- the identical fixture the Gherkin scenario names.
    Product::factory()->create(['sku' => '0002-39']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id])
        ->call('generateCombinations');

    expect(ProductVariant::where('product_id', $product->id)->where('sku', '0002-38')->exists())->toBeTrue();
    expect(ProductVariant::where('product_id', $product->id)->where('sku', '0002-40')->exists())->toBeTrue();
    expect(ProductVariant::where('product_id', $product->id)->where('sku', '0002-39')->exists())->toBeFalse();

    // FP-V20's third leg: counts, database, AND rendered row -- a count alone is not a state.
    $summary = $component->get('generationSummary');
    expect($summary['created'])->toBe(1)
        ->and($summary['skipped'])->toHaveCount(1)
        ->and($summary['refused'])->toHaveCount(1);

    // FP-V22: every summary assertion scoped to the panel itself, never page-wide -- extracted
    // once here so "Talla 39"/"0002-39" cannot coincidentally match something outside it.
    $html = $component->html();
    $panelStart = mb_strpos($html, 'data-test="generate-summary"');
    expect($panelStart)->not->toBeFalse();
    $panel = mb_substr($html, $panelStart);

    expect($panel)->toContain('data-test="generate-summary-refused"');
    expect($panel)->toContain('data-test="generate-summary-refused-row"');
    expect($panel)->toContain('Talla 39');
    expect($panel)->toContain('0002-39');
    expect($panel)->toContain('data-test="generate-summary-skipped"');
});

test('a skipped combination is rendered neutrally, outside the danger callout', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla, $values] = variantGeneratorType('Talla', ['38', '39']);

    app(CreateProductVariant::class)($product, [$values->first()->id], '19.99', 5);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id])
        ->call('generateCombinations');

    $html = $component->html();

    $skippedPos = mb_strpos($html, 'data-test="generate-summary-skipped"');
    $refusedPos = mb_strpos($html, 'data-test="generate-summary-refused"');

    expect($skippedPos)->not->toBeFalse();
    expect($refusedPos)->toBeFalse();
});

test('a skipped combinations existing variant is not re-saved', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla, $values] = variantGeneratorType('Talla', ['38', '39']);

    // Non-default price AND stock -- what CreateProductVariant would default to (the product's
    // own price, stock 0) would make a wrongly re-saved row indistinguishable from the correct
    // untouched one (FP-V21).
    $existing = app(CreateProductVariant::class)($product, [$values->first()->id], '55.00', 12);

    Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id])
        ->call('generateCombinations');

    $existing->refresh();

    expect($existing->price)->toBe('55.00');
    expect($existing->stock)->toBe(12);
});

// =====================================================================
// D-17.1: the pre-flight over-limit warning renders while the picker is still open, before the
// administrator ever submits -- code-reviewer finding N3 (previously unpinned).
// =====================================================================

test('the over-limit warning callout renders live once the selection exceeds the batch limit', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', array_map(fn (int $i): string => (string) $i, range(1, 15)), 0);
    [$color] = variantGeneratorType('Color', array_map(fn (int $i): string => "C{$i}", range(1, 15)), 1);

    // 15 x 15 = 225 > GenerateProductVariantCombinations::MAX_COMBINATIONS (200) -- the identical
    // fixture the refusal test below submits, but here only SELECTED, never confirmed.
    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id, $color->id]);

    $component->assertSeeHtml('data-test="generate-over-limit-warning"');
    $component->assertSee((string) GenerateProductVariantCombinations::MAX_COMBINATIONS);

    // No write happened -- this is a live, pre-submit warning, not a refusal.
    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

test('the over-limit warning callout is absent while the selection is within the batch limit', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', ['38', '39']);

    Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id])
        ->assertDontSeeHtml('data-test="generate-over-limit-warning"');
});

// =====================================================================
// D-17.3: a wholly refused call writes nothing, renders no summary, leaves the modal open
// =====================================================================

test('a selection over the batch limit is refused before anything is written, and the modal stays open', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', array_map(fn (int $i): string => (string) $i, range(1, 15)), 0);
    [$color] = variantGeneratorType('Color', array_map(fn (int $i): string => "C{$i}", range(1, 15)), 1);

    // 15 x 15 = 225 > GenerateProductVariantCombinations::MAX_COMBINATIONS (200).
    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id, $color->id])
        ->call('generateCombinations');

    $component->assertHasErrors('attributeTypeIds');
    expect($component->get('showGenerateModal'))->toBeTrue();
    expect($component->get('generationSummary'))->toBeNull();
    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

test('an attribute type with no values is refused by name, and the modal stays open', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', ['38']);
    $color = ProductAttributeType::factory()->create(['name' => 'Color', 'position' => 1]);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id, $color->id])
        ->call('generateCombinations');

    $component->assertHasErrors('attributeTypeIds');
    $component->assertSee(__('products.variants.generate.empty_type', ['type' => 'Color']));
    expect($component->get('showGenerateModal'))->toBeTrue();
    expect($component->get('generationSummary'))->toBeNull();
    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

test('generating with nothing selected is refused with the friendlier client side message, and auto renders on attributeTypeIds with no explicit flux error', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    variantGeneratorType('Talla', ['38']);

    $spy = Mockery::mock(GenerateProductVariantCombinations::class);
    $spy->shouldNotReceive('__invoke');
    $this->instance(GenerateProductVariantCombinations::class, $spy);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->call('generateCombinations');

    $component->assertHasErrors('attributeTypeIds');
    $component->assertSee(__('products.variants.generate.no_types_selected'));
    expect($component->get('showGenerateModal'))->toBeTrue();
    expect($component->get('generationSummary'))->toBeNull();
});

// =====================================================================
// D-17.3: the summary's lifecycle -- cleared by the next generation and by explicit dismiss,
// survives an unrelated round trip
// =====================================================================

test('dismissGenerationSummary clears the summary', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', ['38']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id])
        ->call('generateCombinations');

    expect($component->get('generationSummary'))->not->toBeNull();

    $component->call('dismissGenerationSummary');

    expect($component->get('generationSummary'))->toBeNull();
});

test('the summary survives an unrelated round trip', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', ['38']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id])
        ->call('generateCombinations');

    expect($component->get('generationSummary'))->not->toBeNull();

    $component->call('openCreateForm')->call('closeForm');

    expect($component->get('generationSummary'))->not->toBeNull();
});

test('a second successful generation replaces the previous summary', function () {
    $this->actingAs(variantGeneratorActor());

    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', ['38', '39']);
    [$color] = variantGeneratorType('Color', ['Black']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id])
        ->call('generateCombinations');

    expect($component->get('generationSummary')['created'])->toBe(2);

    $component->call('openGenerateModal')
        ->set('attributeTypeIds', [$color->id])
        ->call('generateCombinations');

    expect($component->get('generationSummary')['created'])->toBe(1);
});

// =====================================================================
// D-17.2: the generator's own gated method -- the seventh on this component
// =====================================================================

test('generateCombinations is refused for an actor lacking products.edit, and writes no row', function () {
    // See VariantBuilderAuthorizationTest.php's own beforeEach() comment: without this, Laravel's
    // exception handler converts the AuthorizationException into an HTTP-403-shaped component
    // response instead, and expect(...)->toThrow(...) fails with "not thrown" even though the
    // gate DID refuse.
    $this->withoutExceptionHandling();

    $creator = variantGeneratorActor();
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', ['38']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id]);

    $deniedActor = variantGeneratorActor(['products.view']);
    $this->actingAs($deniedActor);

    expect(fn () => $component->call('generateCombinations'))->toThrow(AuthorizationException::class);

    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(0);
});

test('generateCombinations succeeds for an actor holding products.edit, as the control', function () {
    $this->actingAs(variantGeneratorActor());
    $product = Product::factory()->create(['sku' => '0002']);
    [$talla] = variantGeneratorType('Talla', ['38']);

    Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [$talla->id])
        ->call('generateCombinations');

    expect(ProductVariant::where('product_id', $product->id)->count())->toBe(1);
});

// =====================================================================
// D-17: the trigger's own visibility/disabled state
// =====================================================================

test('the trigger renders disabled for an actor lacking products.edit', function () {
    $this->actingAs(variantGeneratorActor(['products.view']));
    $product = Product::factory()->create(['sku' => '0002']);
    variantGeneratorType('Talla', ['38']);

    $html = Livewire::test(VariantBuilder::class, ['productId' => $product->id])->html();

    // Icon-only-adjacent control -- the same data-test-hook-then-disabled-attribute regex this
    // codebase already uses for every other disabled row action (see
    // tests/Feature/Users/IndexRenderingTest.php), since attribute order is not guaranteed.
    expect(preg_match(
        '/data-test="open-generate-combinations"[^>]*\sdisabled="disabled"/',
        $html,
    ))->toBe(1);
});

test('the trigger is absent entirely when the catalog holds no attribute types', function () {
    $this->actingAs(variantGeneratorActor());
    $product = Product::factory()->create(['sku' => '0002']);

    Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->assertDontSeeHtml('data-test="open-generate-combinations"');
});

// =====================================================================
// Security-audit findings, fixed within this story:
// L-1 -- attributeTypeIds is capped at the MUTATION POINT (updatedAttributeTypeIds()), not only
//        inside generateCombinations(), so a forged, well-past-the-legal-maximum array cannot
//        reach the render-time generateCombinationCount() computed and cost an unbounded scan.
// L-2 -- showGenerateModal is #[Locked], matching showDeleteModal's own shipped precedent.
// INFO-2 -- a selection matching no live catalog type reads 0 combinations, never 1.
// =====================================================================

test('attributeTypeIds is capped at the mutation point, not only at save time', function () {
    $this->actingAs(variantGeneratorActor());
    $product = Product::factory()->create(['sku' => '0002']);
    $ids = collect(range(1, 10))->map(fn (): string => (string) Str::uuid())->all();

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', $ids);

    expect($component->get('attributeTypeIds'))->toHaveCount(VariantBuilder::MAX_GENERATE_AXES);
});

test('showGenerateModal cannot be forced open by a forged client write', function () {
    $this->actingAs(variantGeneratorActor());
    $product = Product::factory()->create(['sku' => '0002']);

    expect(fn () => Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->set('showGenerateModal', true))
        ->toThrow(CannotUpdateLockedPropertyException::class);
});

test('the live combination count reads zero for a selection matching no live catalog type', function () {
    $this->actingAs(variantGeneratorActor());
    $product = Product::factory()->create(['sku' => '0002']);

    $component = Livewire::test(VariantBuilder::class, ['productId' => $product->id])
        ->call('openGenerateModal')
        ->set('attributeTypeIds', [(string) Str::uuid()]);

    expect($component->instance()->generateCombinationCount())->toBe(0);
});
