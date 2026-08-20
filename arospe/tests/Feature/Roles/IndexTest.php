<?php

// Story 0010 — App\Livewire\Roles\Index: create, rename and delete custom
// roles, sync their per-module permissions, and hard-block deletion of a
// role that still has holders. Deliberately does NOT invoke 0002's full
// RolePermissionSeeder (per this story's own task-file test-arrangement
// notes) -- fixture permission/role rows are created directly, so this
// suite stays decoupled from the catalog's exact contents. The one place a
// real permission string matters is the gate itself: 'roles.manage'.

use App\Exceptions\RoleInUseException;
use App\Livewire\Roles\Index;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Livewire\Livewire;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

/**
 * Get-or-create a `web`-guard permission fixture row.
 */
function rolesTestPermission(string $name): Permission
{
    return Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
}

/**
 * A user holding `roles.manage` plus any given extra permissions -- extra
 * permissions matter since story 0010's Phase 4 security-audit fix
 * (finding F2, App\Actions\Roles\EnforceGrantorPermissionScope) refuses
 * saveRole() from granting a role any permission the acting user does not
 * themselves hold. Pass every permission a test's saveRole() call newly
 * grants to a role; omit it for tests that only rename, delete, revoke, or
 * grant a permission the target role already held.
 *
 * @param  array<int, string>  $extraPermissions
 */
function rolesTestActor(array $extraPermissions = []): User
{
    rolesTestPermission('roles.manage');

    $actor = User::factory()->create();
    $actor->givePermissionTo('roles.manage');

    foreach ($extraPermissions as $permission) {
        rolesTestPermission($permission);
        $actor->givePermissionTo($permission);
    }

    return $actor;
}

// =====================================================================
// Create — happy path, and the zero-permission legal state.
// =====================================================================

test('creating a role persists exactly the selected permissions', function () {
    $blogView = rolesTestPermission('blog.view');
    $blogEdit = rolesTestPermission('blog.edit');
    rolesTestPermission('products.view'); // deliberately not selected

    $this->actingAs(rolesTestActor(['blog.view', 'blog.edit']));

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Blog Editor')
        ->set('selectedPermissionIds', [$blogView->id, $blogEdit->id])
        ->call('saveRole')
        ->assertHasNoErrors();

    $role = Role::where('name', 'Blog Editor')->where('guard_name', 'web')->firstOrFail();

    expect($role->permissions->pluck('name')->sort()->values()->all())->toBe(['blog.edit', 'blog.view']);
});

test('a newly created role appears immediately in the selectable roles list', function () {
    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Placeholder Role')
        ->call('saveRole')
        ->assertHasNoErrors();

    expect(Role::query()->selectable()->pluck('name'))->toContain('Placeholder Role');
});

test('a role created with zero permissions is a legal, inert state', function () {
    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Empty Role')
        ->call('saveRole')
        ->assertHasNoErrors();

    $role = Role::where('name', 'Empty Role')->where('guard_name', 'web')->firstOrFail();

    expect($role->permissions)->toBeEmpty();
});

test('a created role persists guard_name web explicitly', function () {
    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Guarded Role')
        ->call('saveRole')
        ->assertHasNoErrors();

    expect(Role::where('name', 'Guarded Role')->value('guard_name'))->toBe('web');
});

// =====================================================================
// Rename — the name changes, the permission set is untouched.
// =====================================================================

test('renaming a role leaves its permission id set identical', function () {
    $blogView = rolesTestPermission('blog.view');
    $blogEdit = rolesTestPermission('blog.edit');

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $role->syncPermissions([$blogView->name, $blogEdit->name]);
    $before = $role->permissions->pluck('id')->sort()->values()->all();

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openEditModal', $role->id)
        ->set('name', 'Content Editor')
        ->call('saveRole')
        ->assertHasNoErrors();

    $role->refresh();

    expect($role->name)->toBe('Content Editor')
        ->and($role->permissions->pluck('id')->sort()->values()->all())->toBe($before);
});

// =====================================================================
// Cascading permission changes — cache invalidation for both directions,
// and isolation between an edited role and everything else.
// =====================================================================

