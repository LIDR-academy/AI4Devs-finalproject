<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test("assigning a role stores the user's uuid in the renamed morph-key column", function () {
    $user = User::factory()->create();
    Role::create(['name' => 'editor']);

    $user->assignRole('editor');

    $morphKeyColumn = config('permission.column_names.model_morph_key');

    $storedModelId = DB::table('model_has_roles')
        ->where('model_type', User::class)
        ->value($morphKeyColumn);

    expect($storedModelId)->toBe($user->id)
        ->and(Str::isUuid($storedModelId, 7))->toBeTrue();
});

test('an assigned role is recognized after the conversion', function () {
    $user = User::factory()->create();
    Role::create(['name' => 'editor']);

    $user->assignRole('editor');

    expect($user->hasRole('editor'))->toBeTrue();
});

test('removing a role revokes it', function () {
    $user = User::factory()->create();
    Role::create(['name' => 'editor']);
    $user->assignRole('editor');

    $user->removeRole('editor');

    expect($user->fresh()->hasRole('editor'))->toBeFalse();
});

test('a granted permission is recognized', function () {
    $user = User::factory()->create();
    $role = Role::create(['name' => 'editor']);
    Permission::create(['name' => 'edit articles']);
    $role->givePermissionTo('edit articles');

    $user->assignRole('editor');

    expect($user->hasPermissionTo('edit articles'))->toBeTrue();
});

test('role assignments do not cross-contaminate between users', function () {
    $editor = User::factory()->create();
    $viewer = User::factory()->create();

    Role::create(['name' => 'editor']);
    Role::create(['name' => 'viewer']);

    $editor->assignRole('editor');
    $viewer->assignRole('viewer');

    expect($editor->fresh()->hasRole('editor'))->toBeTrue()
        ->and($editor->fresh()->hasRole('viewer'))->toBeFalse()
        ->and($viewer->fresh()->hasRole('viewer'))->toBeTrue()
        ->and($viewer->fresh()->hasRole('editor'))->toBeFalse();
});
