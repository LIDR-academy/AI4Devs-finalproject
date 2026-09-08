<?php

// Story 0019 (media library backend), Phase 3 step 1 (RED). Neither App\Models\Media nor
// App\Policies\MediaPolicy exist yet -- every test below is expected to fail with a "class not
// found" error, never a syntax error in this file.
//
// Mirrors tests/Feature/Policies/SalesRegionPolicyTest.php's shape: auto-discovered policy (no
// provider registration -- see conventions/base-standards.md), Gate::forUser(...)->allows(...)
// against both the class (viewAny/create) and an instance (update/delete), and a Super Admin
// bypass test that passes regardless of the policy's own logic since Gate::before grants a Super
// Admin actor before any policy is consulted.
//
// Four abilities are tested (D11): viewAny (media.view) and create (media.create) are what this
// story exercises; update (media.edit) and delete (media.delete) are seeded but UNUSED this
// story (0020 and a future story, respectively) -- the task file explicitly asks for them to be
// "correct from the start" ("Files to create" -> app/Policies/MediaPolicy.php), so they are
// tested here exactly like the two live abilities rather than skipped.

use App\Models\Media;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// viewAny
// =====================================================================

test('viewAny is allowed for an actor holding media.view and denied for one without it', function () {
    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('media.view');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('viewAny', Media::class))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('viewAny', Media::class))->toBeFalse();
});

// =====================================================================
// create
// =====================================================================

test('create is allowed for an actor holding media.create and denied for one without it', function () {
    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('media.create');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('create', Media::class))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('create', Media::class))->toBeFalse();
});

// Narrowness -- holding only media.view is not sufficient for create. Distinct from the bare
// "denied for one without it" case above (an actor with NO permission at all): this actor holds a
// real, different permission on the SAME module, so a policy that accidentally checked "any
// media.* permission" rather than the exact media.create string would pass this actor
// incorrectly.
test('create is denied for an actor holding only media.view', function () {
    $viewOnlyActor = User::factory()->create();
    $viewOnlyActor->givePermissionTo('media.view');

    expect(Gate::forUser($viewOnlyActor)->allows('create', Media::class))->toBeFalse();
});

// =====================================================================
// update (unused this story -- media.edit is story 0020's)
// =====================================================================

test('update is allowed for an actor holding media.edit and denied for one without it', function () {
    $target = Media::factory()->create();

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('media.edit');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('update', $target))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('update', $target))->toBeFalse();
});

// =====================================================================
// delete (unused this story -- no story implements media deletion yet, D11)
// =====================================================================

test('delete is allowed for an actor holding media.delete and denied for one without it', function () {
    $target = Media::factory()->create();

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('media.delete');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('delete', $target))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('delete', $target))->toBeFalse();
});

// =====================================================================
// Denial is enforced server-side, not merely hidden in the UI
// =====================================================================

test('authorize throws AuthorizationException when create is denied', function () {
    $actor = User::factory()->create(); // holds no permission at all

    expect(fn () => Gate::forUser($actor)->authorize('create', Media::class))
        ->toThrow(AuthorizationException::class);
});

// =====================================================================
// Super Admin bypass -- Gate::before grants a Super Admin actor regardless of whether
// MediaPolicy exists at all, exactly like SalesRegionPolicyTest's equivalent.
// =====================================================================

test('a Super Admin actor passes every MediaPolicy ability while holding zero permission rows', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $target = Media::factory()->create();

    expect($superAdmin->getAllPermissions())->toHaveCount(0)
        ->and(Gate::forUser($superAdmin)->allows('viewAny', Media::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('create', Media::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('update', $target))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('delete', $target))->toBeTrue();
});
