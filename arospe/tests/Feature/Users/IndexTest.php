<?php

use App\Enums\UserStatus;
use App\Livewire\Users\Index;
use App\Models\User;
use App\Notifications\PendingEmailVerification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolePermissionSeeder::class);
});

// =====================================================================
// Livewire::test(Index::class)
// =====================================================================

// --- Listing, counts, ordering ---

test('the list includes a roleless user and the acting administrators own row', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $roleless = User::factory()->create();

    $ids = collect(Livewire::test(Index::class)->get('users'))->pluck('id');

    expect($ids)->toContain($administrator->id)
        ->and($ids)->toContain($roleless->id);
});

test('each row exposes the id, name, email, pendingEmail, role and status the view contract requires', function () {
    // Code review finding (Phase 5): nothing previously asserted this shape beyond id/name, so a
    // regression renaming a key, returning the Role model instead of its name, or dropping a field
    // would pass every other test here while breaking story 0006's locked interface contract.
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $roled = User::factory()
        ->pendingEmail('mid-flight@arospe.es')
        ->create(['name' => 'Roled User', 'email' => 'roled@arospe.es', 'status' => UserStatus::Active]);
    $roled->assignRole($editorRole);

    $roleless = User::factory()->create(['name' => 'Roleless User', 'email' => 'roleless@arospe.es', 'status' => UserStatus::Inactive]);

    $users = collect(Livewire::test(Index::class)->get('users'));

    expect($users->firstWhere('id', $roled->id))->toBe([
        'id' => $roled->id,
        'name' => 'Roled User',
        'email' => 'roled@arospe.es',
        'pendingEmail' => 'mid-flight@arospe.es',
        'role' => 'Editor',
        'status' => UserStatus::Active,
    ]);

    expect($users->firstWhere('id', $roleless->id))->toBe([
        'id' => $roleless->id,
        'name' => 'Roleless User',
        'email' => 'roleless@arospe.es',
        'pendingEmail' => null,
        'role' => null,
        'status' => UserStatus::Inactive,
    ]);
});

test('users are listed alphabetically by name', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    User::factory()->create(['name' => 'Zoe Marin']);
    User::factory()->create(['name' => 'Ana Gil']);
    User::factory()->create(['name' => 'Diego Ferrer']);

    $names = collect(Livewire::test(Index::class)->get('users'))
        ->pluck('name')
        ->filter(fn (string $name): bool => in_array($name, ['Ana Gil', 'Diego Ferrer', 'Zoe Marin'], true))
        ->values()
        ->all();

    expect($names)->toBe(['Ana Gil', 'Diego Ferrer', 'Zoe Marin']);
});

// Story 0005 (verification only -- no component edit permitted). Both
// Index::loadUsers() and Index::usersSummary() run a bare User::query(), so
// the SoftDeletingScope installed on App\Models\User covers list rows and
// summary counts automatically. This proves that, it does not implement it.
test('a soft-deleted user is absent from the active users list and from both summary counts', function () {
    $baselineTotal = User::count();
    $baselineActive = User::where('status', UserStatus::Active)->count();

    $administrator = User::factory()->create(['status' => UserStatus::Active]);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $target = User::factory()->create(['name' => 'Diego Ferrer', 'status' => UserStatus::Active]);
    $target->delete();

    $component = Livewire::test(Index::class);

    $ids = collect($component->get('users'))->pluck('id');
    $summary = $component->get('usersSummary');

    // Only the administrator was added to the baseline -- the deleted target
    // must not appear in the list or inflate either count.
    expect($ids)->not->toContain($target->id)
        ->and($summary['total'])->toBe($baselineTotal + 1)
        ->and($summary['active'])->toBe($baselineActive + 1);
});