test('revoking a permission from a role takes effect for all of its holders, proven against a warm cache', function () {
    $blogDelete = rolesTestPermission('blog.delete');
    $blogView = rolesTestPermission('blog.view');

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $role->syncPermissions([$blogDelete->name, $blogView->name]);

    $holders = User::factory()->count(3)->create();
    foreach ($holders as $holder) {
        $holder->assignRole($role);
        // Warm the cache before the change -- without this there is no
        // stale cache for the assertion below to actually catch.
        expect($holder->hasPermissionTo('blog.delete'))->toBeTrue();
    }

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openEditModal', $role->id)
        ->set('selectedPermissionIds', [$blogView->id])
        ->call('saveRole')
        ->assertHasNoErrors();

    foreach ($holders as $holder) {
        $fresh = User::find($holder->id);
        expect($fresh->hasPermissionTo('blog.delete'))->toBeFalse()
            ->and($fresh->hasPermissionTo('blog.view'))->toBeTrue();
    }
});

test('granting a permission to a role reaches all of its holders, proven against a warm cache', function () {
    $productsView = rolesTestPermission('products.view');
    $blogView = rolesTestPermission('blog.view');

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $role->syncPermissions([$blogView->name]);

    $holders = User::factory()->count(3)->create();
    foreach ($holders as $holder) {
        $holder->assignRole($role);
        expect($holder->hasPermissionTo('products.view'))->toBeFalse();
    }

    $this->actingAs(rolesTestActor(['products.view']));

    Livewire::test(Index::class)
        ->call('openEditModal', $role->id)
        ->set('selectedPermissionIds', [$blogView->id, $productsView->id])
        ->call('saveRole')
        ->assertHasNoErrors();

    foreach ($holders as $holder) {
        expect(User::find($holder->id)->hasPermissionTo('products.view'))->toBeTrue();
    }
});

test('editing one role leaves an unrelated role and its warm-cached holder untouched', function () {
    $productsDelete = rolesTestPermission('products.delete');
    $blogView = rolesTestPermission('blog.view');

    $blogEditor = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $blogEditor->syncPermissions([$blogView->name]);

    $storeManager = Role::create(['name' => 'Store Manager', 'guard_name' => 'web']);
    $storeManager->syncPermissions([$productsDelete->name]);

    $storeManagerHolder = User::factory()->create();
    $storeManagerHolder->assignRole($storeManager);
    expect($storeManagerHolder->hasPermissionTo('products.delete'))->toBeTrue();

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openEditModal', $blogEditor->id)
        ->set('selectedPermissionIds', [])
        ->call('saveRole')
        ->assertHasNoErrors();

    expect(User::find($storeManagerHolder->id)->hasPermissionTo('products.delete'))->toBeTrue();
});

// =====================================================================
// Delete — the zero-holder case, and the hard block with an exact count.
// =====================================================================

test('deleting a role with zero holders removes it and leaves no orphaned permission grants', function () {
    $blogView = rolesTestPermission('blog.view');

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $role->syncPermissions([$blogView->name]);
    $roleId = $role->id;

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('confirmDeleteRole', $roleId)
        ->call('deleteRole')
        ->assertHasNoErrors();

    expect(Role::find($roleId))->toBeNull()
        ->and(DB::table('role_has_permissions')->where('role_id', $roleId)->exists())->toBeFalse();
});

test('deleting a role still assigned to 3 users is blocked, names the count, and leaves the role and its holders intact', function () {
    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $holders = User::factory()->count(3)->create();
    foreach ($holders as $holder) {
        $holder->assignRole($role);
    }

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('confirmDeleteRole', $role->id)
        ->call('deleteRole')
        ->assertHasErrors(['deletingRoleId']);

    expect(Role::find($role->id))->not->toBeNull();

    foreach ($holders as $holder) {
        expect($holder->fresh()->hasRole('Blog Editor'))->toBeTrue();
    }
});

test('deleting a role held by exactly 1 user is refused with a correct singular message', function () {
    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $holder = User::factory()->create();
    $holder->assignRole($role);

    $this->actingAs(rolesTestActor());

    $component = Livewire::test(Index::class)
        ->call('confirmDeleteRole', $role->id)
        ->call('deleteRole');

    $component->assertHasErrors(['deletingRoleId']);

    // errors() returns a MessageBag, not an array -- first() is the accessor
    // for a single field's message, matching Livewire's own TestsValidation
    // trait rather than array-indexing the bag.
    $message = $component->errors()->first('deletingRoleId');

    expect($message)->toContain('1')
        ->and($message)->not->toContain('users'); // singular branch, not the plural one
});

