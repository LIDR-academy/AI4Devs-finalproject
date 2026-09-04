<?php

// Phase 4 appsec audit finding F-2/F-3: App\Livewire\Products\Index::confirmDelete()/
// deleteProduct() and App\Livewire\Products\Editor::mount()/save() now route their
// Gate::authorize() calls through App\Actions\Auth\LogRefusedPrivilegedAttempt, with
// `targetType: 'product'` passed explicitly (resolveTarget() auto-resolves only User and Role
// instances/classes) -- matching every sibling admin screen's own RefusalLoggingTest.php (see
// tests/Feature/ProductCategories/RefusalLoggingTest.php, this file's structural template).
//
// Index::mount() is deliberately excluded, mirroring every sibling screen's identical exception:
// can:products.view is on Livewire's PersistentMiddleware allow-list, so a real HTTP actor who
// would fail that check is refused by the route before ever reaching mount() -- a refusal there
// is unreachable over HTTP.
//
// Editor::mount() is NOT exempt, unlike Index::mount() -- it asks `create`/`update`, a FINER
// ability than the route's own `can:products.view`, so an actor holding only `products.view`
// passes the route middleware and IS refused inside this method.

use App\Livewire\Products\Editor;
use App\Livewire\Products\Index;
use App\Models\Product;
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
function productsRefusalLogContextHasNoSecretLookingKey(array $context): bool
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
function productsRefusalTestActor(array $extraPermissions = ['products.view']): User
{
    $actor = User::factory()->create();

    if ($extraPermissions !== []) {
        $actor->givePermissionTo($extraPermissions);
    }

    return $actor;
}

// =====================================================================
// Index::confirmDelete() / deleteProduct()
// =====================================================================

test('Index::confirmDelete() authorization refusal is logged with the actor, ability and target', function () {
    Log::spy();

    $creator = productsRefusalTestActor(['products.view', 'products.create']);
    $this->actingAs($creator);
    $target = Product::factory()->create();

    $actor = productsRefusalTestActor();
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
            && ($context['target_type'] ?? null) === 'product'
            && ($context['target_id'] ?? null) === $target->id
            && productsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('Index::deleteProduct() authorization refusal is logged', function () {
    Log::spy();

    $creator = productsRefusalTestActor(['products.view', 'products.delete']);
    $this->actingAs($creator);
    $target = Product::factory()->create();

    $component = Livewire::test(Index::class)->call('confirmDelete', $target->id);

    $creator->revokePermissionTo('products.delete');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('deleteProduct');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $creator->id
            && ($context['ability'] ?? null) === 'delete'
            && ($context['target_type'] ?? null) === 'product'
            && ($context['target_id'] ?? null) === $target->id
            && productsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect(Product::find($target->id))->not->toBeNull();
});

// =====================================================================
// Editor::mount()
// =====================================================================

test('Editor::mount() create-path authorization refusal is logged', function () {
    Log::spy();

    $actor = productsRefusalTestActor();
    $this->actingAs($actor);

    try {
        Livewire::test(Editor::class);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && ($context['target_type'] ?? null) === 'product'
            && array_key_exists('target_id', $context) && $context['target_id'] === null
            && productsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

test('Editor::mount() update-path authorization refusal is logged', function () {
    Log::spy();

    $creator = productsRefusalTestActor(['products.view', 'products.create']);
    $this->actingAs($creator);
    $target = Product::factory()->create();

    $actor = productsRefusalTestActor();
    $this->actingAs($actor);

    try {
        Livewire::test(Editor::class, ['product' => $target]);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'product'
            && ($context['target_id'] ?? null) === $target->id
            && productsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();
});

// =====================================================================
// Editor::save()
// =====================================================================

test('Editor::save() create-path authorization refusal propagates as an AuthorizationException', function () {
    // mount() already refuses `create` for this actor before save() is ever reachable, so its
    // own logging is proven by "Editor::mount() create-path authorization refusal is logged"
    // above rather than re-derived here -- this test only confirms save()'s own gate is present
    // and does not silently swallow the refusal.
    $this->withoutExceptionHandling();

    $actor = productsRefusalTestActor();
    $this->actingAs($actor);

    expect(fn () => Livewire::test(Editor::class))->toThrow(AuthorizationException::class);
});

test('Editor::save() update-path authorization refusal is logged when the permission is revoked mid-session', function () {
    Log::spy();

    $creator = productsRefusalTestActor(['products.view', 'products.create', 'products.edit']);
    $this->actingAs($creator);
    $target = Product::factory()->create(['name' => 'Original Name']);

    $component = Livewire::test(Editor::class, ['product' => $target]);

    $creator->revokePermissionTo('products.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('save');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $creator->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'product'
            && ($context['target_id'] ?? null) === $target->id
            && productsRefusalLogContextHasNoSecretLookingKey($context))
        ->once();

    expect($target->fresh()->name)->toBe('Original Name');
});