test('usersSummary reports accurate totals computed independently of the users property, and counts a Super Admin holder in the total', function () {
    // Baseline against whatever already exists after the beforeEach seed, rather than
    // asserting an absolute count: RolePermissionSeeder's bootstrap provisions an extra
    // Super Admin user whenever the ambient SUPER_ADMIN_EMAIL config is set (this repo's
    // .env sets it), which a hardcoded expected total would miss. See docs/errors-log.md's
    // SUPER_ADMIN_EMAIL entry.
    $baselineTotal = User::count();
    $baselineActive = User::where('status', UserStatus::Active)->count();

    $administrator = User::factory()->create(['status' => UserStatus::Active]);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    User::factory()->count(3)->create(['status' => UserStatus::Active]);
    User::factory()->count(2)->create(['status' => UserStatus::Inactive]);

    $superAdmin = User::factory()->create(['status' => UserStatus::Active]);
    $superAdmin->assignRole('Super Admin');

    // added: administrator + 3 active + 2 inactive + super admin = 7
    // added active: administrator + 3 active + super admin = 5
    $component = Livewire::test(Index::class)->set('users', []);

    $summary = $component->get('usersSummary');

    expect($summary['total'])->toBe($baselineTotal + 7)
        ->and($summary['active'])->toBe($baselineActive + 5);
});

test('roleOptions excludes the Super Admin role', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $roleOptionsJson = json_encode(Livewire::test(Index::class)->get('roleOptions'));

    expect($roleOptionsJson)->toContain('Administrator')
        ->and($roleOptionsJson)->not->toContain('Super Admin');
});

test('the list query does not N plus 1 as the number of users grows', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    User::factory()->count(5)->create()->each(fn (User $user) => $user->assignRole($editorRole));

    // Warm Spatie's permission cache with a throwaway call before measuring: the first
    // Gate::authorize() in a process cold-loads and caches all permission/role data (a
    // fixed one-time cost, unrelated to the user count), which would otherwise be
    // miscounted as part of the list query's own cost and break the comparison below.
    Livewire::test(Index::class)->get('users');

    DB::enableQueryLog();
    Livewire::test(Index::class)->get('users');
    $smallQueryCount = count(DB::getQueryLog());
    DB::flushQueryLog();

    User::factory()->count(5)->create()->each(fn (User $user) => $user->assignRole($editorRole));
    DB::flushQueryLog();

    Livewire::test(Index::class)->get('users');
    $largeQueryCount = count(DB::getQueryLog());
    DB::disableQueryLog();

    expect($largeQueryCount)->toBe($smallQueryCount);
});

// --- Creating a user ---

test('creating a user via the form persists the user with the submitted role and status', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Hire')
        ->set('email', 'new.hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'new.hire@arospe.es')->firstOrFail();

    expect($created->name)->toBe('New Hire')
        ->and($created->status)->toBe(UserStatus::Active)
        ->and($created->hasRole('Editor'))->toBeTrue();
});

test('creating a user with invalid details is rejected and no user is created', function (Closure $overridesFactory) {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    $countBefore = User::count();

    $component = Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Valid Name')
        ->set('email', 'valid.create@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active);

    foreach ($overridesFactory() as $property => $value) {
        $component->set($property, $value);
    }

    $component->call('save')->assertHasErrors();

    expect(User::count())->toBe($countBefore);
})->with([
    'a blank name' => [fn () => ['name' => '']],
    'a malformed email address' => [fn () => ['email' => 'not-an-email']],
    'no role chosen' => [fn () => ['roleId' => null]],
    'a role that does not exist' => [fn () => ['roleId' => '999999999']],
    'the Super Admin role' => [fn () => ['roleId' => (string) Role::where('name', 'Super Admin')->where('guard_name', 'web')->value('id')]],
    // The status property is typed `?UserStatus`, so an out-of-set raw value cannot survive
    // Livewire's enum hydration; null is the closest reachable equivalent and still exercises
    // the 'required' branch of statusRules() with no user created.
    'a status outside the allowed set' => [fn () => ['status' => null]],
]);

test('creating a user with an address held as another users pending email is rejected', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    User::factory()->pendingEmail('claimed@arospe.es')->create();

    $countBefore = User::count();

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Hire')
        ->set('email', 'claimed@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active)
        ->call('save')
        ->assertHasErrors(['email']);

    expect(User::count())->toBe($countBefore);
});

test('creating an active user persists the active status, not the inactive default', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Active Hire')
        ->set('email', 'active.hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'active.hire@arospe.es')->firstOrFail();

    expect($created->status)->toBeInstanceOf(UserStatus::class)
        ->and($created->status)->toBe(UserStatus::Active);
});

test('creating a suspended user persists the suspended status', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Suspended Hire')
        ->set('email', 'suspended.hire@arospe.es')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Suspended)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'suspended.hire@arospe.es')->firstOrFail();

    expect($created->status)->toBe(UserStatus::Suspended);
});