test('$role->delete() called directly, bypassing the component entirely, is also blocked by the model-event guard', function () {
    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $holder = User::factory()->create();
    $holder->assignRole($role);

    expect(fn () => $role->delete())->toThrow(RoleInUseException::class);

    expect(Role::find($role->id))->not->toBeNull();
});

// =====================================================================
// Validation — nothing persists on a rejected payload, and an edit's
// existing permission set is provably unchanged.
// =====================================================================

test('a blank name is refused and nothing is persisted', function () {
    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', '')
        ->call('saveRole')
        ->assertHasErrors(['name']);

    expect(Role::query()->count())->toBe(0);
});

test('a name already used by another role is refused', function () {
    Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Blog Editor')
        ->call('saveRole')
        ->assertHasErrors(['name']);

    expect(Role::where('name', 'Blog Editor')->where('guard_name', 'web')->count())->toBe(1);
});

test('a name differing from an existing role only by case is refused', function () {
    Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'BLOG EDITOR')
        ->call('saveRole')
        ->assertHasErrors(['name']);

    expect(Role::query()->count())->toBe(1);
});

test('a name differing from an existing role only by surrounding spaces is refused', function () {
    Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', '  Blog Editor  ')
        ->call('saveRole')
        ->assertHasErrors(['name']);

    expect(Role::query()->count())->toBe(1);
});

test('a permission id absent from the catalog is refused', function () {
    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Blog Editor')
        ->set('selectedPermissionIds', [999999])
        ->call('saveRole')
        ->assertHasErrors(['selectedPermissionIds.0']);

    expect(Role::query()->count())->toBe(0);
});

test('a rejected edit payload leaves the role\'s existing permission set provably unchanged', function () {
    $blogView = rolesTestPermission('blog.view');
    Role::create(['name' => 'Taken Name', 'guard_name' => 'web']);

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $role->syncPermissions([$blogView->name]);
    $before = $role->permissions->pluck('id')->sort()->values()->all();

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openEditModal', $role->id)
        ->set('name', 'Taken Name')
        ->set('selectedPermissionIds', [])
        ->call('saveRole')
        ->assertHasErrors(['name']);

    $role->refresh();

    expect($role->permissions->pluck('id')->sort()->values()->all())->toBe($before);
});

// =====================================================================
// Route-level access — guest, unprivileged, and the happy path.
// =====================================================================

test('a guest visiting /roles is redirected to sign-in', function () {
    $this->get(route('roles.index'))->assertRedirect(route('login'));
});

test('an authenticated user without roles.manage visiting /roles is forbidden', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('roles.index'))->assertForbidden();
});

test('a user holding roles.manage can mount the component', function () {
    $this->actingAs(rolesTestActor());

    $this->get(route('roles.index'))->assertOk();
});

// =====================================================================
// Component-level authorization — every mutating and disclosure method
// re-checks independently of the route, and a refusal leaves no side
// effect. withoutExceptionHandling() is required so the AuthorizationException
// propagates to toThrow() instead of being converted to a 403 response by
// the framework's exception handler (Livewire::test() runs through the
// full HTTP kernel).
// =====================================================================

test('mounting the component directly is forbidden for a user lacking roles.manage', function () {
    $this->withoutExceptionHandling();
    // The permission row must exist in the catalog -- just not be granted to
    // this user. Without it, Spatie's hasPermissionTo() throws
    // PermissionDoesNotExist (a 500) instead of RolePolicy::viewAny()
    // returning false cleanly, which would fail this test for the wrong
    // reason.
    rolesTestPermission('roles.manage');
    $user = User::factory()->create();
    $this->actingAs($user);

    expect(fn () => Livewire::test(Index::class))->toThrow(AuthorizationException::class);
});

test('calling saveRole() directly without roles.manage is refused and persists nothing', function () {
    $this->withoutExceptionHandling();
    $actor = rolesTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class)->call('openCreateModal');

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->set('name', 'Should Not Persist')->call('saveRole'))
        ->toThrow(AuthorizationException::class);

    expect(Role::where('name', 'Should Not Persist')->exists())->toBeFalse();
});

test('calling deleteRole() directly without roles.manage is refused and the role still exists', function () {
    $this->withoutExceptionHandling();
    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $actor = rolesTestActor();
    $this->actingAs($actor);

    // deletingRoleId must be populated -- via confirmDeleteRole(), while the
    // actor still holds roles.manage -- before the permission is revoked.
    // deleteRole() short-circuits on its own null guard before ever reaching
    // Gate::authorize(), so without this the test would prove nothing about
    // the authorization check it targets.
    $component = Livewire::test(Index::class)->call('confirmDeleteRole', $role->id);

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('deleteRole'))->toThrow(AuthorizationException::class);
    expect(Role::find($role->id))->not->toBeNull();
});

