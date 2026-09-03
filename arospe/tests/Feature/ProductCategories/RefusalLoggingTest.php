<?php

// Story 0025 Phase 4 audit, finding N-1/N-2: App\Livewire\ProductCategories\Index's six
// LogRefusedPrivilegedAttempt::authorize() calls now pass targetType/targetId explicitly, matching
// the recipe docs/architecture/authorization.md describes and every sibling admin screen's own
// RefusalLoggingTest.php (see tests/Feature/SalesRegions/RefusalLoggingTest.php, this file's
// structural template). Before this fix, resolveTarget() fell through to [null, null] for every
// refusal on this screen, since it auto-resolves only User and Role instances/classes.
//
// mount() is deliberately excluded, mirroring every sibling screen's identical exception:
// can:products.view is on Livewire's PersistentMiddleware allow-list, so a real HTTP actor who
// would fail that check is refused by the route before ever reaching mount() -- a refusal there is
// unreachable over HTTP.

use App\Actions\ProductCategories\CreateProductCategory;
use App\Livewire\ProductCategories\Index;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Livewire\Livewire;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @param  array<string, mixed>  $context
 */
function productCategoriesRefusalLogContextHasNoSecretLookingKey(array $context): bool
{
    foreach (array_keys($context) as $key) {
        if (! is_string($key)) {
            continue;
        }

        if (str_contains($key, 'password') || str_contains($key, 'token') || str_contains($key, 'hash') || str_contains($key, 'session')) {
            return false;
        }
    }

    return true;
}

/**
 * @param  array<int, string>  $extraPermissions
 */
function productCategoriesRefusalTestActor(array $extraPermissions = ['products.view']): User
{
    $actor = User::factory()->create();

    if ($extraPermissions !== []) {
        $actor->givePermissionTo($extraPermissions);
    }

    return $actor;
}

test('openCreateModal() authorization refusal is logged with the actor, ability and target type', function () {
    Log::spy();

    $actor = productCategoriesRefusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class);

    try {
        $component->call('openCreateModal');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && ($context['target_type'] ?? null) === 'product_category'
            && array_key_exists('target_id', $context) && $context['target_id'] === null
            && productCategoriesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('openEditModal() authorization refusal is logged with the actor, ability and target', function () {
    Log::spy();

    $creator = productCategoriesRefusalTestActor(['products.view', 'products.create']);
    $this->actingAs($creator);
    $target = app(CreateProductCategory::class)('Footwear');

    $actor = productCategoriesRefusalTestActor();
    $this->actingAs($actor);

    try {
        Livewire::test(Index::class)->call('openEditModal', $target->id);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'product_category'
            && ($context['target_id'] ?? null) === $target->id
            && productCategoriesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('save() authorization refusal is logged', function () {
    Log::spy();

    $creator = productCategoriesRefusalTestActor(['products.view', 'products.create', 'products.edit']);
    $this->actingAs($creator);
    $target = app(CreateProductCategory::class)('Footwear');

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    $creator->revokePermissionTo('products.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->set('name', 'Should Not Persist')->call('save');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $creator->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'product_category'
            && ($context['target_id'] ?? null) === $target->id
            && productCategoriesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('confirmDelete() authorization refusal is logged with the actor, ability and target', function () {
    Log::spy();

    $creator = productCategoriesRefusalTestActor(['products.view', 'products.create']);
    $this->actingAs($creator);
    $target = app(CreateProductCategory::class)('Footwear');

    $actor = productCategoriesRefusalTestActor();
    $this->actingAs($actor);

    try {
        Livewire::test(Index::class)->call('confirmDelete', $target->id);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'delete'
            && ($context['target_type'] ?? null) === 'product_category'
            && ($context['target_id'] ?? null) === $target->id
            && productCategoriesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('deleteProductCategory() authorization refusal is logged', function () {
    Log::spy();

    $creator = productCategoriesRefusalTestActor(['products.view', 'products.create', 'products.delete']);
    $this->actingAs($creator);
    $target = app(CreateProductCategory::class)('Footwear');

    $component = Livewire::test(Index::class)->call('confirmDelete', $target->id);

    $creator->revokePermissionTo('products.delete');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('deleteProductCategory');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $creator->id
            && ($context['ability'] ?? null) === 'delete'
            && ($context['target_type'] ?? null) === 'product_category'
            && ($context['target_id'] ?? null) === $target->id
            && productCategoriesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

// =====================================================================
// The domain-invariant "category in use" block -- reached through
// deleteProductCategory() with no action-layer detour. 0024b's OQ-B1
// resolution requires this refusal to be logged too, distinguishably from
// an authorization refusal (0024b's own Definition of Done, discharged by
// this story).
// =====================================================================

test("the 'category in use' domain-invariant refusal is logged, distinguishable from an authorization refusal", function () {
    Log::spy();

    $creator = productCategoriesRefusalTestActor(['products.view', 'products.create', 'products.delete']);
    $this->actingAs($creator);
    $target = app(CreateProductCategory::class)('Calzado');
    Product::factory()->create(['product_category_id' => $target->id]);

    Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->call('deleteProductCategory')
        ->assertHasErrors('productCategoryId');

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $creator->id
            && ($context['ability'] ?? null) === 'category_in_use'
            && $context['ability'] !== 'delete'
            && ($context['target_type'] ?? null) === 'product_category'
            && ($context['target_id'] ?? null) === $target->id
            && productCategoriesRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(ProductCategory::find($target->id))->not->toBeNull();
});