test('the submitted email is lowercased before validation, and persisted lowercased', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Marta Ruiz')
        ->set('email', 'MARTA@X.COM')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'marta@x.com')->firstOrFail();

    expect($created->getRawOriginal('email'))->toBe('marta@x.com');
});

test('creating a case-different duplicate of an existing email is rejected as a validation error, not an unhandled exception', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    User::factory()->create(['email' => 'marta.ruiz@arospe.es']);

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'Marta Duplicate')
        ->set('email', 'MARTA.RUIZ@AROSPE.ES')
        ->set('roleId', (string) $role->id)
        ->set('status', UserStatus::Active)
        ->call('save')
        ->assertHasErrors(['email']);

    expect(User::where('email', 'marta.ruiz@arospe.es')->count())->toBe(1);
});

// --- Editing a user ---

test('changing a users role detaches the previous role, leaving exactly one', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $target = User::factory()->create(['name' => 'Diego Ferrer']);
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $blogEditorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    $target->refresh();

    expect($target->hasRole('Blog Editor'))->toBeTrue()
        ->and($target->hasRole('Editor'))->toBeFalse()
        ->and($target->roles()->count())->toBe(1);

    $morphKeyColumn = config('permission.column_names.model_morph_key');
    $rowCount = DB::table('model_has_roles')
        ->where('model_type', User::class)
        ->where($morphKeyColumn, $target->id)
        ->count();

    expect($rowCount)->toBe(1);
});

test('a user administrator changes another users status', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('status', UserStatus::Suspended)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->status)->toBe(UserStatus::Suspended);
});

test('an administrator can save another user unchanged email', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'target@arospe.es']);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('name', 'Target Renamed')
        ->set('email', 'target@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->name)->toBe('Target Renamed');
});

test('an administrator can save their own unchanged email', function () {
    $administrator = User::factory()->create(['email' => 'admin@arospe.es']);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Livewire::test(Index::class)
        ->call('openEditModal', $administrator->id)
        ->set('name', 'Admin Renamed')
        ->set('email', 'admin@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    expect($administrator->fresh()->name)->toBe('Admin Renamed');
});

test('changing an email to a different free address is accepted', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'target@arospe.es']);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('email', 'brand-new-free-address@arospe.es')
        ->call('save')
        ->assertHasNoErrors();
});

test('assigning a role that no longer exists is rejected, and the users role is left unchanged', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $vanishingRole = Role::create(['name' => 'Vanishing Role', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($vanishingRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    $vanishingRole->delete();

    $component->set('name', 'Renamed While Role Vanished')
        ->call('save')
        ->assertHasErrors(['roleId']);

    expect($target->fresh()->name)->not->toBe('Renamed While Role Vanished');
});

// --- Changing an email address is never applied immediately ---

test('editing another users email holds it as pending and notifies only the new address', function () {
    Notification::fake();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'target@arospe.es', 'status' => UserStatus::Active]);
    $target->assignRole($role);
    $originalVerifiedAt = $target->email_verified_at;

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('email', 'new-target-address@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    $target->refresh();

    expect($target->getRawOriginal('email'))->toBe('target@arospe.es')
        ->and($target->email_verified_at)->toEqual($originalVerifiedAt)
        ->and($target->status)->toBe(UserStatus::Active)
        ->and($target->pending_email)->toBe('new-target-address@arospe.es');

    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 1);
    Notification::assertSentOnDemand(
        PendingEmailVerification::class,
        fn ($notification, $channels, $notifiable): bool => ($notifiable->routes['mail'] ?? null) === 'new-target-address@arospe.es',
    );
});

test('editing the acting administrators own email holds it as pending', function () {
    Notification::fake();

    $administrator = User::factory()->create(['email' => 'admin@arospe.es', 'status' => UserStatus::Active]);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);
    $originalVerifiedAt = $administrator->email_verified_at;

    Livewire::test(Index::class)
        ->call('openEditModal', $administrator->id)
        ->set('email', 'new-admin-address@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    $administrator->refresh();

    expect($administrator->getRawOriginal('email'))->toBe('admin@arospe.es')
        ->and($administrator->email_verified_at)->toEqual($originalVerifiedAt)
        ->and($administrator->pending_email)->toBe('new-admin-address@arospe.es');

    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 1);
});