test('openEditModal() is refused for a user lacking roles.manage without disclosing the target role', function () {
    $this->withoutExceptionHandling();
    $role = Role::create(['name' => 'Sensitive Role Name', 'guard_name' => 'web']);

    $actor = rolesTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('openEditModal', $role->id))->toThrow(AuthorizationException::class);
    expect($component->get('name'))->toBe('')
        ->and($component->get('selectedPermissionIds'))->toBe([]);
});

test('confirmDeleteRole() is refused for a user lacking roles.manage without disclosing the target role name', function () {
    $this->withoutExceptionHandling();
    $role = Role::create(['name' => 'Sensitive Role Name', 'guard_name' => 'web']);

    $actor = rolesTestActor();
    $this->actingAs($actor);

    $component = Livewire::test(Index::class);

    $actor->revokePermissionTo('roles.manage');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->call('confirmDeleteRole', $role->id))->toThrow(AuthorizationException::class);
    expect($component->get('deletingRoleName'))->toBe('');
});

// =====================================================================
// Super Admin exclusion — the roles list and forged-id targeting.
// =====================================================================

test('the roles list excludes the Super Admin role', function () {
    $superAdmin = Role::firstOrCreateSuperAdminRole();
    Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $this->actingAs(rolesTestActor());

    $names = collect(Livewire::test(Index::class)->get('roles'))->pluck('name');

    expect($names)->not->toContain($superAdmin->name)
        ->and($names)->toContain('Blog Editor');
});

test('targeting the Super Admin role by forged id via openEditModal() is refused -- the only reachable path into saveRole()\'s edit branch, since editingRoleId is #[Locked]', function () {
    $this->withoutExceptionHandling();
    $superAdmin = Role::firstOrCreateSuperAdminRole();

    $this->actingAs(rolesTestActor());

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', $superAdmin->id))
        ->toThrow(AuthorizationException::class);
});

test('targeting the Super Admin role by forged id via confirmDeleteRole() is refused -- the only reachable path into deleteRole(), since deletingRoleId is #[Locked]', function () {
    $this->withoutExceptionHandling();
    $superAdmin = Role::firstOrCreateSuperAdminRole();

    $this->actingAs(rolesTestActor());

    expect(fn () => Livewire::test(Index::class)->call('confirmDeleteRole', $superAdmin->id))
        ->toThrow(AuthorizationException::class);

    expect(Role::find($superAdmin->id))->not->toBeNull();
});

// =====================================================================
// viewAny / create — the two abilities this story adds to RolePolicy.
// =====================================================================

test('viewAny and create each return false for an actor lacking roles.manage and true for one holding it', function (string $ability) {
    $unprivileged = User::factory()->create();
    $privileged = rolesTestActor();

    expect(Gate::forUser($unprivileged)->allows($ability, Role::class))->toBeFalse()
        ->and(Gate::forUser($privileged)->allows($ability, Role::class))->toBeTrue();
})->with(['viewAny', 'create']);

// =====================================================================
// guard_name scoping (N3) — the composite unique(['name', 'guard_name'])
// index, not a bare name-uniqueness assumption.
// =====================================================================

test('a role name already taken on another guard does not collide', function () {
    Role::create(['name' => 'Blog Editor', 'guard_name' => 'api']);

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Blog Editor')
        ->call('saveRole')
        ->assertHasNoErrors();

    expect(Role::where('name', 'Blog Editor')->where('guard_name', 'web')->exists())->toBeTrue();
});

test('a permission id belonging to a non-web guard is rejected and never reaches syncPermissions()', function () {
    $foreignPermission = Permission::create(['name' => 'blog.view', 'guard_name' => 'api']);

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Blog Editor')
        ->set('selectedPermissionIds', [$foreignPermission->id])
        ->call('saveRole')
        ->assertHasErrors(['selectedPermissionIds.0']);

    expect(Role::where('name', 'Blog Editor')->exists())->toBeFalse();
});

// =====================================================================
// Phase 4 security audit finding F2 (self-escalation) — the component's
// wiring of App\Actions\Roles\EnforceGrantorPermissionScope, distinct
// from that action's own unit-style test file, which covers the rule
// itself in isolation.
// =====================================================================

