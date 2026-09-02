<?php

use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\PermissionRegistrar;

// Story 0024, Phase 3 (TDD "red" step): App\Policies\ProductPolicy, App\Models\Product and its
// factory do not exist yet — every test below is expected to fail (class not found) until
// backend-expert implements them in the next step of the TDD cycle.
//
// Every ability gets both an allow and a deny test, per docs/testing/qa/what-not-to-test.md's
// authorization rule. Unlike App\Policies\ProductCategoryPolicy (0023, zero call sites at ship
// time), THREE of ProductPolicy's four abilities have real call sites in this story
// (create/update/delete, via D-15's reversal) — viewAny is defined with no caller until story
// 0027's list screen, the same deliberate shape MediaPolicy shipped in story 0019 (four
// abilities, two used at ship time), per architecture.md's "define an ability when you can name
// what will ask it". Do not invent a call site for viewAny here.

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

test('viewAny is allowed for an actor holding products.view and denied for one without it', function () {
    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('products.view');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('viewAny', Product::class))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('viewAny', Product::class))->toBeFalse();
});

test('create is allowed for an actor holding products.create and denied for one without it', function () {
    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('products.create');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('create', Product::class))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('create', Product::class))->toBeFalse();
});

test('update is allowed for an actor holding products.edit and denied for one without it', function () {
    $target = Product::factory()->create();

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('products.edit');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('update', $target))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('update', $target))->toBeFalse();
});

test('delete is allowed for an actor holding products.delete and denied for one without it', function () {
    $target = Product::factory()->create();

    $allowedActor = User::factory()->create();
    $allowedActor->givePermissionTo('products.delete');

    $deniedActor = User::factory()->create();

    expect(Gate::forUser($allowedActor)->allows('delete', $target))->toBeTrue()
        ->and(Gate::forUser($deniedActor)->allows('delete', $target))->toBeFalse();
});

test('a Super Admin actor passes every ProductPolicy ability while holding zero permission rows', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $target = Product::factory()->create();

    expect($superAdmin->getAllPermissions())->toHaveCount(0)
        ->and(Gate::forUser($superAdmin)->allows('viewAny', Product::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('create', Product::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('update', $target))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('delete', $target))->toBeTrue();
});

// Server-side enforcement — not merely allows() returning false, per what-not-to-test.md's
// authorization rule.
test('Gate::forUser denies create for an actor lacking products.create by throwing AuthorizationException', function () {
    $deniedActor = User::factory()->create();

    expect(fn () => Gate::forUser($deniedActor)->authorize('create', Product::class))
        ->toThrow(AuthorizationException::class);
});

// The permission names are asserted against RolePermissionSeeder's seeded catalog — a permission
// string not in the catalog throws PermissionDoesNotExist at runtime, so this is a correctness
// test, not a style one.
test('the four permission strings ProductPolicy gates on are all in the seeded products module', function () {
    expect(in_array('products', RolePermissionSeeder::MODULES, true))->toBeTrue();

    $actor = User::factory()->create();
    $actor->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);

    expect($actor->getAllPermissions())->toHaveCount(4);
});