test('changing a users name and email at once applies the name immediately, the email staying pending', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'target@arospe.es']);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('name', 'Renamed Immediately')
        ->set('email', 'still-pending@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    $target->refresh();

    expect($target->name)->toBe('Renamed Immediately')
        ->and($target->pending_email)->toBe('still-pending@arospe.es')
        ->and($target->getRawOriginal('email'))->toBe('target@arospe.es');
});

test('saving a user with their email unchanged writes no pending value and sends no notification', function () {
    Notification::fake();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['email' => 'target@arospe.es']);
    $target->assignRole($role);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('name', 'Renamed Only')
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->pending_email)->toBeNull();
    Notification::assertNothingSent();
});

// --- Self-edit guard ---

test('an administrator can update their own name', function () {
    $administrator = User::factory()->create(['name' => 'Old Name']);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Livewire::test(Index::class)
        ->call('openEditModal', $administrator->id)
        ->set('name', 'New Own Name')
        ->call('save')
        ->assertHasNoErrors();

    expect($administrator->fresh()->name)->toBe('New Own Name');
});

test('an administrator submitting a different role for themselves has it silently ignored', function () {
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Livewire::test(Index::class)
        ->call('openEditModal', $administrator->id)
        ->set('roleId', (string) $editorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($administrator->fresh()->hasRole('Administrator'))->toBeTrue()
        ->and($administrator->fresh()->hasRole('Editor'))->toBeFalse();
});

test('an administrator submitting a different status for themselves has it silently ignored', function () {
    $administrator = User::factory()->create(['status' => UserStatus::Active]);
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    Livewire::test(Index::class)
        ->call('openEditModal', $administrator->id)
        ->set('status', UserStatus::Suspended)
        ->call('save')
        ->assertHasNoErrors();

    expect($administrator->fresh()->status)->toBe(UserStatus::Active);
});

test('changing another users role from Editor to Blog Editor applies, unaffected by the stricter administrator permission', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);

    $target = User::factory()->create();
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $blogEditorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->hasRole('Blog Editor'))->toBeTrue()
        ->and($target->fresh()->hasRole('Editor'))->toBeFalse();
});

// --- Authorization ---

test('a blog editor whose role does not grant users.view is denied server-side, not merely hidden in the UI', function () {
    $blogEditorRole = Role::create(['name' => 'Blog Editor', 'guard_name' => 'web']);
    $blogEditorRole->givePermissionTo('blog.view');

    $editor = User::factory()->create();
    $editor->assignRole($blogEditorRole);
    $this->actingAs($editor);

    $this->get(route('users.index'))->assertForbidden();
});

test('mounting the component directly is forbidden for a user lacking users.view, even though route middleware never ran', function () {
    // Livewire::test() dispatches through the full HTTP kernel, so without this
    // the framework's exception handler converts the AuthorizationException into
    // a 403 response instead of letting it propagate to toThrow().
    $this->withoutExceptionHandling();
    $user = User::factory()->create();
    $this->actingAs($user);

    expect(fn () => Livewire::test(Index::class))->toThrow(AuthorizationException::class);
});

test('authorization for editing is re-checked inside save, not only at mount', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $role = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($role);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    // The permission to edit was revoked (the Administrator role removed) after the modal was
    // already open -- exactly the "revoked after the screen loaded" scenario.
    $administrator->removeRole('Administrator');
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    expect(fn () => $component->set('name', 'Should Not Persist')->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->name)->not->toBe('Should Not Persist');
});

test('submitting the Super Admin role id is refused server-side, and that users role is left unchanged', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $superAdminRole = Role::where('name', 'Super Admin')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $superAdminRole->id)
        ->call('save')
        ->assertHasErrors(['roleId']);

    expect($target->fresh()->hasRole('Editor'))->toBeTrue()
        ->and($target->fresh()->hasRole('Super Admin'))->toBeFalse();
});

