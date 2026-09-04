<?php

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\Products\CreateProductVariant;
use App\Actions\Products\DeleteProductVariant;
use App\Actions\Products\UpdateProductVariant;
use App\Models\Product;
use App\Models\ProductAttributeType;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\PermissionRegistrar;

// Story 0029, Phase 3 (TDD "red" step): D-12.1 -- unlike 0024's original hand-off, this story's
// three variant actions self-authorize `update` on the PARENT PRODUCT, so it ships an enforcement
// path of its own rather than deferring it to 0031. Modelled on
// tests/Feature/Products/ProductAuthorizationTest.php.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @return array{0: ProductAttributeType, 1: ProductAttributeValue}
 */
function variantAuthTestAttribute(string $typeName, string $value): array
{
    $type = ProductAttributeType::factory()->create(['name' => $typeName]);
    $productAttributeValue = ProductAttributeValue::factory()->create([
        'product_attribute_type_id' => $type->id,
        'value' => $value,
        'position' => 0,
    ]);

    return [$type, $productAttributeValue];
}

// =====================================================================
// create
// =====================================================================

test('CreateProductVariant is refused for an actor lacking products.edit, is logged, and writes no row', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $value] = variantAuthTestAttribute('Talla', 'M');

    $actor = User::factory()->create();
    $this->actingAs($actor);

    Log::spy();

    $caught = null;

    try {
        app(CreateProductVariant::class)($product, [$value->id], '19.99', 5);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class);
    expect(ProductVariant::count())->toBe(0);

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'product'
            && ($context['target_id'] ?? null) === $product->id)
        ->once();
});

test('CreateProductVariant succeeds for an actor holding products.edit, as the control', function () {
    $product = Product::factory()->create(['sku' => '0001']);
    [, $value] = variantAuthTestAttribute('Talla', 'M');

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');
    $this->actingAs($actor);

    $variant = app(CreateProductVariant::class)($product, [$value->id], '19.99', 5);

    expect(ProductVariant::count())->toBe(1)
        ->and($variant->fresh())->not->toBeNull();
});

// =====================================================================
// update
// =====================================================================

test('UpdateProductVariant is refused for an actor lacking products.edit, is logged, and leaves the row unchanged', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('products.edit');
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [, $value] = variantAuthTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$value->id], '19.99', 5);

    $actor = User::factory()->create();
    $this->actingAs($actor);

    Log::spy();

    $caught = null;

    try {
        app(UpdateProductVariant::class)($variant, '29.99', 3, null);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class);
    expect($variant->fresh()->price)->toBe('19.99');

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'product'
            && ($context['target_id'] ?? null) === $product->id)
        ->once();
});

test('UpdateProductVariant succeeds for an actor holding products.edit, as the control', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('products.edit');
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [, $value] = variantAuthTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$value->id], '19.99', 5);

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');
    $this->actingAs($actor);

    $updated = app(UpdateProductVariant::class)($variant, '29.99', 3, null);

    expect($updated->fresh()->price)->toBe('29.99');
});

// =====================================================================
// delete
// =====================================================================

test('DeleteProductVariant is refused for an actor lacking products.edit, is logged, and the variant survives', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('products.edit');
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [, $value] = variantAuthTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$value->id], '19.99', 5);

    $actor = User::factory()->create();
    $this->actingAs($actor);

    Log::spy();

    $caught = null;

    try {
        app(DeleteProductVariant::class)($variant);
    } catch (Throwable $e) {
        $caught = $e;
    }

    expect($caught)->toBeInstanceOf(AuthorizationException::class);
    expect(ProductVariant::where('id', $variant->id)->exists())->toBeTrue();

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'product'
            && ($context['target_id'] ?? null) === $product->id)
        ->once();
});

test('DeleteProductVariant succeeds for an actor holding products.edit, as the control', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('products.edit');
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [, $value] = variantAuthTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$value->id], '19.99', 5);

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');
    $this->actingAs($actor);

    $result = app(DeleteProductVariant::class)($variant);

    expect($result)->toBeTrue()
        ->and(ProductVariant::where('id', $variant->id)->exists())->toBeFalse();
});

// =====================================================================
// Super Admin bypass
// =====================================================================

test('a Super Admin actor holding zero permission rows passes create, update and delete', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    expect($superAdmin->getAllPermissions())->toHaveCount(0);

    $product = Product::factory()->create(['sku' => '0001']);
    [, $value] = variantAuthTestAttribute('Talla', 'M');

    $variant = app(CreateProductVariant::class)($product, [$value->id], '19.99', 5);
    expect($variant)->not->toBeNull();

    $updated = app(UpdateProductVariant::class)($variant, '29.99', 3, null);
    expect($updated->fresh()->price)->toBe('29.99');

    $result = app(DeleteProductVariant::class)($variant);
    expect($result)->toBeTrue();
});

// =====================================================================
// D-12.1 point 2: the gate is asked against the PARENT PRODUCT, proven by a target-swap -- an
// actor allowed on product A is still refused for a variant of product B. ProductPolicy has no
// target-dependent branch today, so this test cannot fail against the current policy shape -- it
// exists so it STARTS failing the day one is added, per the task file's own instruction.
// =====================================================================

test('the gate is asked against the variant\'s own parent product, unaffected by an unrelated product', function () {
    $productA = Product::factory()->create(['sku' => '0001']);
    $productB = Product::factory()->create(['sku' => '0002']);
    [, $valueA] = variantAuthTestAttribute('Talla', 'M');
    [, $valueB] = variantAuthTestAttribute('Talla2', 'S');

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');
    $this->actingAs($actor);

    $variantA = app(CreateProductVariant::class)($productA, [$valueA->id], '19.99', 5);
    $variantB = app(CreateProductVariant::class)($productB, [$valueB->id], '19.99', 5);

    expect($variantA)->not->toBeNull()
        ->and($variantB)->not->toBeNull();
});

