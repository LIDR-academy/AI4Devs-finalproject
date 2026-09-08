<?php

use App\Actions\Products\CreateProductVariant;
use App\Actions\Products\UpdateProductVariant;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0029, Phase 5 test-coverage gap: no behavior test existed for UpdateProductVariant at all
// -- it only appeared in ProductVariantAuthorizationTest.php, which tests authorization, not
// behavior. D-13: UpdateProductVariant may write price/stock/featured_media_id/position and MUST
// NEVER touch sku, combination_hash or the pivot -- changing a combination means deleting the
// variant and creating a new one.
//
// Every test below passes `featuredMediaId`/`position` EXPLICITLY on every call, never relying on
// the action's own parameter defaults -- F1 (a separate, parallel fix) removes the unstated
// `featuredMediaId` default from UpdateProductVariant's signature, and this file is written to be
// correct whether that fix has landed yet or not.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');
    $this->actingAs($actor);
});

/**
 * @return array{0: ProductVariant, 1: array<int, string>}
 */
function makeUpdateProductVariantTestVariant(string $productSku): array
{
    $product = Product::factory()->create(['sku' => $productSku]);
    $type = ProductAttributeType::factory()->create(['name' => 'UpdVariantType-'.Str::random(8)]);
    $value = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => 'M',
        'position' => 0,
    ]);

    $variant = app(CreateProductVariant::class)($product, [$value->id], '19.99', 5);

    return [$variant, [$value->id]];
}

// =====================================================================
// Ordinary field updates persist exactly what was submitted
// =====================================================================

test('updating price, stock, featuredMediaId and position persists exactly those changes', function () {
    [$variant] = makeUpdateProductVariantTestVariant('0101');
    $media = Media::factory()->create();

    $updated = app(UpdateProductVariant::class)($variant, '29.99', 12, $media->id, 3);

    $fresh = $variant->fresh();

    expect($fresh->price)->toBe('29.99')
        ->and($fresh->stock)->toBe(12)
        ->and($fresh->featured_media_id)->toBe($media->id)
        ->and($fresh->position)->toBe(3)
        ->and($updated->fresh()->price)->toBe('29.99');
});

// =====================================================================
// D-13: sku, combination_hash and the pivot are left byte-identical after an update that changes
// price/stock/position -- UpdateProductVariant must never touch any of the three.
// =====================================================================

test('the SKU is left byte-identical after an update that changes price, stock and position', function () {
    [$variant] = makeUpdateProductVariantTestVariant('0102');
    $originalSku = $variant->fresh()->sku;

    app(UpdateProductVariant::class)($variant, '29.99', 1, null, 7);

    expect($variant->fresh()->sku)->toBe($originalSku);
});

test('the combination_hash and the pivot rows are left byte-identical after an update, exact id set included', function () {
    [$variant, $valueIds] = makeUpdateProductVariantTestVariant('0103');
    $originalHash = $variant->fresh()->combination_hash;
    $originalPivotIds = DB::table('product_variant_values')
        ->where('product_variant_id', $variant->id)
        ->pluck('product_attribute_value_id')
        ->sort()
        ->values()
        ->all();

    app(UpdateProductVariant::class)($variant, '5.00', 0, null, 9);

    $fresh = $variant->fresh();
    $newPivotCount = DB::table('product_variant_values')->where('product_variant_id', $variant->id)->count();
    $newPivotIds = DB::table('product_variant_values')
        ->where('product_variant_id', $variant->id)
        ->pluck('product_attribute_value_id')
        ->sort()
        ->values()
        ->all();

    expect($fresh->combination_hash)->toBe($originalHash)
        ->and($newPivotCount)->toBe(count($valueIds))
        ->and($newPivotIds)->toBe($originalPivotIds)
        ->and($newPivotIds)->toBe(collect($valueIds)->sort()->values()->all());
});

// =====================================================================
// Validation refusals -- price/stock boundaries reused from ProductVariantValidationRules --
// throw on the right key and leave EVERY column unchanged, not just "still exists".
// =====================================================================

test('invalid price/stock inputs throw ValidationException on the named key and leave every column unchanged', function (array $overrides, string $key) {
    [$variant] = makeUpdateProductVariantTestVariant('0104');
    $before = $variant->fresh()->getAttributes();

    $args = array_merge(
        ['price' => '29.99', 'stock' => 3, 'featuredMediaId' => null, 'position' => null],
        $overrides,
    );

    $caught = null;

    try {
        app(UpdateProductVariant::class)(
            $variant,
            $args['price'],
            $args['stock'],
            $args['featuredMediaId'],
            $args['position'],
        );
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey($key);

    // Every column, not just "the row still exists" -- a partial write disguised as a full row
    // would pass a weaker check.
    expect($variant->fresh()->getAttributes())->toBe($before);
})->with([
    'negative stock' => [['stock' => -1], 'stock'],
    'non-numeric price' => [['price' => 'not-a-number'], 'price'],
    'three-decimal price' => [['price' => '19.999'], 'price'],
]);

// =====================================================================
// featuredMediaId: a real id persists it; explicit null clears an existing one -- this is
// legitimate (the caller stating null on purpose), unlike F1's bug, which was about an UNSTATED
// default silently clearing it.
// =====================================================================

test('setting featuredMediaId to a real media id persists it', function () {
    [$variant] = makeUpdateProductVariantTestVariant('0105');
    $media = Media::factory()->create();

    app(UpdateProductVariant::class)($variant, '19.99', 5, $media->id, null);

    expect($variant->fresh()->featured_media_id)->toBe($media->id);
});

test('setting featuredMediaId to null explicitly clears an existing image', function () {
    [$variant] = makeUpdateProductVariantTestVariant('0106');
    $media = Media::factory()->create();

    app(UpdateProductVariant::class)($variant, '19.99', 5, $media->id, null);
    expect($variant->fresh()->featured_media_id)->toBe($media->id);

    app(UpdateProductVariant::class)($variant, '19.99', 5, null, null);

    expect($variant->fresh()->featured_media_id)->toBeNull();
});

// =====================================================================
// D-15: featuredMediaId's own refusal contract -- zero refusal tests existed anywhere for this key
// before this file.
// =====================================================================

test('a malformed or unknown featuredMediaId throws ValidationException on featuredMediaId and leaves the row unchanged', function (mixed $featuredMediaId) {
    [$variant] = makeUpdateProductVariantTestVariant('0107');
    $before = $variant->fresh()->getAttributes();

    $caught = null;

    try {
        app(UpdateProductVariant::class)($variant, '19.99', 5, $featuredMediaId, null);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(ValidationException::class)
        ->and($caught->errors())->toHaveKey('featuredMediaId');

    expect($variant->fresh()->getAttributes())->toBe($before);
})->with([
    'unknown media id' => [(string) Str::uuid7()],
    'malformed media id' => ['not-a-uuid-at-all'],
]);