test('editing a user who holds the Super Admin role is refused, and that user is unchanged', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $superAdminUser = User::factory()->create(['name' => 'Untouchable']);
    $superAdminUser->assignRole('Super Admin');

    expect(fn () => Livewire::test(Index::class)
        ->call('openEditModal', $superAdminUser->id)
        ->set('name', 'Should Not Change')
        ->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($superAdminUser->fresh()->name)->toBe('Untouchable');
});

// --- Administrator-level guards ---

test('creating a user holding the seeded Administrator role is denied without the stricter permission, and no user is created', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $countBefore = User::count();

    expect(fn () => Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Administrator')
        ->set('email', 'new.administrator@arospe.es')
        ->set('roleId', (string) $administratorRole->id)
        ->set('status', UserStatus::Active)
        ->call('save'))
        ->toThrow(AuthorizationException::class);

    expect(User::count())->toBe($countBefore);
});

test('creating a user holding the seeded Administrator role succeeds with the stricter permission', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();

    Livewire::test(Index::class)
        ->call('openCreateModal')
        ->set('name', 'New Administrator')
        ->set('email', 'new.administrator@arospe.es')
        ->set('roleId', (string) $administratorRole->id)
        ->set('status', UserStatus::Active)
        ->call('save')
        ->assertHasNoErrors();

    $created = User::where('email', 'new.administrator@arospe.es')->firstOrFail();

    expect($created->hasRole('Administrator'))->toBeTrue();
});

test('promoting a user to Administrator without the stricter permission is denied, and that users role is left unchanged', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    expect(fn () => $component->set('roleId', (string) $administratorRole->id)->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->hasRole('Editor'))->toBeTrue()
        ->and($target->fresh()->hasRole('Administrator'))->toBeFalse();
});

test('promoting a user to Administrator with the stricter permission succeeds', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $administratorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->hasRole('Administrator'))->toBeTrue();
});

test('downgrading an Administrator without the stricter permission is denied, and that users role is left unchanged', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    expect(fn () => $component->set('roleId', (string) $editorRole->id)->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->hasRole('Administrator'))->toBeTrue();
});

test('downgrading an Administrator with the stricter permission succeeds', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $editorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->hasRole('Editor'))->toBeTrue()
        ->and($target->fresh()->hasRole('Administrator'))->toBeFalse();
});

test('deleting a user holding the Administrator role without the stricter permission is denied, and that user still exists', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    $component = Livewire::test(Index::class)->call('confirmDelete', $target->id);

    expect(fn () => $component->call('deleteUser'))->toThrow(AuthorizationException::class);

    expect(User::find($target->id))->not->toBeNull();
});

test('deleting a user holding the Administrator role succeeds with the stricter permission', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create();
    $target->assignRole($administratorRole);

    Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->call('deleteUser');

    expect(User::find($target->id))->toBeNull();
});

test('deleting an ordinary roleless user is not blocked by the administrator-level guard', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators, but holds users.delete
    $this->actingAs($administrator);

    $target = User::factory()->create();

    Livewire::test(Index::class)
        ->call('confirmDelete', $target->id)
        ->call('deleteUser');

    expect(User::find($target->id))->toBeNull();
});

test('saving an existing Administrator without changing their role is not a role change, and succeeds without the stricter permission', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['name' => 'Existing Admin']);
    $target->assignRole($administratorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('name', 'Existing Admin Renamed')
        ->set('roleId', (string) $administratorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->name)->toBe('Existing Admin Renamed')
        ->and($target->fresh()->hasRole('Administrator'))->toBeTrue();
});

// --- Security audit finding F1 (Phase 4): status/email on an Administrator target ---
// require roles.manage-administrators too, not only a role change -- suspending or
// seizing an Administrator's account is the same effect a role-change guard exists
// to prevent.

test('changing an Administrators status without the stricter permission is denied, and that users status is left unchanged', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    expect(fn () => $component->set('status', UserStatus::Suspended)->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->status)->toBe(UserStatus::Active);
});

test('changing an Administrators status with the stricter permission succeeds', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($administratorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('status', UserStatus::Suspended)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->status)->toBe(UserStatus::Suspended);
});

test('changing an Administrators email without the stricter permission is denied, and that users email is left unchanged', function () {
    $this->withoutExceptionHandling();
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['email' => 'admin.target@arospe.es']);
    $target->assignRole($administratorRole);

    $component = Livewire::test(Index::class)->call('openEditModal', $target->id);

    expect(fn () => $component->set('email', 'attacker@arospe.es')->call('save'))
        ->toThrow(AuthorizationException::class);

    expect($target->fresh()->email)->toBe('admin.target@arospe.es')
        ->and($target->fresh()->pending_email)->toBeNull();
});

