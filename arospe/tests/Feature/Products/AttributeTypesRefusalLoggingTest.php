<?php

// Story 0028 -- App\Livewire\Products\AttributeTypes\Index had no test asserting that a Gate
// refusal on any of its mutating/disclosing methods is actually logged via
// App\Actions\Auth\LogRefusedPrivilegedAttempt, unlike every other module screen this codebase
// has shipped since story 0015b -- see docs/architecture/authorization.md#recording-a-refusal--
// what-every-gate-owes-the-audit-trail for the copyable "third admin screen" recipe this file
// follows, and tests/Feature/SalesRegions/RefusalLoggingTest.php for the shape it mirrors.
//
// mount() is the one deliberate exclusion, matching every other module screen's identical
// precedent: the route's own can:products.view gate checks the identical ability, and can:
// (unlike permission:) IS on Livewire's PersistentMiddleware allow-list, so a real HTTP actor who
// would fail this check is refused by the route before ever reaching mount() -- a refusal there
// is only reachable by mounting the component directly, which does not represent a real attack
// surface the way a /livewire/update round trip does.
//
// Coverage checklist -- every Gate-shaped site D6 names:
//   1. openCreateModal()  create  -- 'openCreateModal() authorization refusal is logged'
//   2. openEditModal()    update  -- 'openEditModal() authorization refusal is logged'
//   3. save()             create  -- 'save() authorization refusal is logged on the create branch'
//   4. save()             update  -- 'save() authorization refusal is logged on the update branch'
//   5. confirmDelete()    delete  -- 'confirmDelete() authorization refusal is logged'
//   6. deleteType()       delete  -- 'deleteType() authorization refusal is logged'

use App\Actions\Products\CreateProductAttributeType;
use App\Livewire\Products\AttributeTypes\Index;
use App\Models\ProductAttributeType;
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
 * @param  array<int, string>  $extraPermissions
 */
function attributeTypesRefusalTestActor(array $extraPermissions = ['products.view', 'products.create', 'products.edit', 'products.delete']): User
{
    $actor = User::factory()->create();

    if ($extraPermissions !== []) {
        $actor->givePermissionTo($extraPermissions);
    }

    return $actor;
}

// =====================================================================
// openCreateModal() -- class-level ability, no specific row, so target_id
// resolves to null.
// =====================================================================

test('openCreateModal() authorization refusal is logged with the actor and ability', function () {
    Log::spy();

    $actor = attributeTypesRefusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('products.create');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('openCreateModal');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && ($context['target_type'] ?? null) === 'product_attribute_type')
        ->once();
});

// =====================================================================
// openEditModal() -- disclosure path, targets a real row.
// =====================================================================

test('openEditModal() authorization refusal is logged with the actor, ability and target', function () {
    Log::spy();

    $actor = attributeTypesRefusalTestActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', []);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('products.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('openEditModal', $type->id);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'product_attribute_type'
            && ($context['target_id'] ?? null) === $type->id)
        ->once();
});

// =====================================================================
// save() -- create branch (no editingTypeId).
// =====================================================================

test('save() authorization refusal is logged on the create branch, and writes no row', function () {
    Log::spy();

    $actor = attributeTypesRefusalTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class)->call('openCreateModal');

    $actor->revokePermissionTo('products.create');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->set('name', 'Should Not Persist')->call('save');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'create'
            && ($context['target_type'] ?? null) === 'product_attribute_type')
        ->once();

    expect(ProductAttributeType::where('name', 'Should Not Persist')->exists())->toBeFalse();
});

// =====================================================================
// save() -- update branch (editingTypeId set), targets a real row.
// =====================================================================

test('save() authorization refusal is logged on the update branch, and leaves the type unchanged', function () {
    Log::spy();

    $actor = attributeTypesRefusalTestActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Size', []);

    $component = Livewire::test(Index::class)->call('openEditModal', $type->id);

    $actor->revokePermissionTo('products.edit');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->set('name', 'Shoe size')->call('save');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'update'
            && ($context['target_type'] ?? null) === 'product_attribute_type'
            && ($context['target_id'] ?? null) === $type->id)
        ->once();

    expect($type->fresh()->name)->toBe('Size');
});

// =====================================================================
// confirmDelete() -- disclosure path, targets a real row.
// =====================================================================

test('confirmDelete() authorization refusal is logged with the actor, ability and target', function () {
    Log::spy();

    $actor = attributeTypesRefusalTestActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Material', []);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('products.delete');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('confirmDelete', $type->id);
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'delete'
            && ($context['target_type'] ?? null) === 'product_attribute_type'
            && ($context['target_id'] ?? null) === $type->id)
        ->once();

    expect(ProductAttributeType::find($type->id))->not->toBeNull();
});

// =====================================================================
// deleteType() -- targets a real row, re-checked independently of
// confirmDelete().
// =====================================================================

test('deleteType() authorization refusal is logged, and the type still exists', function () {
    Log::spy();

    $actor = attributeTypesRefusalTestActor();
    $this->actingAs($actor);

    $type = app(CreateProductAttributeType::class)('Material', []);

    $component = Livewire::test(Index::class)->call('confirmDelete', $type->id);

    $actor->revokePermissionTo('products.delete');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    try {
        $component->call('deleteType');
    } catch (AuthorizationException) {
        //
    }

    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $message, array $context): bool => $message === 'Privileged action refused'
            && ($context['actor_id'] ?? null) === $actor->id
            && ($context['ability'] ?? null) === 'delete'
            && ($context['target_type'] ?? null) === 'product_attribute_type'
            && ($context['target_id'] ?? null) === $type->id)
        ->once();

    expect(ProductAttributeType::find($type->id))->not->toBeNull();
});

// =====================================================================
// Must-not-over-log -- a permitted save() produces no refusal entry.
// =====================================================================

test('a permitted save produces no refusal entry', function () {
    Log::spy();

    $actor = attributeTypesRefusalTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Permitted Type')
        ->call('save')
        ->assertHasNoErrors();

    Log::shouldNotHaveReceived('warning');

    expect(ProductAttributeType::where('name', 'Permitted Type')->exists())->toBeTrue();
});
