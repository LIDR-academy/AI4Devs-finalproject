<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

test('a permission-gated route refuses a role without that permission and admits a role holding it', function () {
    Route::get('/__test/permission-gate', fn () => response('ok'))
        ->middleware('permission:products.delete');

    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $blogEditorRole->givePermissionTo('blog.view');
    $editor = User::factory()->create();
    $editor->assignRole($blogEditorRole);

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');

    $this->actingAs($editor)->get('/__test/permission-gate')->assertForbidden();
    $this->actingAs($administrator)->get('/__test/permission-gate')->assertOk();
});

test('a role-gated route refuses a user without that role', function () {
    Route::get('/__test/role-gate', fn () => response('ok'))
        ->middleware('role:Administrator');

    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $editor = User::factory()->create();
    $editor->assignRole($blogEditorRole);

    $this->actingAs($editor)->get('/__test/role-gate')->assertForbidden();
});

test('a role-or-permission-gated route admits a user holding only the permission', function () {
    Route::get('/__test/role-or-permission-gate', fn () => response('ok'))
        ->middleware('role_or_permission:Super Admin|roles.manage');

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');

    $this->actingAs($administrator)->get('/__test/role-or-permission-gate')->assertOk();
});

test('a role-or-permission-gated route admits a user holding only the role', function () {
    Route::get('/__test/role-or-permission-gate-role', fn () => response('ok'))
        ->middleware('role_or_permission:Super Admin|roles.manage');

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $this->actingAs($superAdmin)->get('/__test/role-or-permission-gate-role')->assertOk();
});

test('a Super Admin reaches a permission-gated route without holding the permission', function () {
    Route::get('/__test/permission-gate-super-admin', fn () => response('ok'))
        ->middleware('permission:products.delete');

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $this->actingAs($superAdmin)->get('/__test/permission-gate-super-admin')->assertOk();
});

// F4 — this pins the documented limit of the Gate::before bypass: bare `role:` middleware
// calls hasAnyRole() directly and never routes through the Gate, so it never reaches the
// bypass. This is specified behavior, not a defect — it is exactly why every route/component
// in this app must gate on permissions (can:/permission:), never on role names alone.
test('a role-gated route refuses even a Super Admin, because a bare role check never reaches the bypass', function () {
    Route::get('/__test/role-gate-refuses-super-admin', fn () => response('ok'))
        ->middleware('role:Administrator');

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');

    $this->actingAs($superAdmin)->get('/__test/role-gate-refuses-super-admin')->assertForbidden();
});