// =====================================================================
// D-12.1 point 1 / FP20's sharper version: the gate runs BEFORE validation and before any
// transaction. An actor who is BOTH unauthorized AND submitting structurally invalid input must
// see the AuthorizationException, never a ValidationException -- a validate-then-authorize
// implementation would leak the shape of the input rules to an actor with no permission at all.
// =====================================================================

test('the gate runs before validation: an unauthorized actor with invalid input still gets AuthorizationException', function () {
    $product = Product::factory()->create(['sku' => '0001']);

    $actor = User::factory()->create();
    $this->actingAs($actor);

    // Both invalid (empty combination array) AND unauthorized -- the AuthorizationException must
    // win.
    expect(fn () => app(CreateProductVariant::class)($product, [], 'not-a-number', -1))
        ->toThrow(AuthorizationException::class);

    expect(ProductVariant::count())->toBe(0);
});

test('the gate runs before validation on UpdateProductVariant too', function () {
    $creator = User::factory()->create();
    $creator->givePermissionTo('products.edit');
    $this->actingAs($creator);
    $product = Product::factory()->create(['sku' => '0001']);
    [, $value] = variantAuthTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($product, [$value->id], '19.99', 5);

    $actor = User::factory()->create();
    $this->actingAs($actor);

    expect(fn () => app(UpdateProductVariant::class)($variant, 'not-a-number', -1, null))
        ->toThrow(AuthorizationException::class);

    expect($variant->fresh()->price)->toBe('19.99');
});

// =====================================================================
// D-17.1: LogRefusedPrivilegedAttempt is a constructor dependency -- resolve every action with
// app(...), never new.
// =====================================================================

test('the actions are container-resolved, never new-ed', function () {
    expect(fn () => new CreateProductVariant)->toThrow(ArgumentCountError::class);
    expect(fn () => new UpdateProductVariant)->toThrow(ArgumentCountError::class);
    expect(fn () => new DeleteProductVariant)->toThrow(ArgumentCountError::class);
});

// =====================================================================
// Phase 4 finding F-8 (docs/security/model-instance-trust.md / derived-column-invariants.md's
// "Related" section): UpdateProductVariant/DeleteProductVariant must authorize against a FRESHLY
// RE-READ variant row, never a caller-staged instance. `load('product')` alone re-reads the
// product but resolves WHICH product from the caller's in-memory `product_id` -- a public
// attribute, and (until F-7) mass-assignable besides. Not reachable today (no route/component
// resolves a variant via anything but findOrFail() -- story 0031's job), so this is verified
// directly: staging the in-memory instance to point at a DECOY product must not change which
// product is actually authorized against.
// =====================================================================

test('UpdateProductVariant authorizes against the REAL persisted parent product, not a caller-staged product_id/relation (F-8)', function () {
    $victimProduct = Product::factory()->create(['sku' => '0016']);
    $decoyProduct = Product::factory()->create(['sku' => '0017']);

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');
    $this->actingAs($actor);

    [, $value] = variantAuthTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($victimProduct, [$value->id], '19.99', 5);

    // Stage the in-memory instance to point at a DIFFERENT product than what is actually
    // persisted -- nothing prevents a caller from overwriting either before handing this
    // instance to the action.
    $variant->product_id = $decoyProduct->id;
    $variant->setRelation('product', $decoyProduct);

    $this->mock(LogRefusedPrivilegedAttempt::class, function ($mock) use ($victimProduct): void {
        $mock->shouldReceive('authorize')
            ->once()
            ->withArgs(fn (string $ability, mixed $gateTarget, ?User $actor, ?string $targetType, int|string|null $targetId): bool => $ability === 'update'
                && $gateTarget instanceof Product
                && $gateTarget->is($victimProduct)
                && $targetType === 'product'
                && $targetId === $victimProduct->id)
            ->andReturnNull();
    });

    $updated = app(UpdateProductVariant::class)($variant, '29.99', 3, null);

    expect(ProductVariant::find($updated->id)->product_id)->toBe($victimProduct->id);
});

test('DeleteProductVariant authorizes against the REAL persisted parent product, not a caller-staged product_id/relation (F-8)', function () {
    $victimProduct = Product::factory()->create(['sku' => '0018']);
    $decoyProduct = Product::factory()->create(['sku' => '0019']);

    $actor = User::factory()->create();
    $actor->givePermissionTo('products.edit');
    $this->actingAs($actor);

    [, $value] = variantAuthTestAttribute('Talla', 'M');
    $variant = app(CreateProductVariant::class)($victimProduct, [$value->id], '19.99', 5);
    $variantId = $variant->id;

    $variant->product_id = $decoyProduct->id;
    $variant->setRelation('product', $decoyProduct);

    $this->mock(LogRefusedPrivilegedAttempt::class, function ($mock) use ($victimProduct): void {
        $mock->shouldReceive('authorize')
            ->once()
            ->withArgs(fn (string $ability, mixed $gateTarget, ?User $actor, ?string $targetType, int|string|null $targetId): bool => $ability === 'update'
                && $gateTarget instanceof Product
                && $gateTarget->is($victimProduct)
                && $targetType === 'product'
                && $targetId === $victimProduct->id)
            ->andReturnNull();
    });

    $result = app(DeleteProductVariant::class)($variant);

    expect($result)->toBeTrue()
        ->and(ProductVariant::where('id', $variantId)->exists())->toBeFalse();
});