test('changing an Administrators email with the stricter permission succeeds and holds it as pending', function () {
    Notification::fake();

    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $administrator->givePermissionTo('roles.manage-administrators');
    $this->actingAs($administrator);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create(['email' => 'admin.target@arospe.es']);
    $target->assignRole($administratorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('email', 'new.address@arospe.es')
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->email)->toBe('admin.target@arospe.es')
        ->and($target->fresh()->pending_email)->toBe('new.address@arospe.es');

    Notification::assertSentOnDemandTimes(PendingEmailVerification::class, 1);
});

// Over-blocking regression: a non-Administrator target's status/email changes must not
// require the stricter permission -- only an Administrator-holding target does.

test('changing a non-Administrators status does not require the stricter permission', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator'); // lacks roles.manage-administrators
    $this->actingAs($administrator);

    $editorRole = Role::create(['name' => 'Editor', 'guard_name' => 'web']);
    $target = User::factory()->create(['status' => UserStatus::Active]);
    $target->assignRole($editorRole);

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('status', UserStatus::Suspended)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->status)->toBe(UserStatus::Suspended);
});

test('a Super Admin actor can promote a user to Administrator without holding roles.manage-administrators explicitly', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    $administratorRole = Role::where('name', 'Administrator')->where('guard_name', 'web')->firstOrFail();
    $target = User::factory()->create();

    Livewire::test(Index::class)
        ->call('openEditModal', $target->id)
        ->set('roleId', (string) $administratorRole->id)
        ->call('save')
        ->assertHasNoErrors();

    expect($target->fresh()->hasRole('Administrator'))->toBeTrue();
});

// --- Malformed / unknown ids handled by the component itself ---

test('openEditModal fails cleanly for an unknown id', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $unknownId = (string) Str::uuid7();

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', $unknownId))
        ->toThrow(ModelNotFoundException::class);
});

test('openEditModal fails cleanly for a malformed id', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    expect(fn () => Livewire::test(Index::class)->call('openEditModal', 'not-a-uuid'))
        ->toThrow(ModelNotFoundException::class);
});

test('confirmDelete fails cleanly for an unknown id', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $unknownId = (string) Str::uuid7();

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', $unknownId))
        ->toThrow(ModelNotFoundException::class);
});

test('confirmDelete fails cleanly for a malformed id', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    expect(fn () => Livewire::test(Index::class)->call('confirmDelete', 'not-a-uuid'))
        ->toThrow(ModelNotFoundException::class);
});

// --- Spatie permission cache freshness (revocation direction) ---

test('revoking a permission via a role change is reflected immediately, not masked by a stale cache', function () {
    $limitedRole = Role::create(['name' => 'Limited Role', 'guard_name' => 'web']);
    $limitedRole->givePermissionTo(['products.view']); // deliberately withholds products.delete

    $user = User::factory()->create();
    $user->assignRole('Administrator'); // Administrator holds products.delete

    expect($user->hasPermissionTo('products.delete'))->toBeTrue();

    $user->syncRoles([$limitedRole]);

    // No forgetCachedPermissions() call here, between Act and Assert: if a stale cache were
    // masking the revocation, this assertion -- not a call the test makes for it -- is what
    // must catch it.
    expect($user->fresh()->hasPermissionTo('products.delete'))->toBeFalse();
});

// =====================================================================
// $this->get(route('users.index'))
// =====================================================================

test('guests are redirected to the login page when visiting the users screen', function () {
    $this->get(route('users.index'))->assertRedirect(route('login'));
});

test('a user without users.view is forbidden from the users screen', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('users.index'))->assertForbidden();
});

test('a user holding users.view can reach the users screen', function () {
    $administrator = User::factory()->create();
    $administrator->assignRole('Administrator');
    $this->actingAs($administrator);

    $this->get(route('users.index'))->assertOk();
});

test('a Super Admin can reach the users screen', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Admin');
    $this->actingAs($superAdmin);

    $this->get(route('users.index'))->assertOk();
});