test('saveRole() refuses a payload that grants a permission the acting user does not themselves hold, and persists nothing', function () {
    $this->withoutExceptionHandling();
    $blogView = rolesTestPermission('blog.view');

    $this->actingAs(rolesTestActor());

    expect(fn () => Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Blog Editor')
        ->set('selectedPermissionIds', [$blogView->id])
        ->call('saveRole'))
        ->toThrow(AuthorizationException::class);

    expect(Role::where('name', 'Blog Editor')->exists())->toBeFalse();
});

// =====================================================================
// Phase 4 security audit finding F7 (self-lockout) — refusing a save
// that would strip roles.manage from a role the acting user currently
// holds.
// =====================================================================

test('saving a role the actor holds is refused if the payload would strip roles.manage from it, and the role is unchanged', function () {
    $roleManage = rolesTestPermission('roles.manage');
    $blogView = rolesTestPermission('blog.view');

    $actor = rolesTestActor(['blog.view']);
    $ownRole = Role::create(['name' => 'Custom Manager', 'guard_name' => 'web']);
    $ownRole->syncPermissions([$roleManage->name, $blogView->name]);
    $actor->assignRole($ownRole);

    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openEditModal', $ownRole->id)
        ->set('selectedPermissionIds', [$blogView->id])
        ->call('saveRole')
        ->assertHasErrors(['selectedPermissionIds']);

    expect($ownRole->fresh()->permissions->pluck('name')->sort()->values()->all())
        ->toBe(['blog.view', 'roles.manage']);
});

test('saving a role the actor does NOT hold is unaffected by the self-lockout guard, even when it strips roles.manage', function () {
    $roleManage = rolesTestPermission('roles.manage');
    $blogView = rolesTestPermission('blog.view');

    $this->actingAs(rolesTestActor(['blog.view']));
    $otherRole = Role::create(['name' => 'Someone Elses Role', 'guard_name' => 'web']);
    $otherRole->syncPermissions([$roleManage->name, $blogView->name]);

    Livewire::test(Index::class)
        ->call('openEditModal', $otherRole->id)
        ->set('selectedPermissionIds', [$blogView->id])
        ->call('saveRole')
        ->assertHasNoErrors();

    expect($otherRole->fresh()->permissions->pluck('name')->all())->toBe(['blog.view']);
});

// =====================================================================
// Phase 4 security audit finding F3 (soft-deleted holders) — the
// component's deletion block, driven through the same withCount()
// query the model-event guard mirrors.
// =====================================================================

test('deleting a role whose only holder is soft-deleted is still blocked, naming the holder', function () {
    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $holder = User::factory()->create();
    $holder->assignRole($role);
    $holder->delete();

    $this->actingAs(rolesTestActor());

    Livewire::test(Index::class)
        ->call('confirmDeleteRole', $role->id)
        ->call('deleteRole')
        ->assertHasErrors(['deletingRoleId']);

    expect(Role::find($role->id))->not->toBeNull();
});

// =====================================================================
// Phase 4 security audit finding F8 (audit trail) — saveRole() and
// deleteRole() each leave a structured log line naming the actor, the
// role, and (for saveRole()) the permission diff.
// =====================================================================

test('saveRole() logs the actor, the role, and the permission diff', function () {
    Log::spy();

    $blogView = rolesTestPermission('blog.view');

    $actor = rolesTestActor(['blog.view']);
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Blog Editor')
        ->set('selectedPermissionIds', [$blogView->id])
        ->call('saveRole')
        ->assertHasNoErrors();

    $role = Role::where('name', 'Blog Editor')->firstOrFail();

    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context) => $message === 'Role saved'
            && $context['actor_id'] === $actor->id
            && $context['role_id'] === $role->id
            && $context['permissions_granted'] === ['blog.view'])
        ->once();
});

test('deleteRole() logs the actor and the deleted role', function () {
    Log::spy();

    $role = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $roleId = $role->id;

    $actor = rolesTestActor();
    $this->actingAs($actor);

    Livewire::test(Index::class)
        ->call('confirmDeleteRole', $roleId)
        ->call('deleteRole')
        ->assertHasNoErrors();

    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context) => $message === 'Role deleted'
            && $context['actor_id'] === $actor->id
            && $context['role_id'] === $roleId)
        ->once();
});
